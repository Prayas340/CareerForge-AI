/**
 * CareerForge AI - API Client
 */

const API_BASE = "";

const api = {
  async uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Error processing resume");
    }

    return await response.json();
  },

  async loadSampleResume(sampleId = "alex_morgan") {
    const response = await fetch(`${API_BASE}/api/sample-resume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sample_id: sampleId })
    });

    if (!response.ok) {
      throw new Error("Failed to load sample resume");
    }

    return await response.json();
  },

  async regenerate(sessionId, styleArchetype, colorPalette, customEdits = null) {
    const response = await fetch(`${API_BASE}/api/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        style_archetype: styleArchetype,
        color_palette: colorPalette,
        custom_edits: customEdits
      })
    });

    if (!response.ok) {
      throw new Error("Regeneration failed");
    }

    return await response.json();
  },

  async generateAIDesign(sessionId, promptHint = "", customEdits = null) {
    const response = await fetch(`${API_BASE}/api/ai-design`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        prompt_hint: promptHint,
        custom_edits: customEdits
      })
    });

    if (!response.ok) {
      throw new Error("AI Design generation failed");
    }

    return await response.json();
  },

  async generatePDF(sessionId, cvData = null, styleArchetype = "Executive", colorPalette = "teal") {
    const response = await fetch(`${API_BASE}/api/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        style_archetype: styleArchetype,
        color_palette: colorPalette,
        cv_data: cvData
      })
    });

    if (!response.ok) {
      throw new Error("PDF Generation failed on server");
    }

    return await response.blob();
  },

  async downloadPDF(sessionId, styleArchetype = "Executive", colorPalette = "teal", cvData = null) {
    const blob = await this.generatePDF(sessionId, cvData, styleArchetype, colorPalette);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = (cvData?.personal_info?.full_name || 'CareerForge_Resume').replace(/\s+/g, '_');
    a.download = `${name}_${styleArchetype}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  async chatCoach(sessionId, message, chatHistory = []) {
    const response = await fetch(`${API_BASE}/api/coach`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
        chat_history: chatHistory
      })
    });

    if (!response.ok) {
      throw new Error("Coach chat failed");
    }

    return await response.json();
  },

  async getJobs(sessionId = null, filterRemote = false, minMatch = 0) {
    let url = `${API_BASE}/api/jobs?`;
    if (sessionId) url += `session_id=${sessionId}&`;
    if (filterRemote) url += `filter_remote=true&`;
    if (minMatch > 0) url += `min_match=${minMatch}&`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to retrieve jobs");
    }
    return await response.json();
  }
};
