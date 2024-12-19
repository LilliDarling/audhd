import os
from pathlib import Path
from cryptography.fernet import Fernet
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv


env_path = Path('.') / '.env' / 'api.env'
load_dotenv(env_path)

class GoogleService:
    def __init__(self):
        encryption_key = os.environ.get("ENCRYPTION_KEY")
        if not encryption_key:
            raise ValueError("ENCRYPTION_KEY not found in environment variables")
        
        self.fernet = Fernet(encryption_key.encode())
        self.client_id = os.environ.get("GOOGLE_CLIENT_ID")
        self.client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")

    def encrypt_token(self, token: str) -> str:
        return self.fernet.encrypt(token.encode()).decode()

    def decrypt_token(self, encrypted_token: str) -> str:
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

def create_calendar_service(self, credentials: Credentials):
    return build('calendar', 'v3', credentials=credentials)