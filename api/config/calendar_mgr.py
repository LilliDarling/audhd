import os
from pathlib import Path
from cryptography.fernet import Fernet
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from supabase import create_client, Client
from dotenv import load_dotenv


env_path = Path('.') / '.env' / 'api.env'
load_dotenv(env_path)

class CalendarTokenManager:
    def __init__(self):
        # Initialize encryption
        encryption_key = os.environ.get("ENCRYPTION_KEY")
        if not encryption_key:
            raise ValueError("ENCRYPTION_KEY not found in environment variables")
        
        try:
            self.fernet = Fernet(encryption_key.strip().encode())
        except Exception as e:
            raise ValueError(f"Invalid encryption key format: {str(e)}")
        
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment variables")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)
        
        self.client_id = os.environ.get("GOOGLE_CLIENT_ID")
        self.client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")

    async def verify_session(self, access_token: str) -> dict:
        try:
            user = self.supabase.auth.get_user(access_token)
            return user.dict()
        except Exception as e:
            raise ValueError(f"Invalid session: {str(e)}")

    def encrypt_token(self, token: str) -> str:
        if not token:
            raise ValueError("Token cannot be empty")
        return self.fernet.encrypt(token.encode()).decode()

    def decrypt_token(self, encrypted_token: str) -> str:
        if not encrypted_token:
            raise ValueError("Encrypted token cannot be empty")
        return self.fernet.decrypt(encrypted_token.encode()).decode()

    def create_credentials(self, encrypted_access_token: str, encrypted_refresh_token: str) -> Credentials:
        return Credentials(
            token=self.decrypt_token(encrypted_access_token),
            refresh_token=self.decrypt_token(encrypted_refresh_token),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=self.client_id,
            client_secret=self.client_secret,
            scopes=['https://www.googleapis.com/auth/calendar']
        )

def create_calendar_service(credentials: Credentials):
    return build('calendar', 'v3', credentials=credentials)