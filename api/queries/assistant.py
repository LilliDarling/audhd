import re
import os
import anthropic
from typing import List, Dict, Any
from openai import OpenAI

from models.assistant import AssistantMessage, AssistantResponse, TaskBreakdown
from queries.calendar import CalendarQueries
from queries.tasks import TaskQueries
from utils.exceptions import handle_database_operation
from models.tasks import Task
from config.database import engine


class ADHDAssistantQueries:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

    def _create_system_prompt(self, tasks: List[Task], has_calendar: bool) -> str:
        prompt = """You are a supportive ADHD-focused productivity assistant. Your role is to help users with ADHD manage their tasks, time, and energy levels. Remember that ADHD affects executive function, making task initiation, time management, and maintaining focus challenging.

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
        - Minimize decision fatigue

        Use these markers in your responses:
        BREAKDOWN: for task breakdowns
        QUICK_WIN: for immediate, achievable actions
        TIME_TIP: for time management strategies
        FOCUS: for attention/focus support
        EF_SUPPORT: for executive function strategies
        ENVIRONMENT: for space/setting adjustments
        CALENDAR: for scheduling suggestions
        START_NOW: for immediate task initiation help

        Format task breakdowns with:
        - Clear visual separation between steps
        - Numbered sequences for order-dependent tasks
        - Bullet points for flexible-order tasks
        - Emojis for task categories/types
        - Time estimates for each step (accounting for ADHD tax)

        Current user context:"""
            
        if tasks:
            prompt += "\nExisting tasks:\n"
            for task in tasks:
                prompt += f"- {task.title} (Priority: {task.priority}, Status: {task.status})\n"
        
        if has_calendar:
            prompt += "\nGoogle Calendar is connected for time-blocking and reminders."
        
        return prompt
    
    @handle_database_operation("saving message")
    async def save_message(
        self, 
        user_id: str, 
        content: str, 
        message_type: str = "user"
    ) -> AssistantMessage:
        message = AssistantMessage(
            user_id=user_id,
            content=content,
            type=message_type
        )
        await engine.save(message)
        return message
    
    @handle_database_operation("retrieving conversation history")
    async def get_conversation_history(
        self, 
        user_id: str, 
        limit: int = 10
    ) -> List[AssistantMessage]:
        messages = await engine.find(
            AssistantMessage,
            AssistantMessage.user_id == user_id,
            sort=AssistantMessage.timestamp.desc(),
            limit=limit
        )
        return list(reversed(messages))

    async def process_message(
        self,
        user_id: str,
        content: str,
        task_queries: TaskQueries,
        calendar_queries: CalendarQueries
    ) -> AssistantResponse:
        await self.save_message(user_id, content, "user")
        
        tasks = await task_queries.get_tasks(user_id)
        calendar_creds = await calendar_queries.get_credentials(user_id)
        history = await self.get_conversation_history(user_id)
        
        system_prompt = self._create_system_prompt(tasks, bool(calendar_creds))
        messages = self._create_chat_messages(system_prompt, history)
        
        response = await self.client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            temperature=0.7,
            system=system_prompt,
            messages=messages
        )
        
        assistant_message = response.content[0].text
        
        saved_message = await self.save_message(
            user_id, 
            assistant_message, 
            "assistant"
        )
        
        suggestions = self._extract_adhd_suggestions(assistant_message)
        
        return AssistantResponse.from_mongo(saved_message, suggestions)

    def _extract_adhd_suggestions(self, response: str) -> Dict[str, Any]:
        suggestions = {
            "tasks": [],
            "calendar_events": [],
            "dopamine_boosters": [],
            "focus_tips": [],
            "ef_supports": [],
            "environment_tips": [],
            "task_breakdown": None
        }
        
        current_section = None
        breakdown_data = {
            "subtasks": [],
            "initiation_tips": [],
            "dopamine_hooks": [],
            "break_points": []
        }
        
        for line in response.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            if line.startswith("BREAKDOWN:"):
                current_section = "breakdown"
                breakdown_data["main_task"] = line.replace("BREAKDOWN:", "").strip()
            elif line.startswith("- ") and current_section == "breakdown":
                breakdown_data["subtasks"].append(line.replace("- ", ""))
            elif line.startswith("QUICK_WIN:"):
                suggestions["dopamine_boosters"].append(line.replace("QUICK_WIN:", "").strip())
            elif line.startswith("START_NOW:"):
                breakdown_data["initiation_tips"].append(line.replace("START_NOW:", "").strip())
            elif line.startswith("TIME_TIP:"):
                try:
                    time_str = line.replace("TIME_TIP:", "").strip()
                    if "estimated_time" not in breakdown_data:
                        breakdown_data["estimated_time"] = int(re.search(r'\d+', time_str).group())
                except:
                    pass
            elif line.startswith("FOCUS:"):
                suggestions["focus_tips"].append(line.replace("FOCUS:", "").strip())
            elif line.startswith("EF_SUPPORT:"):
                suggestions["ef_supports"].append({
                    "strategy": line.replace("EF_SUPPORT:", "").strip(),
                    "category": "task_initiation" if "start" in line.lower() else "organization"
                })
            elif line.startswith("ENVIRONMENT:"):
                suggestions["environment_tips"].append(line.replace("ENVIRONMENT:", "").strip())
            elif line.startswith("CALENDAR:"):
                suggestions["calendar_events"].append(line.replace("CALENDAR:", "").strip())
        
        if breakdown_data.get("main_task"):
            suggestions["task_breakdown"] = TaskBreakdown(
                main_task=breakdown_data["main_task"],
                subtasks=breakdown_data["subtasks"],
                estimated_time=breakdown_data.get("estimated_time", 30),
                difficulty_level=2,
                energy_level_needed=2,
                context_switches=len(set(s.split()[0] for s in breakdown_data["subtasks"])),
                initiation_tips=breakdown_data["initiation_tips"],
                dopamine_hooks=breakdown_data["dopamine_hooks"],
                break_points=[i for i, s in enumerate(breakdown_data["subtasks"]) 
                            if i > 0 and i % 3 == 0]  # Suggest breaks every 3 subtasks
            )
        
        return suggestions
    
    async def process_voice(
        self,
        user_id: str,
        voice_data: str,
        task_queries: TaskQueries,
        calendar_queries: CalendarQueries
    ) -> AssistantResponse:
        openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        audio_file = self._prepare_audio_file(voice_data)
        transcript = await openai_client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
        
        return await self.process_message(
            user_id,
            transcript.text,
            task_queries,
            calendar_queries
        )

    def _create_chat_messages(
        self, 
        system_prompt: str, 
        history: List[AssistantMessage]
    ) -> List[Dict[str, str]]:
        messages = []
        
        for msg in history:
            messages.append({
                "role": "user" if msg.type == "user" else "assistant",
                "content": msg.content
            })
        
        return messages
    
    def _extract_suggestions(self, response: str) -> Dict[str, Any]:
        suggestions = {
            "tasks": [],
            "calendar_events": []
        }
        
        for line in response.split('\n'):
            if line.strip().startswith("TASK:"):
                suggestions["tasks"].append(line.replace("TASK:", "").strip())
            elif line.strip().startswith("CALENDAR:"):
                suggestions["calendar_events"].append(line.replace("CALENDAR:", "").strip())
            
        return suggestions

    def _prepare_audio_file(self, base64_audio: str) -> bytes:
        # Convert base64 to bytes and prepare for Whisper API
        import base64
        import tempfile
        
        audio_bytes = base64.b64decode(base64_audio)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.write(audio_bytes)
        temp_file.close()
        
        return open(temp_file.name, 'rb')