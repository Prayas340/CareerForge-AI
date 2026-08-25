import os
import sys
import traceback
from pathlib import Path

# Add project root directory to Python path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

os.environ["VERCEL"] = "1"

try:
    from backend.main import app
except Exception:
    from fastapi import FastAPI
    from fastapi.responses import PlainTextResponse
    
    app = FastAPI()
    err_tb = traceback.format_exc()
    
    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    def catch_startup_error(path: str):
        return PlainTextResponse(f"FastAPI Startup Error on Vercel:\n\n{err_tb}", status_code=500)
