import os
import sys
from pathlib import Path

# Add project root to sys.path
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

from backend.parser import parse_resume_document
from backend.gemini_agents import (
    agent_extract_structured_cv,
    agent_rate_cv,
    agent_rewrite_cv,
    agent_coach_chat,
    fallback_extract_cv,
    fallback_rate_cv
)
from backend.jobs_db import DEFAULT_JOBS_DATABASE, calculate_job_matches
from backend.vector_rag import vector_rag_engine
from backend.pdf_engine import compile_resume_pdf

def run_tests():
    print("========================================", flush=True)
    print("[TEST SUITE] RUNNING CAREERFORGE AI TEST SUITE", flush=True)
    print("========================================", flush=True)

    # 1. Test Ingestion & Parser
    sample_file = BASE_DIR / "sample_resumes" / "sample_alex_morgan.txt"
    print(f"\n[Test 1] Parsing Resume File: {sample_file.name}", flush=True)
    parse_result = parse_resume_document(str(sample_file))
    assert parse_result["word_count"] > 50, "Parser failed to extract words"
    print(f"  + Extracted {parse_result['word_count']} words, {parse_result['char_count']} chars", flush=True)

    # 2. Test Agent 1: Structured Entity Extraction
    print("\n[Test 2] Testing Structured Extraction Agent", flush=True)
    structured_cv = agent_extract_structured_cv(parse_result["raw_text"])
    assert "personal_info" in structured_cv, "Extraction missing personal_info"
    assert "skills" in structured_cv, "Extraction missing skills"
    assert len(structured_cv.get("work_experience", [])) > 0, "Extraction missing work_experience"
    print(f"  + Extracted Profile: {structured_cv['personal_info'].get('full_name')} - {structured_cv['personal_info'].get('title')}", flush=True)
    print(f"  + Experience Roles: {len(structured_cv.get('work_experience', []))}", flush=True)

    # 3. Test Agent 2: Multi-Dimensional Rating Engine
    print("\n[Test 3] Testing Rating Engine", flush=True)
    rating_insights = agent_rate_cv(structured_cv, parse_result["raw_text"])
    score = rating_insights.get("overall_score", 0)
    assert 0 <= score <= 100, f"Invalid score: {score}"
    assert "dimensions" in rating_insights, "Missing rating dimensions"
    assert len(rating_insights.get("action_plan", [])) > 0, "Missing action plan items"
    print(f"  + Overall Career Health Score: {score}/100 ({rating_insights.get('score_label')})", flush=True)
    print(f"  + ATS: {rating_insights['dimensions']['ats_compatibility']['score']}% | Impact: {rating_insights['dimensions']['impact_metrics']['score']}% | Readability: {rating_insights['dimensions']['readability']['score']}%", flush=True)
    print(f"  + Action Plan Tasks: {len(rating_insights['action_plan'])}", flush=True)

    # 4. Test Agent 3: Resume Rewrite & Archetypes
    print("\n[Test 4] Testing Rewrite Agent Across Archetypes", flush=True)
    for archetype, pal in [("Executive", "teal"), ("Tech", "navy"), ("Minimalist", "emerald")]:
        rewritten = agent_rewrite_cv(structured_cv, style_archetype=archetype, palette=pal)
        assert rewritten.get("style_blueprint") == archetype
        print(f"  + Generated: Archetype={archetype}, Palette={pal}", flush=True)

    # 5. Test PDF Engine Compilation
    print("\n[Test 5] Testing ReportLab Dynamic PDF Compilation", flush=True)
    pdf_path = compile_resume_pdf(structured_cv, archetype="Executive", palette_name="teal")
    assert os.path.exists(pdf_path), "PDF file was not created"
    pdf_size = os.path.getsize(pdf_path)
    assert pdf_size > 1000, "PDF file is empty or corrupted"
    print(f"  + Compiled ReportLab PDF: {pdf_path} (Size: {pdf_size} bytes)", flush=True)

    # 6. Test Vector RAG & Job Matching
    print("\n[Test 6] Testing Vector RAG Search & Job Matching", flush=True)
    vector_rag_engine.index_jobs(DEFAULT_JOBS_DATABASE)
    matches = calculate_job_matches(structured_cv, DEFAULT_JOBS_DATABASE)
    assert len(matches) > 0, "No jobs matched"
    top_job = matches[0]
    print(f"  + Top Job Match: {top_job['title']} @ {top_job['company']} (Score: {top_job['match_score']}%)", flush=True)
    print(f"  + Matching Skills: {top_job.get('matching_skills', [])}", flush=True)
    print(f"  + Missing Skills: {top_job.get('missing_skills', [])}", flush=True)

    # 7. Test Coach AI
    print("\n[Test 7] Testing Coach AI Conversational Agent", flush=True)
    coach_reply = agent_coach_chat("How can I improve my ATS score?", structured_cv)
    assert len(coach_reply) > 20, "Coach reply too short"
    print(f"  + Coach Reply Preview: {coach_reply[:120]}...", flush=True)

    print("\n========================================", flush=True)
    print("[SUCCESS] ALL 7 SYSTEM TESTS PASSED SUCCESSFULLY!", flush=True)
    print("========================================", flush=True)

if __name__ == "__main__":
    run_tests()
