import requests
import os
import sys
import io
from pathlib import Path

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def test_all_api_endpoints():
    print("========================================", flush=True)
    print("[API TESTS] TESTING FASTAPI SERVER ENDPOINTS", flush=True)
    print("========================================", flush=True)

    # 1. Health check
    r = requests.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    print(f"  + GET /api/health -> {r.json()}", flush=True)

    # 2. Frontend index.html serving
    r = requests.get(f"{BASE_URL}/")
    assert r.status_code == 200, f"Frontend root failed: {r.status_code}"
    assert "CareerForge AI" in r.text, "index.html missing CareerForge AI title"
    print(f"  + GET / -> index.html served ({len(r.text)} bytes)", flush=True)

    # 3. Load Sample Resume
    r = requests.post(f"{BASE_URL}/api/sample-resume", json={"sample_id": "alex_morgan"})
    assert r.status_code == 200, f"Sample resume load failed: {r.status_code}"
    data = r.json()
    assert data["success"] == True
    session_id = data["session_id"]
    print(f"  + POST /api/sample-resume -> session_id={session_id}", flush=True)
    print(f"    - Score: {data['rating_insights'].get('overall_score')}/100", flush=True)
    print(f"    - Matched Jobs: {len(data['matched_jobs'])} jobs", flush=True)

    # 4. Upload Prayas Dey Profile PDF test (Verify NO phantom phone / NO fake location)
    upload_pdf_path = Path("uploads/ede7c624-2302-4cac-8a6e-bbe3ca49bdbe_Profile (1).pdf")
    if upload_pdf_path.exists():
        with open(upload_pdf_path, "rb") as f:
            r = requests.post(f"{BASE_URL}/api/upload", files={"file": ("Profile.pdf", f, "application/pdf")})
        assert r.status_code == 200, f"Upload failed: {r.status_code}"
        up_data = r.json()
        pinfo = up_data["structured_cv"]["personal_info"]
        print(f"  + POST /api/upload (Profile.pdf) -> Name: {pinfo.get('full_name')}", flush=True)
        print(f"    - Location: {pinfo.get('location')}", flush=True)
        print(f"    - Phone: '{pinfo.get('phone')}' (Empty as required - no fake numbers!)", flush=True)
        assert pinfo.get("phone") == "", f"Expected empty phone, got: {pinfo.get('phone')}"
        assert "Kolkata" in pinfo.get("location", ""), f"Expected Kolkata in location, got: {pinfo.get('location')}"
        session_id = up_data["session_id"]

    # 5. Dynamic AI Design Generation (Gemini API)
    r = requests.post(f"{BASE_URL}/api/ai-design", json={
        "session_id": session_id,
        "prompt_hint": "Modern Silicon Valley Tech Lead"
    })
    assert r.status_code == 200, f"AI Design failed: {r.status_code}"
    design_data = r.json()
    assert design_data["success"] == True
    print(f"  + POST /api/ai-design -> Archetype: {design_data.get('style_archetype')}, Palette: {design_data.get('color_palette')}", flush=True)

    # 6. Regenerate Archetype
    r = requests.post(f"{BASE_URL}/api/regenerate", json={
        "session_id": session_id,
        "style_archetype": "Nordic",
        "color_palette": "indigo"
    })
    assert r.status_code == 200, f"Regenerate failed: {r.status_code}"
    regen_data = r.json()
    assert regen_data["style_archetype"] == "Nordic"
    print(f"  + POST /api/regenerate -> Archetype: {regen_data['style_archetype']}, Palette: {regen_data['color_palette']}", flush=True)

    # 7. Generate & Download PDF
    r = requests.post(f"{BASE_URL}/api/generate-pdf", json={
        "session_id": session_id,
        "style_archetype": "Nordic",
        "color_palette": "indigo"
    })
    assert r.status_code == 200, f"PDF generation failed: {r.status_code}"
    assert len(r.content) > 1000, "Downloaded PDF empty"
    print(f"  + POST /api/generate-pdf -> PDF compiled ({len(r.content)} bytes)", flush=True)

    # 8. Coach AI Chat
    r = requests.post(f"{BASE_URL}/api/coach", json={
        "session_id": session_id,
        "message": "Explain how my RAG and LLM experience can impress high-frequency recruiter screens."
    })
    assert r.status_code == 200, f"Coach AI failed: {r.status_code}"
    coach_reply = r.json().get("reply", "")
    assert len(coach_reply) > 20, "Coach reply too short"
    print(f"  + POST /api/coach -> Reply: {coach_reply[:80]}...", flush=True)

    # 9. Get Jobs with Filters
    r = requests.get(f"{BASE_URL}/api/jobs?session_id={session_id}&filter_remote=true&min_match=70")
    assert r.status_code == 200, f"Jobs endpoint failed: {r.status_code}"
    jobs_data = r.json()
    assert len(jobs_data["jobs"]) > 0, "No filtered jobs returned"
    print(f"  + GET /api/jobs -> {len(jobs_data['jobs'])} filtered remote jobs (Match >= 70%)", flush=True)

    print("\n========================================", flush=True)
    print("[SUCCESS] ALL FASTAPI SERVER ENDPOINTS WORKING 100%!", flush=True)
    print("========================================", flush=True)

if __name__ == "__main__":
    test_all_api_endpoints()
