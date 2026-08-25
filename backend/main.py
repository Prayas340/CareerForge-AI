import os
import shutil
import uuid
from typing import Dict, Any, List, Optional
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .config import BASE_DIR, UPLOAD_DIR, OUTPUT_DIR, HOST, PORT, DEBUG
from .parser import parse_resume_document
from .gemini_agents import (
    agent_extract_structured_cv,
    agent_rate_cv,
    agent_rewrite_cv,
    agent_generate_ai_design,
    agent_coach_chat,
    fallback_extract_cv,
    fallback_rate_cv,
    fallback_rewrite_cv
)
from .jobs_db import DEFAULT_JOBS_DATABASE, calculate_job_matches
from .vector_rag import vector_rag_engine
from .pdf_engine import compile_resume_pdf

# Initialize FastAPI application
app = FastAPI(
    title="CareerForge AI API",
    description="Multi-Agent RAG Resume Engineering & Job Matching Platform",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store
SESSIONS: Dict[str, Dict[str, Any]] = {}

# Initialize Vector RAG Index with initial jobs
vector_rag_engine.index_jobs(DEFAULT_JOBS_DATABASE)


# Request Models
class RegenerateRequest(BaseModel):
    session_id: str
    style_archetype: str = "Executive"
    color_palette: str = "teal"
    custom_edits: Optional[Dict[str, Any]] = None

class AIDesignRequest(BaseModel):
    session_id: str
    prompt_hint: Optional[str] = ""
    custom_edits: Optional[Dict[str, Any]] = None

class CoachChatRequest(BaseModel):
    session_id: str
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []

class PDFDownloadRequest(BaseModel):
    session_id: str
    style_archetype: str = "Executive"
    color_palette: str = "teal"
    cv_data: Optional[Dict[str, Any]] = None

class SampleResumeRequest(BaseModel):
    sample_id: str = "alex_morgan"


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "CareerForge AI", "version": "1.0.0"}


from concurrent.futures import ThreadPoolExecutor

