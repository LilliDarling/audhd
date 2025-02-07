import os
import shutil
os.environ["HF_HOME"] = "/root/.cache/huggingface/transformers"

import asyncio
import gc
import psutil
import torch
import json
import logging
import bitsandbytes
from accelerate import Accelerator
from transformers import AutoModelForCausalLM, AutoTokenizer, AutoConfig
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
    _instance = None
    _is_initialized = False
    _initialization_lock = asyncio.Lock()
    model = None
    tokenizer = None
    device = None
    model_name = None
    message_cache = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ADHDAssistantQueries, cls).__new__(cls)
            # Class level initialization
            cls.device = "cuda" if torch.cuda.is_available() else "cpu"
            cls.model_name = "openlm-research/open_llama_3b_v2"
        return cls._instance
    
    # def __init__(self):
    #     logger.info("Initializing ADHDAssistant")
    #     if not hasattr(self, 'device'):
    #         import gc
    #         gc.collect()
    #         torch.cuda.empty_cache() if torch.cuda.is_available() else None

    #         self.device = "cuda" if torch.cuda.is_available() else "cpu"
    #         self.model_name = "openlm-research/open_llama_3b_v2"
    #         self.message_cache = {}
    #         self.tokenizer = None

    def __init__(self):
        pass
    
    def __del__(self):
        if hasattr(self, 'model'):
            del self.model
        if hasattr(self, 'tokenizer'):
            del self.tokenizer
        gc.collect()
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
    
    async def initialize(self):
        """Ensure the model is initialized before use"""
        if self.__class__._is_initialized:
            return

        async with self._initialization_lock:
            # Double check in case another request initialized while waiting
            if self.__class__._is_initialized:
                return
                
            try:
                await self._load_model()
                self.__class__._is_initialized = True
                logger.info("Model initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize ADHDAssistant: {e}")
                self.__class__._is_initialized = False
                raise

    
    async def _load_model(self):
        try:
            print(f"Loading model {self.model_name} on {self.device}")
            cache_dir = "/root/.cache/huggingface/transformers"
            offload_folder = "/tmp/model_offload"
            os.makedirs(offload_folder, exist_ok=True)

            try:
                torch.set_num_threads(4)

                self.__class__.tokenizer = AutoTokenizer.from_pretrained(
                    self.__class__.model_name,
                    token=os.getenv('HF_TOKEN'),
                    cache_dir=cache_dir,
                    local_files_only=False,
                    use_fast=True,
                )

                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token

                self.__class__.model = AutoModelForCausalLM.from_pretrained(
                    self.__class__.model_name,
                    token=os.getenv('HF_TOKEN'),
                    cache_dir=cache_dir,
                    torch_dtype=torch.float32,
                    low_cpu_mem_usage=True
                )
                
                # Apply dynamic quantization after loading
                self.__class__.model = torch.quantization.quantize_dynamic(
                    self.model,
                    {torch.nn.Linear},  # Quantize linear layers
                    dtype=torch.qint8
                )

                # self.__class__.model = AutoModelForCausalLM.from_pretrained(
                #     self.__class__.model_name,
                #     token=os.getenv('HF_TOKEN'),
                #     cache_dir=cache_dir,
                #     local_files_only=False,
                #     torch_dtype=torch.float32,
                #     device_map=device_map,
                #     max_memory={'cpu': '4GB', 'disk': '20GB'},
                #     offload_folder=offload_folder,
                #     low_cpu_mem_usage=True,
                # )

                logger.info("Model loaded successfully")

                # test_input = "Hello"
                # inputs = self.tokenizer(test_input, return_tensors="pt")
                # inputs = {k: v.to(self.device) for k, v in inputs.items()}

                # with torch.no_grad():
                #     output = self.model.generate(**inputs, max_length=10)
                #     logger.info(f"Test output: {self.tokenizer.decode(output[0])}")
                
                # logger.info("Model test successful")

            except Exception as e:
                logger.error(f"Tokenizer/Model loading error: {str(e)}")
                raise
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise

    async def _get_model_response(self, prompt: str, history: List[Dict[str, str]] = None) -> Optional[str]:
        print(f"=== Getting Model Response ===")
        # cache_key = f"{prompt}_{json.dumps(history) if history else ''}"
        # if cache_key in self.message_cache:
        #     return self.message_cache[cache_key]
        torch.cuda.empty_cache() if torch.cuda.is_available() else None
        gc.collect()
        try:
            recent_history = history[-1:] if history else []
            formatted_messages = ''.join(
                f"{msg['role'].title()}: {msg['content']}\n" 
                for msg in recent_history
            )
            
            print(f"Formatted messages")
            full_prompt = f"{prompt}\n\n{formatted_messages}Assistant:"

            inputs = self.tokenizer(full_prompt, return_tensors="pt", padding=True, truncation=True, max_length=128)

            print(f"Checking disk usage in offload folder...")
            print(f"Disk usage: {shutil.disk_usage('/tmp/model_offload')}")
            print(f"Tokenized length: {len(inputs['input_ids'][0])}")
            print(f"Memory before generate: {psutil.Process().memory_info().rss / 1024 / 1024:.2f} MB")

            outputs = []
        
            with torch.no_grad():
                current_output = self.model.generate(
                    **inputs,
                    max_new_tokens=30,  # Generate shorter sequences
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=False,
                    early_stopping=True
                )
                outputs.extend(current_output)
            print(f"Received outputs")

            result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            print(f"Result: {result}")

            del outputs
            torch.cuda.empty_cache() if torch.cuda.is_available() else None
            gc.collect()

            print(f"Cleaned up")
            # self.message_cache[cache_key] = result
            # print(f"Cached Result & Returning")
            return result.split("Assistant:")[-1].strip()

        except Exception as e:
            logger.error(f"Error getting model response: {str(e)}")
            return None
        
    def _create_system_prompt(self, tasks: List[Task], has_calendar: bool) -> str:
        base_prompt = """You are a supportive ADHD-focused productivity assistant. Your role is to help users with ADHD manage their tasks, time, and energy levels. Remember that ADHD affects executive function, making task initiation, time management, and maintaining focus challenging.

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

        if not tasks:
            return base_prompt

        task_context = "\nTasks:" + "".join(
            f"\n- {task.title} (P:{task.priority}, S:{task.status})"
            for task in tasks
        )
        
        # if has_calendar:
        #     base_prompt += "\nGoogle Calendar is connected for time-blocking and reminders."
        
        return base_prompt + task_context

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
        if not self._is_initialized or not self.model or not self.tokenizer:
            await self.initialize()
    
        # if not self.model or not self.tokenizer:
        #     raise RuntimeError("Model not properly initialized")

        print(f"=== Processing message in ADHDAssistantQueries ===")
        print(f"User ID: {user_id}")
        print(f"Content: {content}")

        try:
            message_future = self.save_message(user_id, content, "user")
            tasks_future = task_queries.get_tasks(user_id)
            history_future = self.get_conversation_history(user_id, limit=5)

            message, tasks, history = await asyncio.gather(
                message_future, 
                tasks_future,
                history_future
            )

            print(f"Found {len(tasks)} tasks")
            print(f"History length: {len(history)}")
            
            system_prompt = self._create_system_prompt(tasks, False)
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
            return self._create_response(saved_message, suggestions)
    
        except Exception as e:
            print(f"Error in process_message: {str(e)}")
            print(f"Error type: {type(e)}")
            raise

    def _extract_adhd_suggestions(self, response: str) -> Dict[str, Any]:
        """
        Extracts structured ADHD-specific suggestions from the model's response.
        Looks for specific markers like BREAKDOWN, QUICK_WIN, TIME_TIP, etc.
        """

        suggestions = {
            "tasks": [],
            "calendar_events": [],
            "dopamine_boosters": [],
            "focus_tips": [],
            "ef_supports": [],
            "environment_tips": [],
            "task_breakdown": None
        }
        
        # Split response into sections based on markers
        sections = response.split('\n')
        current_section = None
        task_breakdown_data = {}
        
        for line in sections:
            line = line.strip()
            if not line:
                continue
                
            # Check for section markers
            if line.startswith('BREAKDOWN:'):
                current_section = 'breakdown'
                task_breakdown_data = {
                    'main_task': line.replace('BREAKDOWN:', '').strip(),
                    'subtasks': [],
                    'estimated_time': 30,
                    'difficulty_level': 2,
                    'energy_level_needed': 2,
                    'context_switches': 1,
                    'initiation_tips': [],
                    'dopamine_hooks': [],
                    'break_points': []
                }
            elif line.startswith('QUICK_WIN:'):
                current_section = 'quick_win'
                suggestions['dopamine_boosters'].append(line.replace('QUICK_WIN:', '').strip())
            elif line.startswith('TIME_TIP:'):
                current_section = 'time'
                suggestions['calendar_events'].append({
                    'tip': line.replace('TIME_TIP:', '').strip(),
                    'type': 'time_management'
                })
            elif line.startswith('FOCUS:'):
                current_section = 'focus'
                suggestions['focus_tips'].append(line.replace('FOCUS:', '').strip())
            elif line.startswith('EF_SUPPORT:'):
                current_section = 'ef_support'
                ef_tip = line.replace('EF_SUPPORT:', '').strip()
                suggestions['ef_supports'].append({
                    'strategy': ef_tip,
                    'category': self._categorize_ef_support(ef_tip)
                })
            elif line.startswith('ENVIRONMENT:'):
                current_section = 'environment'
                suggestions['environment_tips'].append(line.replace('ENVIRONMENT:', '').strip())
            elif line.startswith('START_NOW:'):
                current_section = 'tasks'
                suggestions['tasks'].append(line.replace('START_NOW:', '').strip())
            else:
                # Process content based on current section
                if current_section == 'breakdown':
                    if line.startswith('- Time:'):
                        try:
                            task_breakdown_data['estimated_time'] = int(
                                line.replace('- Time:', '').strip().split()[0]
                            )
                        except ValueError:
                            pass
                    elif line.startswith('- Difficulty:'):
                        try:
                            task_breakdown_data['difficulty_level'] = int(
                                line.replace('- Difficulty:', '').strip().split('/')[0]
                            )
                        except ValueError:
                            pass
                    elif line.startswith('- Energy:'):
                        try:
                            task_breakdown_data['energy_level_needed'] = int(
                                line.replace('- Energy:', '').strip().split('/')[0]
                            )
                        except ValueError:
                            pass
                    elif line.startswith('- Steps:') or line.startswith('- Subtasks:'):
                        current_section = 'breakdown_steps'
                    elif line.startswith('- Break at:'):
                        try:
                            break_points = line.replace('- Break at:', '').strip()
                            task_breakdown_data['break_points'] = [
                                int(x.strip()) for x in break_points.split(',')
                            ]
                        except ValueError:
                            pass
                    elif line.startswith('- Tips:'):
                        current_section = 'breakdown_tips'
                    elif line.startswith('- Dopamine hooks:'):
                        current_section = 'breakdown_hooks'
                elif current_section == 'breakdown_steps':
                    if line.startswith('-'):
                        task_breakdown_data['subtasks'].append(line.replace('-', '').strip())
                elif current_section == 'breakdown_tips':
                    if line.startswith('-'):
                        task_breakdown_data['initiation_tips'].append(line.replace('-', '').strip())
                elif current_section == 'breakdown_hooks':
                    if line.startswith('-'):
                        task_breakdown_data['dopamine_hooks'].append(line.replace('-', '').strip())

        # Only add task breakdown if we have subtasks
        if task_breakdown_data.get('subtasks'):
            suggestions['task_breakdown'] = task_breakdown_data

        return suggestions
    
    def _categorize_ef_support(self, tip: str) -> str:
        """
        Categorizes executive function support tips based on content.
        """
        tip_lower = tip.lower()
        
        if any(word in tip_lower for word in ['start', 'begin', 'initiate']):
            return 'task_initiation'
        elif any(word in tip_lower for word in ['organize', 'arrange', 'structure']):
            return 'organization'
        elif any(word in tip_lower for word in ['plan', 'schedule', 'time']):
            return 'planning'
        elif any(word in tip_lower for word in ['focus', 'attention', 'concentrate']):
            return 'attention'
        elif any(word in tip_lower for word in ['emotion', 'feel', 'mood']):
            return 'emotional_regulation'
        elif any(word in tip_lower for word in ['memory', 'remember', 'forget']):
            return 'working_memory'
        else:
            return 'general'

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

    def _create_chat_messages(self, system_prompt: str, history: List[AssistantMessage]) -> List[Dict[str, str]]:
        messages = [{"role": "system", "content": system_prompt}]
        for msg in history:
            messages.append({
                "role": "user" if msg.type == "user" else "assistant",
                "content": msg.content
            })
        return messages
    
    def _create_response(self, message: Any, suggestions: Dict[str, Any]) -> Any:
        """
        Creates a structured response from the message and extracted suggestions.
        
        Args:
            message: AssistantMessage object containing the base response
            suggestions: Dictionary of extracted ADHD-specific suggestions
            
        Returns:
            AssistantResponse object with content and structured suggestions
        """
        # Extract task breakdown if present
        task_breakdown = None
        if suggestions.get("task_breakdown"):
            breakdown_data = suggestions["task_breakdown"]
            task_breakdown = {
                "main_task": breakdown_data.get("main_task", ""),
                "subtasks": breakdown_data.get("subtasks", []),
                "estimated_time": breakdown_data.get("estimated_time", 30),
                "difficulty_level": breakdown_data.get("difficulty_level", 2),
                "energy_level_needed": breakdown_data.get("energy_level_needed", 2),
                "context_switches": breakdown_data.get("context_switches", 1),
                "initiation_tips": breakdown_data.get("initiation_tips", []),
                "dopamine_hooks": breakdown_data.get("dopamine_hooks", []),
                "break_points": breakdown_data.get("break_points", [])
            }

        # Structure the executive function supports
        ef_supports = []
        if suggestions.get("ef_supports"):
            for support in suggestions["ef_supports"]:
                if isinstance(support, str):
                    ef_supports.append({
                        "strategy": support,
                        "category": "general"
                    })
                elif isinstance(support, dict):
                    ef_supports.append(support)

        # Create the response object matching AssistantResponse model
        response = {
            "content": message.content,
            "task_breakdown": task_breakdown,
            "suggested_tasks": suggestions.get("tasks", []),
            "calendar_suggestions": suggestions.get("calendar_events", []),
            "dopamine_boosters": suggestions.get("dopamine_boosters", []),
            "focus_tips": suggestions.get("focus_tips", []),
            "executive_function_supports": ef_supports,
            "environment_adjustments": suggestions.get("environment_tips", [])
        }

        # Remove None values for cleaner response
        return {k: v for k, v in response.items() if v is not None}

    def _prepare_audio_file(self, base64_audio: str) -> bytes:
        import base64
        import tempfile
        
        audio_bytes = base64.b64decode(base64_audio)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file.write(audio_bytes)
        temp_file.close()
        
        return open(temp_file.name, 'rb')
