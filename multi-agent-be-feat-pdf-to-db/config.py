import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('SQLALCHEMY_DATABASE_URI')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_MIGRATE_REPO = os.path.join(os.path.dirname(__file__), 'database', 'migrations')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY') or 'secret_key'
    GROQ_API_KEY_V1 = os.getenv('GROQ_API_KEY_V1')
    GROQ_API_KEY_V2 = os.getenv('GROQ_API_KEY_V2')
