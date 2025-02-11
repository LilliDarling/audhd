import os
import structlog
import json
from anthropic import Anthropic
from datetime import datetime, timezone
from typing import Optional

from models.usage import UserAPIUsage
from models.tasks import Task, TaskBreakdown, TaskCache
from config.database import engine


logger = structlog.get_logger()

class TaskAnalyzer:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        if not os.getenv("ANTHROPIC_API_KEY"):
            logger.error("missing_api_key", key="ANTHROPIC_API_KEY")
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        
        self.internal_daily_limit = 20
        self.displayed_daily_limit = 10
        
        self.system_prompt = """You are an ADHD task assistant. Your role is to help users with ADHD manage their tasks, time, and energy levels. Remember that ADHD affects executive function, making task initiation, time management, and maintaining focus challenging. Break down tasks into clear, actionable steps. Focus on:
        1. Task Initiation Support
        2. Simple, concrete starting steps
        3. Executive function support
        4. Clear completion signals
        5. Built-in rewards
        6. Realistic time estimates
        7. When to take breaks"""

    async def check_rate_limit(self, user_id: str) -> bool:
        """Checks a users usage and sets a limit for task breakdown generations each day"""
        logger.info("checking_rate_limit", user_id=user_id)
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        usage = await engine.find_one(
            UserAPIUsage, 
            UserAPIUsage.user_id == user_id,
            UserAPIUsage.date == today
        )

        if not usage:
            logger.info("creating_new_usage_record", user_id=user_id)
            usage = UserAPIUsage(
                user_id=user_id,
                date=today,
                generation_count=0
            )
            await engine.save(usage)

        if usage.generation_count >= self.internal_daily_limit:
            logger.warning("rate_limit_exceeded", user_id=user_id, count=usage.generation_count)
            return False

        usage.generation_count += 1
        usage.last_updated = datetime.now(timezone.utc)
        await engine.save(usage)
        
        logger.info(
            "rate_limit_check_passed", 
            user_id=user_id, 
            count=usage.generation_count
        )
        return True

    async def _get_cached_breakdown(self, task_key: str) -> Optional[str]:
        """Get breakdown from MongoDB cache"""
        logger.debug("checking_cache", task_key=task_key)
        try:
            cache_entry = await engine.find_one(
                TaskCache, 
                TaskCache.task_key == task_key
            )
            if cache_entry:
                logger.info("cache_hit", task_key=task_key)
                return cache_entry.breakdown
            logger.info("cache_miss", task_key=task_key)
        except Exception as e:
            logger.error("cache_access_error", error=str(e), task_key=task_key)
        return None
    
    async def _save_to_cache(self, task_key: str, breakdown_str: str) -> None:
        """Save breakdown to MongoDB cache"""
        logger.debug("saving_to_cache", task_key=task_key)
        try:
            cache_entry = TaskCache(
                task_key=task_key,
                breakdown=breakdown_str
            )
            await engine.save(cache_entry)
            logger.info("saved_to_cache", task_key=task_key)
        except Exception as e:
            logger.error("cache_save_error", error=str(e), task_key=task_key)

    async def get_task_breakdown(self, task: Task) -> Optional[TaskBreakdown]:
        """Get task breakdown from cache or generate new one"""
        log = logger.bind(
            user_id=task.user_id,
            task_title=task.title
        )
        log.info("getting_task_breakdown")

        if not await self.check_rate_limit(task.user_id):
            log.warning("rate_limit_exceeded")
            raise ValueError(f"Daily generation limit of {self.daily_limit} reached. Please try again tomorrow.")
        
        task_key = f"{task.title.lower().strip()}:{task.description.lower().strip()}"
        
        cached_data = await self._get_cached_breakdown(task_key)
        if cached_data:
            try:
                log.info("using_cached_breakdown")
                return TaskBreakdown(**json.loads(cached_data))
            except json.JSONDecodeError as e:
                log.error("cache_decode_error", error=str(e))
                return None

        try:
            breakdown = await self._generate_breakdown(task)
            if breakdown:
                    cached_str = json.dumps(breakdown.model_dump())
                    await self._save_to_cache(task_key, cached_str)
                    log.info("generated_new_breakdown")
            return breakdown
        except Exception as e:
            log.error("breakdown_generation_error", error=str(e))
            return None

    async def _generate_breakdown(self, task: Task) -> Optional[TaskBreakdown]:
        """Generate new task breakdown using Claude"""
        log = logger.bind(
            user_id=task.user_id,
            task_title=task.title
        )
        log.info("generating_breakdown")

        try:
            context_info = ""
            if task.context:
                context_info = f"""Energy Level: {task.context.energy_level}/3
                Time: {task.context.time_of_day}
                Location: {task.context.environment}
                Medicated: {"Yes" if task.context.current_medications else "No"}
                """

            prompt = {
                "role": "user",
                "content": f"""Break down this task for someone with ADHD:
                Task: {task.title}
                Description: {task.description}
                Priority: {task.priority}
                {context_info}

                Consider context when suggesting steps, breaks, and setup.

                Provide a JSON response with:
                {{
                    "steps": [
                        {{
                            "description": "Clear, specific action",
                            "time_estimate": minutes,
                            "initiation_tip": "How to start this step",
                            "completion_signal": "How to know it's done",
                            "dopamine_hook": "Built-in reward"
                        }}
                    ],
                    "suggested_breaks": [step numbers for breaks],
                    "initiation_strategy": "How to start overall task",
                    "energy_level_needed": 1-3,
                    "materials_needed": ["item1", "item2"],
                    "environment_setup": "One clear setup instruction"
                }}"""
            }

            response = self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=2000,
                temperature=0.3,
                system=self.system_prompt,
                messages=[prompt]
            )

            content = response.content[0].text
            try:
                data = json.loads(content)
                log.info("breakdown_generated_successfully")
                return TaskBreakdown(**data)
            except json.JSONDecodeError:
                log.error("json_parse_error", content=content[:100])
                return None

        except Exception as e:
            log.error("breakdown_generation_error", error=str(e))
            return None