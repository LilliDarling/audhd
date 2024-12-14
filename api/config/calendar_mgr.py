import os
import firebase_admin
from pathlib import Path
from cryptography.fernet import Fernet
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from dotenv import load_dotenv
from firebase_admin import auth, credentials
from typing import Optional


env_path = Path('.') / '.env' / 'api.env'
load_dotenv(env_path)

class CalendarTokenManager:
    def __init__(self):
        encryption_key = os.environ.get("ENCRYPTION_KEY")
        if not encryption_key:
            raise ValueError("ENCRYPTION_KEY not found in environment variables")
        
        try:
            self.fernet = Fernet(encryption_key.strip().encode())
        except Exception as e:
            raise ValueError(f"Invalid encryption key format: {str(e)}")

        if not firebase_admin._apps:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": os.environ.get("FIREBASE_PROJECT_ID"),
                "private_key": os.environ.get("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
                "client_email": os.environ.get("FIREBASE_CLIENT_EMAIL"),
            })
            firebase_admin.initialize_app(cred)

    def encrypt_token(self, token: str) -> str:
        if not token:
            raise ValueError("Token cannot be empty")
        return self.fernet.encrypt(token.encode()).decode()

    def decrypt_token(self, encrypted_token: str) -> str:
        if not encrypted_token:
            raise ValueError("Encrypted token cannot be empty")
        return self.fernet.decrypt(encrypted_token.encode()).decode()

    async def verify_firebase_token(self, firebase_token: str) -> dict:
        try:
            decoded_token = auth.verify_id_token(firebase_token)
            return decoded_token
        except Exception as e:
            raise ValueError(f"Invalid Firebase token: {str(e)}")

    def create_credentials_from_firebase(self, firebase_user_data: dict) -> Optional[Credentials]:
        if 'firebase' not in firebase_user_data:
            return None

        provider_data = firebase_user_data.get('providerData', [])
        google_data = next((p for p in provider_data if p.get('providerId') == 'google.com'), None)
        
        if not google_data:
            return None

        return Credentials(
            token=google_data.get('accessToken'),
            refresh_token=google_data.get('refreshToken'),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.environ.get("GOOGLE_CLIENT_ID"),
            client_secret=os.environ.get("GOOGLE_CLIENT_SECRET"),
            scopes=['https://www.googleapis.com/auth/calendar']
        )

def create_calendar_service(credentials: Credentials):
    return build('calendar', 'v3', credentials=credentials)