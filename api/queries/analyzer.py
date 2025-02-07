import logging
import os
from anthropic import Anthropic
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
        
        self.system_prompt = """You are a supportive ADHD-focused productivity assistant. Your role is to help users with ADHD manage their tasks, time, and energy levels. Remember that ADHD affects executive function, making task initiation, time management, and maintaining focus challenging.

        Key ADHD Support Principles:
        1. Task Initiation Support:
        - Provide specific "getting started" micro-steps
        - Suggest body-doubling or accountability partners
        - Identify potential obstacles and solutions

        2. Time Management:
        - Account for time blindness in estimates
        - Include transition time between tasks
        - Suggest breaks based on energy levels
        - Use time-blocking with buffer zones

        3. Focus and Attention:
        - Minimize context switching
        - Identify optimal focus times
        - Suggest environmental modifications
        - Include dopamine-friendly reward systems

        4. Executive Function Support:
        - Break tasks into very small, concrete steps
        - Provide external structure and scaffolding
        - Include clear start/stop signals
        - Minimize decision fatigue"""


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
        task_key = f"{task.title.lower().strip()}:{task.description.lower().strip()}"
        
        # Try to get from cache
        cached_data = self._get_cached_breakdown(task_key)
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
                context_info = f"""
                Context Information:
                - Time of Day: {task.context.time_of_day}
                - Energy Level: {task.context.energy_level}/3
                - Environment: {task.context.environment}
                - Medications: {"Yes" if task.context.current_medications else "No"}
                """

            prompt = {
                "role": "user",
                "content": f"""Analyze this task and provide a structured ADHD-friendly breakdown.
                Task: {task.title}
                Description: {task.description}
                Priority: {task.priority}
                {context_info}

                Consider the context when providing suggestions. Adjust time estimates and strategies based on energy levels and environment.

                Provide a JSON response with the following structure:
                {{
                    "steps": [
                        {{
                            "description": "Gather all required materials and set up workspace",
                            "time_estimate": 5,
                            "initiation_tip": "Start by clearing your desk completely",
                            "completion_signal": "All materials are within arm's reach, workspace is clear",
                            "focus_strategy": "Remove any visible distractions from workspace",
                            "dopamine_hook": "Satisfaction of having an organized space"
                        }},
                        {{
                            "description": "Break down the main task into smaller components",
                            "time_estimate": 10,
                            "initiation_tip": "Write each component on a separate sticky note",
                            "completion_signal": "All parts of the task are written down",
                            "focus_strategy": "Use colorful sticky notes to make it visually engaging",
                            "dopamine_hook": "Feeling of progress as you create each note"
                        }},
                        {{
                            "description": "Prioritize and order the components",
                            "time_estimate": 8,
                            "initiation_tip": "Start by finding the most crucial component",
                            "completion_signal": "Sticky notes are arranged in order",
                            "focus_strategy": "Make it physical - move the notes around",
                            "dopamine_hook": "Creating visual order from chaos"
                        }},
                        {{
                            "description": "Set timers for each component",
                            "time_estimate": 5,
                            "initiation_tip": "Start with the first component",
                            "completion_signal": "Each component has a time estimate",
                            "focus_strategy": "Use a visual timer app",
                            "dopamine_hook": "Satisfaction of having a clear timeline"
                        }},
                        {{
                            "description": "Execute first component of task",
                            "time_estimate": 15,
                            "initiation_tip": "Remove all sticky notes except the current one",
                            "completion_signal": "First component deliverable is complete",
                            "focus_strategy": "Use the Pomodoro technique",
                            "dopamine_hook": "Check off the first sticky note"
                        }},
                        {{
                            "description": "Review and adjust timeline if needed",
                            "time_estimate": 5,
                            "initiation_tip": "Look at completed vs remaining components",
                            "completion_signal": "Timeline is updated",
                            "focus_strategy": "Focus only on time, not on task content",
                            "dopamine_hook": "Feeling of control over the schedule"
                        }}
                    ],
                    "suggested_breaks": [2, 4],
                    "adhd_supports": [
                        "Use body doubling for focus",
                        "Set up external accountability",
                        "Use visual timer",
                        "Create physical checkpoints"
                    ],
                    "initiation_strategy": "Start with the physical act of clearing workspace and gathering materials",
                    "energy_level_needed": 2,
                    "context_switches": 3,
                    "materials_needed": [
                        "Sticky notes",
                        "Timer",
                        "Clear workspace",
                        "Task-specific materials"
                    ],
                    "environment_setup": [
                        "Clear desk of unrelated items",
                        "Set up visual timer in view",
                        "Have water nearby",
                        "Ensure good lighting"
                    ]
                }}"""
            }

            response = await self.client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                temperature=0.5,
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