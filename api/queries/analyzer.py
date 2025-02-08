import logging
import os
from anthropic import Anthropic
from datetime import datetime, timezone
from models.usage import UserAPIUsage
from config.database import engine
from models.tasks import Task, TaskBreakdown, TaskCache
from typing import Optional
import json

logger = logging.getLogger(__name__)

class TaskAnalyzer:
    def __init__(self):
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        if not os.getenv("ANTHROPIC_API_KEY"):
            raise ValueError("ANTHROPIC_API_KEY not found in environment variables")
        
        self.daily_limit = 10
        
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
        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        
        usage = await engine.find_one(
            UserAPIUsage, 
            UserAPIUsage.user_id == user_id,
            UserAPIUsage.date == today
        )

        if not usage:
            usage = UserAPIUsage(
                user_id=user_id,
                date=today,
                generation_count=0
            )
            await engine.save(usage)

        if usage.generation_count >= self.daily_limit:
            return False

        usage.generation_count += 1
        usage.last_updated = datetime.now(timezone.utc)
        await engine.save(usage)
        
        return True

    async def _get_cached_breakdown(self, task_key: str) -> Optional[str]:
        """Get breakdown from MongoDB cache"""
        try:
            cache_entry = await engine.find_one(
                TaskCache, 
                TaskCache.task_key == task_key
            )
            if cache_entry:
                return cache_entry.breakdown
        except Exception as e:
            logger.error(f"Error accessing cache: {e}")
        return None
    
    async def _save_to_cache(self, task_key: str, breakdown_str: str) -> None:
        """Save breakdown to MongoDB cache"""
        try:
            cache_entry = TaskCache(
                task_key=task_key,
                breakdown=breakdown_str
            )
            await engine.save(cache_entry)
        except Exception as e:
            logger.error(f"Error saving to cache: {e}")

    async def get_task_breakdown(self, task: Task) -> Optional[TaskBreakdown]:
        """Get task breakdown from cache or generate new one"""
        if not await self.check_rate_limit(task.user_id):
            raise ValueError(f"Daily generation limit of {self.daily_limit} reached. Please try again tomorrow.")
        
        task_key = f"{task.title.lower().strip()}:{task.description.lower().strip()}"
        
        # Try to get from cache
        cached_data = await self._get_cached_breakdown(task_key)
        if cached_data:
            try:
                return TaskBreakdown(**json.loads(cached_data))
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding cached breakdown: {str(e)}")
                # Invalidate bad cache entry
                return None

        try:
        # Generate new breakdown
            breakdown = await self._generate_breakdown(task)
            if breakdown:
                    # Update cache
                    cached_str = json.dumps(breakdown.model_dump())
                    await self._save_to_cache(task_key, cached_str)
            return breakdown
        except Exception as e:
            logger.error(f"Error generating task breakdown: {str(e)}")
            return None

    async def _generate_breakdown(self, task: Task) -> Optional[TaskBreakdown]:
        """Generate new task breakdown using Claude"""
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

            # Parse JSON response
            content = response.content[0].text
            try:
                data = json.loads(content)
                return TaskBreakdown(**data)
            except json.JSONDecodeError:
                logger.error("Error parsing JSON response from Claude")
                return None

        except Exception as e:
            logger.error(f"Error generating task breakdown: {e}")
            return None