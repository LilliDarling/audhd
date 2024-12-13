import os
from cryptography.fernet import Fernet
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build


class CalendarTokenManager:
    def __init__(self):
        encryption_key = os.environ.get("ENCRYPTION_KEY")
        if not encryption_key:
            raise ValueError("ENCRYPTION_KEY environment variable not set")
        self.fernet = Fernet(encryption_key.encode())
        
        self.client_id = os.environ.get("GOOGLE_CLIENT_ID")
        self.client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
        if not self.client_id or not self.client_secret:
            raise ValueError("Google OAuth credentials not set in environment variables")

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

    def create_oauth_flow(self, redirect_uri: str) -> Flow:
        return Flow.from_client_config(
            {
                "web": {
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=['https://www.googleapis.com/auth/calendar'],
            redirect_uri=redirect_uri
        )

def create_calendar_service(credentials: Credentials):
    return build('calendar', 'v3', credentials=credentials)