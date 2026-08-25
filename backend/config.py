import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# Gemini API Key configuration (Loaded securely from .env or Vercel Environment Variables)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Model configurations
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "gemini-3.6-flash")
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "gemini-flash-latest")
PRO_MODEL = os.getenv("PRO_MODEL", "gemini-pro-latest")

# Server settings
HOST = os.getenv("HOST", "127.0.0.1")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

# Upload and output paths
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "generated_pdfs"
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)
