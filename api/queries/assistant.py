import re
import os
import logging
import traceback
import requests
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from openai import OpenAI  # Keep for voice transcription

from models.assistant import AssistantMessage, AssistantResponse, TaskBreakdown
from queries.calendar import CalendarQueries
from queries.tasks import TaskQueries
from utils.exceptions import handle_database_operation
from models.tasks import Task
from config.database import engine

logger = logging.getLogger(__name__)

class ADHDAssistantQueries:
    def __init__(self):
      print("Initializing ADHDAssistantQueries")
      self.api_url = "http://ollama:11434/api/generate"
      self.model = "llama2"  # Base model is better for testing
      print("Starting model pull...")
      self._ensure_model()
    
    def _ensure_model(self):
      """Pull the model if not already present"""
      try:
          response = requests.post(
              "http://ollama:11434/api/pull",
              json={
                  "name": self.model,
                  "stream": False
              }
          )
          if response.status_code == 200:
              print(f"Model {self.model} ready")
          else:
              print(f"Error pulling model: {response.status_code}")
              print(f"Response: {response.text}")
      except Exception as e:
          print(f"Exception during model pull: {e}")

    async def _get_model_response(self, prompt: str, history: List[Dict[str, str]] = None) -> Optional[str]:
      try:
          # Format history and prompt
          formatted_messages = ""
          if history:
              for msg in history:
                  role = "Human" if msg["role"] == "user" else "Assistant"
                  formatted_messages += f"{role}: {msg['content']}\n"
              
          full_prompt = f"{prompt}\n\n{formatted_messages}Assistant:"

          print(f"Sending request to Ollama with prompt length: {len(full_prompt)}")
          response = requests.post(
              self.api_url,
              json={
                  "model": self.model,
                  "prompt": full_prompt,
                  "stream": False,
                  "options": {
                      "temperature": 0.7,
                      "num_predict": 1000,
                      "stop": ["Human:", "Assistant:"]  # Add stop sequences
                  }
              }
          )
          print(f"Got response status: {response.status_code}")
          
          if response.status_code == 200:
              data = response.json()
              if "error" in data:
                  print(f"Error in response: {data['error']}")
                  return None
              return data['response']
          else:
              print(f"Error from Ollama API: {response.text}")
              return None
              
      except Exception as e:
          print(f"Error getting model response: {str(e)}")
          print(f"Full traceback: {traceback.format_exc()}")
          return None
        
    def _create_system_prompt(self, tasks: List[Task], has_calendar: bool) -> str:
        # Keep your existing prompt creation method
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
        
        return prompt

    @handle_database_operation("saving message")
    async def save_message(self, user_id: str, content: str, message_type: str = "user") -> AssistantMessage:
        message = AssistantMessage(
            user_id=user_id,
            content=content,
            type=message_type,
            timestamp=datetime.now(timezone.utc)
        )
        await engine.save(message)
        return message

    @handle_database_operation("retrieving conversation history")
    async def get_conversation_history(self, user_id: str, limit: int = 10) -> List[AssistantMessage]:
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
        print(f"=== Processing message in ADHDAssistantQueries ===")
        print(f"User ID: {user_id}")
        print(f"Content: {content}")

        try:
            await self.save_message(user_id, content, "user")
            tasks = await task_queries.get_tasks(user_id)
            has_calendar = False
            history = await self.get_conversation_history(user_id)

            print(f"Found {len(tasks)} tasks")
            print(f"History length: {len(history)}")
            
            system_prompt = self._create_system_prompt(tasks, has_calendar)
            messages = self._create_chat_messages(system_prompt, history)
            
            print("Calling Ollama API...")
            assistant_message = await self._get_model_response(system_prompt, messages)
            
            if not assistant_message:
                raise Exception("Failed to get model response")
            
            print("Got response from Ollama")
            
            saved_message = await self.save_message(
                user_id, 
                assistant_message, 
                "assistant"
            )
            
            suggestions = self._extract_adhd_suggestions(assistant_message)
            result = AssistantResponse.from_mongo(saved_message, suggestions)
            print("Successfully processed message")
            
            return result
        except Exception as e:
            print(f"Error in process_message: {str(e)}")
            print(f"Error type: {type(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            raise

    def _extract_adhd_suggestions(self, response: str) -> Dict[str, Any]:
        # Keep your existing suggestion extraction logic
        suggestions = {
            "tasks": [],
            "calendar_events": [],
            "dopamine_boosters": [],
            "focus_tips": [],
            "ef_supports": [],
            "environment_tips": [],
            "task_breakdown": None
        }
        # [Rest of your existing extraction code]
        return suggestions

    async def process_voice(
        self,
        user_id: str,
        voice_data: str,
        task_queries: TaskQueries,
        calendar_queries: CalendarQueries
    ) -> AssistantResponse:
        # Keep OpenAI for voice transcription since it works well
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

    def _prepare_audio_file(self, base64_audio: str) -> bytes:
        # Keep your existing audio file preparation code
        import base64
        import tempfile
        
        audio_bytes = base64.b64decode(base64_audio)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.write(audio_bytes)
        temp_file.close()
        
        return open(temp_file.name, 'rb')