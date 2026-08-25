from http.server import BaseHTTPRequestHandler
import json
import traceback
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

os.environ["VERCEL"] = "1"

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        
        diag = {}
        diag["python_version"] = sys.version
        
        modules_to_test = [
            "backend.config",
            "backend.parser",
            "backend.vector_rag",
            "backend.jobs_db",
            "backend.gemini_agents",
            "backend.pdf_engine",
            "backend.main"
        ]
        
        for mod in modules_to_test:
            try:
                __import__(mod)
                diag[mod] = "OK"
            except Exception as e:
                diag[mod] = {
                    "error": str(e),
                    "traceback": traceback.format_exc()
                }
                break
                
        self.wfile.write(json.dumps(diag, indent=2).encode("utf-8"))