@app.post("/api/upload")
def upload_resume(file: UploadFile = File(...)):
    """Upload resume file (.pdf, .docx, .txt), extract, rate, rewrite, and match jobs."""
    raw_text = ""
    try:
        session_id = str(uuid.uuid4())
        file_ext = Path(file.filename).suffix.lower()
        saved_file_path = UPLOAD_DIR / f"{session_id}_{file.filename}"
        
        with open(saved_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 1. Document Parsing
        parse_result = parse_resume_document(str(saved_file_path))
        raw_text = parse_result.get("raw_text", "")

        # 2. Agent 1: Structured Entity Extraction (Strict Anti-Hallucination)
        structured_cv = agent_extract_structured_cv(raw_text)

        # 3. Parallel Execution of Agent 2 (Rating), Agent 3 (Rewrite), and Agent 4 (Jobs)
        with ThreadPoolExecutor(max_workers=3) as executor:
            f_rating = executor.submit(agent_rate_cv, structured_cv, raw_text)
            f_rewrite = executor.submit(agent_rewrite_cv, structured_cv, "Executive", "teal")
            f_jobs = executor.submit(calculate_job_matches, structured_cv, DEFAULT_JOBS_DATABASE)

            rating_insights = f_rating.result()
            rewritten_cv = f_rewrite.result()
            matched_jobs = f_jobs.result()

        # Cache session state
        session_data = {
            "session_id": session_id,
            "filename": file.filename,
            "raw_text": raw_text,
            "structured_cv": structured_cv,
            "rating_insights": rating_insights,
            "rewritten_cv": rewritten_cv,
            "matched_jobs": matched_jobs,
            "style_archetype": "Executive",
            "color_palette": "teal"
        }
        SESSIONS[session_id] = session_data

        return {
            "success": True,
            "session_id": session_id,
            "structured_cv": structured_cv,
            "rating_insights": rating_insights,
            "rewritten_cv": rewritten_cv,
            "matched_jobs": matched_jobs
        }
    except Exception as e:
        print(f"[Upload Fallback Recovery] {e}")
        try:
            fallback_cv = fallback_extract_cv(raw_text or "Candidate Resume\nProfessional Experience")
            fallback_rating = fallback_rate_cv(fallback_cv)
            fallback_rw = fallback_rewrite_cv(fallback_cv, "Executive", "teal")
            fallback_j = calculate_job_matches(fallback_cv, DEFAULT_JOBS_DATABASE)
            session_id = str(uuid.uuid4())
            SESSIONS[session_id] = {
                "session_id": session_id,
                "structured_cv": fallback_cv,
                "rating_insights": fallback_rating,
                "rewritten_cv": fallback_rw,
                "matched_jobs": fallback_j,
                "style_archetype": "Executive",
                "color_palette": "teal"
            }
            return {
                "success": True,
                "session_id": session_id,
                "structured_cv": fallback_cv,
                "rating_insights": fallback_rating,
                "rewritten_cv": fallback_rw,
                "matched_jobs": fallback_j
            }
        except Exception as inner_e:
            raise HTTPException(status_code=500, detail=str(inner_e))


@app.post("/api/sample-resume")
def load_sample_resume(request: SampleResumeRequest):
    """Load a pre-configured sample resume (e.g. Alex Morgan or Sarah Chen) with instant loading."""
    session_id = str(uuid.uuid4())
    sample_file = BASE_DIR / "sample_resumes" / f"sample_{request.sample_id}.txt"
    
    if not sample_file.exists():
        sample_file = BASE_DIR / "sample_resumes" / "sample_alex_morgan.txt"

    with open(sample_file, "r", encoding="utf-8") as f:
        raw_text = f.read()

    structured_cv = fallback_extract_cv(raw_text)
    rating_insights = fallback_rate_cv(structured_cv)
    rewritten_cv = fallback_rewrite_cv(structured_cv, style_archetype="Executive", palette="teal")
    matched_jobs = calculate_job_matches(structured_cv, DEFAULT_JOBS_DATABASE)

    session_data = {
        "session_id": session_id,
        "filename": sample_file.name,
        "raw_text": raw_text,
        "structured_cv": structured_cv,
        "rating_insights": rating_insights,
        "rewritten_cv": rewritten_cv,
        "matched_jobs": matched_jobs,
        "style_archetype": "Executive",
        "color_palette": "teal"
    }
    SESSIONS[session_id] = session_data

    return {
        "success": True,
        "session_id": session_id,
        "structured_cv": structured_cv,
        "rating_insights": rating_insights,
        "rewritten_cv": rewritten_cv,
        "matched_jobs": matched_jobs
    }


@app.post("/api/regenerate")
def regenerate_resume(request: RegenerateRequest):
    """Regenerate or update CV design archetype and color palette."""
    session = SESSIONS.get(request.session_id)
    if not session:
        sample_file = BASE_DIR / "sample_resumes" / "sample_alex_morgan.txt"
        with open(sample_file, "r", encoding="utf-8") as f:
            raw_text = f.read()
        structured_cv = fallback_extract_cv(raw_text)
    else:
        structured_cv = request.custom_edits or session.get("rewritten_cv") or session.get("structured_cv")

    rewritten_cv = agent_rewrite_cv(
        structured_cv,
        style_archetype=request.style_archetype,
        palette=request.color_palette
    )

    if session:
        session["rewritten_cv"] = rewritten_cv
        session["style_archetype"] = request.style_archetype
        session["color_palette"] = request.color_palette

    return {
        "success": True,
        "rewritten_cv": rewritten_cv,
        "style_archetype": request.style_archetype,
        "color_palette": request.color_palette
    }


@app.post("/api/ai-design")
def generate_ai_design(request: AIDesignRequest):
    """Dynamically generates a brand new CV design, color scheme, and recruiter-impressive narrative using Gemini API."""
    session = SESSIONS.get(request.session_id)
    if not session:
        sample_file = BASE_DIR / "sample_resumes" / "sample_alex_morgan.txt"
        with open(sample_file, "r", encoding="utf-8") as f:
            raw_text = f.read()
        structured_cv = fallback_extract_cv(raw_text)
    else:
        structured_cv = request.custom_edits or session.get("rewritten_cv") or session.get("structured_cv")

    design_res = agent_generate_ai_design(structured_cv, prompt_hint=request.prompt_hint or "")
    
    if session:
        if "rewritten_cv" in design_res:
            session["rewritten_cv"] = design_res["rewritten_cv"]
        if "archetype" in design_res:
            session["style_archetype"] = design_res["archetype"]
        if "palette" in design_res:
            session["color_palette"] = design_res["palette"]

    return {
        "success": True,
        "design": design_res,
        "rewritten_cv": design_res.get("rewritten_cv", structured_cv),
        "style_archetype": design_res.get("archetype", "Executive"),
        "color_palette": design_res.get("palette", "teal")
    }


@app.post("/api/generate-pdf")
def generate_pdf(request: PDFDownloadRequest):
    """Compile and download ReportLab PDF with selected archetype & palette."""
    session = SESSIONS.get(request.session_id)
    cv_data = request.cv_data
    if not cv_data:
        if session:
            cv_data = session.get("rewritten_cv") or session.get("structured_cv")
        else:
            sample_file = BASE_DIR / "sample_resumes" / "sample_alex_morgan.txt"
            with open(sample_file, "r", encoding="utf-8") as f:
                cv_data = fallback_extract_cv(f.read())

    pdf_path = compile_resume_pdf(
        cv_data,
        archetype=request.style_archetype,
        palette_name=request.color_palette
    )

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=Path(pdf_path).name,
        headers={"Content-Disposition": f"attachment; filename={Path(pdf_path).name}"}
    )


@app.post("/api/coach")
def chat_coach(request: CoachChatRequest):
    """Conversational Career Coach assistant endpoint."""
    session = SESSIONS.get(request.session_id, {})
    cv_context = session.get("structured_cv") or {}
    
    reply = agent_coach_chat(
        message=request.message,
        cv_context=cv_context,
        chat_history=request.chat_history or []
    )
    return {"reply": reply}


@app.get("/api/jobs")
def get_jobs(session_id: Optional[str] = None, filter_remote: bool = False, min_match: int = 0):
    """Get active jobs with calculated match scores."""
    session = SESSIONS.get(session_id) if session_id else None
    if session and "matched_jobs" in session:
        jobs = session["matched_jobs"]
    else:
        sample_cv = fallback_extract_cv("")
        jobs = calculate_job_matches(sample_cv, DEFAULT_JOBS_DATABASE)

    if filter_remote:
        jobs = [j for j in jobs if "remote" in j.get("location", "").lower()]
    if min_match > 0:
        jobs = [j for j in jobs if j.get("match_score", 0) >= min_match]

    return {"jobs": jobs, "total": len(jobs)}


FRONTEND_DIR = BASE_DIR / "frontend"

@app.get("/reset-password")
@app.get("/reset-password.html")
async def serve_reset_password():
    """Serve the dedicated password reset page."""
    reset_page = FRONTEND_DIR / "reset-password.html"
    if reset_page.exists():
        return FileResponse(str(reset_page))
    raise HTTPException(status_code=404, detail="Reset password page not found")


# Mount static files for the frontend when running locally (Vercel serves public/ directly)
if not os.getenv("VERCEL") and FRONTEND_DIR.exists():
    try:
        app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
    except Exception as e:
        print(f"Static files mount note: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=HOST, port=PORT, reload=DEBUG)
