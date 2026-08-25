# CareerForge AI 🚀
### Next-Gen Multi-Agent RAG Resume Engineering & Job Copilot

CareerForge AI is an end-to-end multi-agent AI system designed to parse, analyze, reconstruct, and match professional resumes with live job boards in real-time. Powered by Advanced Multi-Agent AI Orchestration, ChromaDB Vector RAG, and ReportLab dynamic PDF synthesis.

---

## 🌟 Key Capabilities

1. **CV Ingestion & Multi-Format Parsing**:
   - Parses `.pdf`, `.docx`, and `.txt` resumes with `pdfplumber`, `pypdf`, and `python-docx`.
   - Structures unstructured resumes into normalized JSON schemas (Personal Info, Summary, Categorized Skills, Quantified Experience, Education, Certifications).

2. **Multi-Dimensional CV Rating Engine**:
   - 0–100 grading across **ATS Compatibility**, **Impact & Metrics (Google XYZ formula)**, **Readability & Flow**, and **Industry Alignment**.
   - Prioritized Action Plan checklist with High, Medium, Low impact tasks and interactive status tracking.

3. **Dynamic & Unique CV Regeneration Studio ("The Forge")**:
   - Rewrites narrative with active power verbs and quantifiable impact metrics.
   - 3 modular layout archetypes: *Corporate Executive*, *Modern Tech Minimal*, and *Modern Two-Column / Minimalist*.
   - Dynamic color palettes: *Slate/Teal*, *Navy/Gold*, *Classic Slate*, and *Charcoal/Emerald*.
   - "Surprise Me" instant randomized blueprint generator.
   - Real-time inline editing and zoom controls.
   - Pixel-perfect, ATS-friendly PDF compilation via ReportLab with zero page overflow.

4. **Real-Time Vector RAG Job Matching & Direct Apply**:
   - Vector semantic matching against active industry roles.
   - Detailed Skill Breakdown: Matching competencies (green checkmarks) vs. missing skill gaps.
   - 1-Click direct application links and AI skill booster recommendations.

5. **Coach AI Conversational Copilot**:
   - Persistent context-aware assistant for interview preparation, salary negotiation, and resume optimization.

6. **Lumina Career Light & Lumina Dark Mode**:
   - Design system identical to the mockups in `stitch_careerforge_ai_platform_mockup`.

---

## 🛠️ Quick Start Guide

### 1. Requirements
- Python 3.10+
- Node.js (optional)

### 2. Installation
```bash
pip install -r requirements.txt
```

### 3. Run Application
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Open your browser and navigate to:
```
http://127.0.0.1:8000
```
