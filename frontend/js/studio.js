/**
 * CareerForge AI - Design Studio & Dynamic CV Renderer
 * Supports 8 Distinct Archetypes & 12 Harmonized Color Palettes with AI Blueprint Generation
 */

document.addEventListener("DOMContentLoaded", () => {
  setupStudioControls();
  // Initialize preview
  renderStudioCV(appState.rewrittenCv || appState.structuredCv);
});

function setupStudioControls() {
  // Archetype buttons
  const archetypeBtns = document.querySelectorAll(".archetype-btn");
  archetypeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      archetypeBtns.forEach(b => {
        b.classList.remove("active", "border-2", "border-primary", "bg-primary/10", "text-primary");
        b.classList.add("bg-surface-container", "text-on-surface-variant");
      });
      btn.classList.add("active", "border-2", "border-primary", "bg-primary/10", "text-primary");
      btn.classList.remove("bg-surface-container", "text-on-surface-variant");

      const archetype = btn.getAttribute("data-archetype");
      appState.styleArchetype = archetype;
      updateVersionLabel();
      renderStudioCV(appState.rewrittenCv || appState.structuredCv);
    });
  });

  // Palette buttons
  const paletteBtns = document.querySelectorAll(".palette-btn");
  paletteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      paletteBtns.forEach(b => {
        b.classList.remove("ring-2", "ring-offset-2", "ring-primary");
        b.innerHTML = "";
      });
      btn.classList.add("ring-2", "ring-offset-2", "ring-primary");
      btn.innerHTML = `<span class="material-symbols-outlined text-white absolute inset-0 flex items-center justify-center text-[18px]">check</span>`;

      const palette = btn.getAttribute("data-palette");
      appState.colorPalette = palette;
      renderStudioCV(appState.rewrittenCv || appState.structuredCv);
    });
  });
}

function updateVersionLabel() {
  const labelElem = document.getElementById("current-version-label");
  if (labelElem) {
    labelElem.innerText = `Version 3.2 (${appState.styleArchetype || 'Executive'})`;
  }
}

function getPaletteTheme(paletteKey) {
  const p = (paletteKey || "teal").toLowerCase();
  switch (p) {
    case "navy":
      return { primaryHex: "#1E3A8A", primaryBg: "rgba(30, 58, 138, 0.08)", textAccent: "text-blue-900 dark:text-blue-400", borderCol: "border-blue-800/30" };
    case "slate":
      return { primaryHex: "#334155", primaryBg: "rgba(51, 65, 85, 0.08)", textAccent: "text-slate-800 dark:text-slate-300", borderCol: "border-slate-700/30" };
    case "emerald":
      return { primaryHex: "#047857", primaryBg: "rgba(4, 120, 87, 0.08)", textAccent: "text-emerald-700 dark:text-emerald-400", borderCol: "border-emerald-700/30" };
    case "indigo":
      return { primaryHex: "#4338CA", primaryBg: "rgba(67, 56, 202, 0.08)", textAccent: "text-indigo-700 dark:text-indigo-400", borderCol: "border-indigo-700/30" };
    case "rosewood":
      return { primaryHex: "#9F1239", primaryBg: "rgba(159, 18, 57, 0.08)", textAccent: "text-rose-800 dark:text-rose-400", borderCol: "border-rose-800/30" };
    case "obsidian":
      return { primaryHex: "#0F172A", primaryBg: "rgba(15, 23, 42, 0.08)", textAccent: "text-slate-900 dark:text-sky-400", borderCol: "border-slate-800/30" };
    case "amber":
      return { primaryHex: "#C2410C", primaryBg: "rgba(194, 65, 12, 0.08)", textAccent: "text-amber-800 dark:text-amber-400", borderCol: "border-amber-800/30" };
    case "amethyst":
      return { primaryHex: "#7E22CE", primaryBg: "rgba(126, 34, 206, 0.08)", textAccent: "text-purple-800 dark:text-purple-400", borderCol: "border-purple-800/30" };
    case "cobalt":
      return { primaryHex: "#2563EB", primaryBg: "rgba(37, 99, 235, 0.08)", textAccent: "text-blue-700 dark:text-blue-400", borderCol: "border-blue-700/30" };
    case "crimson":
      return { primaryHex: "#DC2626", primaryBg: "rgba(220, 38, 38, 0.08)", textAccent: "text-red-700 dark:text-red-400", borderCol: "border-red-700/30" };
    case "cyberpunk":
      return { primaryHex: "#06B6D4", primaryBg: "rgba(6, 182, 212, 0.08)", textAccent: "text-cyan-600 dark:text-cyan-400", borderCol: "border-cyan-500/30" };
    case "teal":
    default:
      return { primaryHex: "#00685F", primaryBg: "rgba(0, 104, 95, 0.08)", textAccent: "text-primary", borderCol: "border-primary/20" };
  }
}

function renderContactChips(pInfo) {
  const items = [];
  if (pInfo.location && pInfo.location.trim()) {
    items.push(`<span>📍 ${pInfo.location.trim()}</span>`);
  }
  if (pInfo.email && pInfo.email.trim()) {
    items.push(`<span>✉️ ${pInfo.email.trim()}</span>`);
  }
  if (pInfo.phone && pInfo.phone.trim()) {
    items.push(`<span>📞 ${pInfo.phone.trim()}</span>`);
  }
  if (pInfo.linkedin && pInfo.linkedin.trim()) {
    items.push(`<span>🔗 ${pInfo.linkedin.trim()}</span>`);
  }
  if (pInfo.github && pInfo.github.trim()) {
    items.push(`<span>💻 ${pInfo.github.trim()}</span>`);
  }
  if (pInfo.website && pInfo.website.trim()) {
    items.push(`<span>🌐 ${pInfo.website.trim()}</span>`);
  }
  return items.join('');
}

function renderStudioCV(cvData) {
  const preview = document.getElementById("cv-preview");
  if (!preview) return;

  // Empty state if no CV has been uploaded yet
  if (!cvData || !cvData.personal_info || (!cvData.personal_info.full_name && !cvData.personal_info.name)) {
    preview.innerHTML = `
      <div class="flex flex-col items-center justify-center py-28 px-6 text-center text-on-surface-variant dark:text-[#94a3b8]">
        <div class="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
          <span class="material-symbols-outlined text-[40px]">upload_file</span>
        </div>
        <h3 class="font-headline-md text-2xl font-bold text-on-surface dark:text-[#f8fafc] mb-2">No Resume Uploaded Yet</h3>
        <p class="max-w-md text-body-md text-on-surface-variant dark:text-[#94a3b8] mb-8">Upload your resume to generate tailored blueprints, ATS-optimized bullet points, and dynamic ReportLab PDF compilation.</p>
        <button class="px-7 py-3 rounded-full bg-primary text-on-primary font-medium hover:bg-surface-tint shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2" onclick="navigateTo('upload')">
          <span class="material-symbols-outlined text-[20px]">upload</span> Upload Your Resume
        </button>
      </div>
    `;
    return;
  }

  const pInfo = cvData.personal_info || {};
  const summary = cvData.summary || "";
  const skills = cvData.skills || {};
  const experiences = cvData.work_experience || [];
  const education = cvData.education || [];
  const certs = cvData.certifications || [];

  // Update quick edit summary box
  const summaryInput = document.getElementById("edit-summary-input");
  if (summaryInput && summary) {
    summaryInput.value = summary;
  }

  // Palette color definitions for live DOM rendering
  const paletteTheme = getPaletteTheme(appState.colorPalette);

  if (appState.styleArchetype === "Tech") {
    preview.innerHTML = renderTechMinimalTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  } else if (appState.styleArchetype === "Minimalist") {
    preview.innerHTML = renderTwoColumnTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  } else if (appState.styleArchetype === "Nordic") {
    preview.innerHTML = renderNordicSplitTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  } else if (appState.styleArchetype === "Compact") {
    preview.innerHTML = renderCompactAtsTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  } else if (appState.styleArchetype === "Gradient") {
    preview.innerHTML = renderGradientHorizonTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  } else if (appState.styleArchetype === "Modernist") {
    preview.innerHTML = renderModernistTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  } else if (appState.styleArchetype === "Infographic") {
    preview.innerHTML = renderInfographicTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  } else {
    // Executive Template (Default)
    preview.innerHTML = renderExecutiveTemplate(pInfo, summary, skills, experiences, education, certs, paletteTheme);
  }

  // Setup inline editable listeners
  setupInlineEditListeners();
}

// ==========================================
// TEMPLATE 1: CORPORATE EXECUTIVE ARCHETYPE
// ==========================================
function renderExecutiveTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <header class="group relative border-b-2 ${theme.borderCol} pb-stack-md mb-stack-md hover:ring-2 hover:ring-primary/20 rounded-lg p-2 -m-2 transition-all">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="font-display text-3xl md:text-4xl text-on-surface dark:text-[#f8fafc] font-bold mb-1" contenteditable="true" data-field="personal_info.full_name">${fullName}</h1>
          <p class="font-headline-md text-xl font-semibold" style="color: ${theme.primaryHex};" contenteditable="true" data-field="personal_info.title">${title}</p>
        </div>
        <span class="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">Executive Archetype</span>
      </div>
      ${contactHtml ? `
        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-stack-sm font-label-md text-sm text-on-surface-variant dark:text-[#94a3b8]">
          ${contactHtml}
        </div>
      ` : ''}
    </header>

    ${summary ? `
      <section class="group relative mb-stack-md hover:ring-2 hover:ring-primary/20 p-2 -m-2 rounded-lg transition-all">
        <h3 class="font-label-md text-xs uppercase tracking-widest font-bold mb-1.5" style="color: ${theme.primaryHex};">Executive Summary</h3>
        <p class="font-body-md text-sm leading-relaxed text-on-surface-variant dark:text-[#e2e8f0]" contenteditable="true" data-field="summary">${summary}</p>
      </section>
    ` : ''}

    <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-2">
      <!-- Main Content (Experience) -->
      <div class="col-span-2 flex flex-col gap-stack-md">
        <section class="group relative hover:ring-2 hover:ring-primary/20 p-2 -m-2 rounded-lg transition-all">
          <div class="flex items-center justify-between mb-stack-sm">
            <h3 class="font-label-md text-xs uppercase tracking-widest font-bold" style="color: ${theme.primaryHex};">Professional Experience & Projects</h3>
            <div class="flex items-center gap-1.5 bg-secondary-container/20 text-secondary text-[11px] px-2 py-0.5 rounded font-bold">
              <span class="w-2 h-2 rounded-full bg-secondary animate-ping"></span> Google XYZ Optimized
            </div>
          </div>

          ${experiences.map((exp) => `
            <div class="mb-4 pb-3 border-b border-outline-variant/10 dark:border-[#334155] last:border-0">
              <div class="flex justify-between items-baseline mb-1">
                <h4 class="font-headline-md text-base text-on-surface dark:text-[#f8fafc] font-bold" contenteditable="true">${exp.role || 'Role'} <span class="font-normal text-on-surface-variant dark:text-[#94a3b8]">@ ${exp.company || 'Company'}</span></h4>
                <span class="font-label-sm text-xs text-on-surface-variant dark:text-[#94a3b8]">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
              </div>
              <ul class="list-disc list-outside ml-4 font-body-md text-xs leading-relaxed text-on-surface-variant dark:text-[#e2e8f0] space-y-1.5">
                ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </section>
      </div>

      <!-- Right Column (Skills & Education) -->
      <div class="col-span-1 flex flex-col gap-stack-md">
        <section class="group relative hover:ring-2 hover:ring-primary/20 p-2 -m-2 rounded-lg transition-all">
          <h3 class="font-label-md text-xs uppercase tracking-widest font-bold mb-2" style="color: ${theme.primaryHex};">Core Competencies</h3>
          <div class="flex flex-wrap gap-1.5">
            ${renderSkillChips(skills, theme)}
          </div>
        </section>

        ${education.length > 0 ? `
          <section class="group relative hover:ring-2 hover:ring-primary/20 p-2 -m-2 rounded-lg transition-all">
            <h3 class="font-label-md text-xs uppercase tracking-widest font-bold mb-2" style="color: ${theme.primaryHex};">Education</h3>
            ${education.map(edu => `
              <div class="mb-2 text-xs">
                <p class="font-bold text-on-surface dark:text-[#f8fafc]">${edu.degree || 'Degree'}</p>
                <p class="text-on-surface-variant dark:text-[#94a3b8]">${edu.institution || 'University'} ${edu.year ? `(${edu.year})` : ''}</p>
                ${edu.details ? `<p class="text-[11px] text-on-surface-variant dark:text-[#94a3b8] mt-0.5">${edu.details}</p>` : ''}
              </div>
            `).join('')}
          </section>
        ` : ''}

        ${certs.length > 0 ? `
          <section class="group relative hover:ring-2 hover:ring-primary/20 p-2 -m-2 rounded-lg transition-all">
            <h3 class="font-label-md text-xs uppercase tracking-widest font-bold mb-2" style="color: ${theme.primaryHex};">Certifications</h3>
            ${certs.map(c => `
              <div class="mb-1.5 text-xs">
                <p class="font-semibold text-on-surface dark:text-[#f8fafc]">🏆 ${c.name || 'Certification'}</p>
                <p class="text-on-surface-variant dark:text-[#94a3b8] text-[11px]">${c.issuer || ''} ${c.year ? `(${c.year})` : ''}</p>
              </div>
            `).join('')}
          </section>
        ` : ''}
      </div>
    </div>
  `;
}

// ==========================================
// TEMPLATE 2: MODERN TECH MINIMAL
// ==========================================
function renderTechMinimalTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <div class="font-mono text-xs text-primary mb-2 flex items-center justify-between">
      <span class="flex items-center gap-1.5"><span class="material-symbols-outlined text-[16px]">terminal</span> // TECH_AI_SYSTEM_SPEC</span>
      <span class="px-2 py-0.5 bg-primary/10 rounded font-mono text-[10px] text-primary font-bold">RECRUITER_INDEX: 98/100</span>
    </div>
    
    <header class="border-b-2 ${theme.borderCol} pb-3 mb-4">
      <h1 class="font-display text-3xl font-bold tracking-tight text-on-surface dark:text-[#f8fafc]" contenteditable="true">${fullName}</h1>
      <p class="font-mono text-sm font-semibold mt-1" style="color: ${theme.primaryHex};" contenteditable="true">${title}</p>
      ${contactHtml ? `
        <div class="flex flex-wrap gap-3 mt-2 text-xs text-on-surface-variant dark:text-[#94a3b8]">
          ${contactHtml}
        </div>
      ` : ''}
    </header>

    ${summary ? `
      <div class="mb-4 p-3 rounded-lg bg-surface-container-low dark:bg-[#201f1f] border border-outline-variant/30 dark:border-[#334155]">
        <p class="text-xs leading-relaxed text-on-surface dark:text-[#f8fafc]" contenteditable="true">${summary}</p>
      </div>
    ` : ''}

    <div class="mb-4">
      <h3 class="font-mono text-xs uppercase tracking-wider font-bold mb-2" style="color: ${theme.primaryHex};">> SYSTEM STACK & CORE ARTIFACTS</h3>
      <div class="flex flex-wrap gap-1.5">
        ${renderSkillChips(skills, theme)}
      </div>
    </div>

    <div class="mb-4">
      <h3 class="font-mono text-xs uppercase tracking-wider font-bold mb-2" style="color: ${theme.primaryHex};">> PRODUCTION DEPLOYMENTS & ARCHITECTURE</h3>
      ${experiences.map(exp => `
        <div class="mb-4 pb-2 border-b border-outline-variant/10 dark:border-[#334155] last:border-0">
          <div class="flex justify-between items-baseline mb-1">
            <span class="font-mono text-xs font-bold text-on-surface dark:text-[#f8fafc]">[role] ${exp.role} @ ${exp.company}</span>
            <span class="font-mono text-[11px] text-on-surface-variant dark:text-[#94a3b8]">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
          </div>
          <ul class="list-disc list-outside ml-4 text-xs text-on-surface-variant dark:text-[#e2e8f0] space-y-1">
            ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    ${education.length > 0 ? `
      <div class="mb-3">
        <h3 class="font-mono text-xs uppercase tracking-wider font-bold mb-1" style="color: ${theme.primaryHex};">> CREDENTIALS & ACADEMIC GROUNDING</h3>
        ${education.map(edu => `
          <p class="text-xs text-on-surface dark:text-[#f8fafc]">${edu.degree} — <span class="text-on-surface-variant dark:text-[#94a3b8]">${edu.institution} ${edu.year ? `(${edu.year})` : ''}</span></p>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// ==========================================
// TEMPLATE 3: MINIMALIST TWO-COLUMN
// ==========================================
function renderTwoColumnTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="col-span-1 border-r border-outline-variant/20 dark:border-[#334155] pr-4 flex flex-col gap-4">
        <div>
          <h1 class="font-display text-2xl font-bold tracking-tight text-on-surface dark:text-[#f8fafc]" contenteditable="true">${fullName}</h1>
          <p class="text-xs font-semibold mt-0.5" style="color: ${theme.primaryHex};" contenteditable="true">${title}</p>
        </div>
        
        ${contactHtml ? `
          <div class="flex flex-col gap-1 text-xs text-on-surface-variant dark:text-[#94a3b8]">
            ${contactHtml}
          </div>
        ` : ''}

        <div>
          <h3 class="text-[11px] uppercase tracking-widest font-bold mb-2 text-on-surface dark:text-[#f8fafc]">Expertise</h3>
          <div class="flex flex-wrap gap-1">
            ${renderSkillChips(skills, theme)}
          </div>
        </div>

        ${education.length > 0 ? `
          <div>
            <h3 class="text-[11px] uppercase tracking-widest font-bold mb-2 text-on-surface dark:text-[#f8fafc]">Education</h3>
            ${education.map(edu => `
              <div class="mb-2 text-xs">
                <p class="font-semibold text-on-surface dark:text-[#f8fafc]">${edu.degree}</p>
                <p class="text-on-surface-variant dark:text-[#94a3b8] text-[11px]">${edu.institution}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="col-span-2 flex flex-col gap-4">
        ${summary ? `
          <div>
            <h3 class="text-[11px] uppercase tracking-widest font-bold mb-1" style="color: ${theme.primaryHex};">Profile Overview</h3>
            <p class="text-xs leading-relaxed text-on-surface-variant dark:text-[#e2e8f0]" contenteditable="true">${summary}</p>
          </div>
        ` : ''}

        <div>
          <h3 class="text-[11px] uppercase tracking-widest font-bold mb-3" style="color: ${theme.primaryHex};">Experience & Key Initiatives</h3>
          ${experiences.map(exp => `
            <div class="mb-3.5 pb-2.5 border-b border-outline-variant/10 dark:border-[#334155] last:border-0">
              <div class="flex justify-between items-baseline mb-1">
                <span class="font-bold text-xs text-on-surface dark:text-[#f8fafc]">${exp.role} · <span class="font-normal text-on-surface-variant dark:text-[#94a3b8]">${exp.company}</span></span>
                <span class="text-[11px] text-on-surface-variant dark:text-[#94a3b8]">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
              </div>
              <ul class="list-disc list-outside ml-4 text-xs text-on-surface-variant dark:text-[#e2e8f0] space-y-1">
                ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// TEMPLATE 4: NORDIC SPLIT
// ==========================================
function renderNordicSplitTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <div class="rounded-2xl p-5 mb-4 border ${theme.borderCol}" style="background-color: ${theme.primaryBg};">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="font-display text-3xl font-extrabold text-on-surface dark:text-[#f8fafc]" contenteditable="true">${fullName}</h1>
          <p class="text-sm font-semibold mt-1" style="color: ${theme.primaryHex};" contenteditable="true">${title}</p>
        </div>
        <span class="text-xs px-3 py-1 rounded-full font-bold text-white shadow-sm" style="background-color: ${theme.primaryHex};">Nordic Blueprint</span>
      </div>
      ${contactHtml ? `
        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-on-surface-variant dark:text-[#94a3b8]">
          ${contactHtml}
        </div>
      ` : ''}
    </div>

    ${summary ? `
      <div class="mb-4">
        <p class="text-xs leading-relaxed text-on-surface-variant dark:text-[#e2e8f0] italic" contenteditable="true">"${summary}"</p>
      </div>
    ` : ''}

    <div class="mb-4">
      <h3 class="text-xs uppercase font-extrabold tracking-widest mb-2" style="color: ${theme.primaryHex};">Core Domain Mastery</h3>
      <div class="flex flex-wrap gap-1.5">
        ${renderSkillChips(skills, theme)}
      </div>
    </div>

    <div class="mb-4">
      <h3 class="text-xs uppercase font-extrabold tracking-widest mb-2" style="color: ${theme.primaryHex};">Experience Timeline</h3>
      ${experiences.map(exp => `
        <div class="mb-3.5 pb-2.5 border-b border-outline-variant/10 dark:border-[#334155] last:border-0">
          <div class="flex justify-between items-baseline mb-1">
            <span class="font-bold text-xs text-on-surface dark:text-[#f8fafc]">${exp.role} @ ${exp.company}</span>
            <span class="text-[11px] text-on-surface-variant dark:text-[#94a3b8]">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
          </div>
          <ul class="list-disc list-outside ml-4 text-xs text-on-surface-variant dark:text-[#e2e8f0] space-y-1">
            ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    ${education.length > 0 ? `
      <div>
        <h3 class="text-xs uppercase font-extrabold tracking-widest mb-1" style="color: ${theme.primaryHex};">Academic Credentials</h3>
        ${education.map(edu => `
          <p class="text-xs text-on-surface dark:text-[#f8fafc]"><b>${edu.degree}</b> · ${edu.institution} ${edu.year ? `(${edu.year})` : ''}</p>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// ==========================================
// TEMPLATE 5: COMPACT ATS 1-PAGE
// ==========================================
function renderCompactAtsTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <div class="text-center border-b ${theme.borderCol} pb-2 mb-3">
      <h1 class="font-display text-2xl font-bold text-on-surface dark:text-[#f8fafc]" contenteditable="true">${fullName}</h1>
      <p class="text-xs font-semibold" style="color: ${theme.primaryHex};" contenteditable="true">${title}</p>
      ${contactHtml ? `
        <div class="flex justify-center flex-wrap gap-x-3 text-[11px] text-on-surface-variant dark:text-[#94a3b8] mt-1">
          ${contactHtml}
        </div>
      ` : ''}
    </div>

    ${summary ? `
      <div class="mb-3">
        <h3 class="text-[11px] uppercase font-bold tracking-widest mb-0.5" style="color: ${theme.primaryHex};">Executive Summary</h3>
        <p class="text-xs leading-tight text-on-surface dark:text-[#f8fafc]" contenteditable="true">${summary}</p>
      </div>
    ` : ''}

    <div class="mb-3">
      <h3 class="text-[11px] uppercase font-bold tracking-widest mb-1" style="color: ${theme.primaryHex};">Core Technical Competencies</h3>
      <div class="flex flex-wrap gap-1">
        ${renderSkillChips(skills, theme)}
      </div>
    </div>

    <div class="mb-3">
      <h3 class="text-[11px] uppercase font-bold tracking-widest mb-1.5" style="color: ${theme.primaryHex};">Work History & Technical Milestones</h3>
      ${experiences.map(exp => `
        <div class="mb-2">
          <div class="flex justify-between items-baseline text-xs font-bold text-on-surface dark:text-[#f8fafc]">
            <span>${exp.role} — ${exp.company}</span>
            <span class="text-[10px] font-normal text-on-surface-variant dark:text-[#94a3b8]">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
          </div>
          <ul class="list-disc list-outside ml-4 text-[11px] leading-snug text-on-surface-variant dark:text-[#e2e8f0] space-y-0.5">
            ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    ${education.length > 0 ? `
      <div>
        <h3 class="text-[11px] uppercase font-bold tracking-widest mb-1" style="color: ${theme.primaryHex};">Education & Credentials</h3>
        ${education.map(edu => `
          <p class="text-xs text-on-surface dark:text-[#f8fafc]"><b>${edu.degree}</b> — ${edu.institution} ${edu.year ? `(${edu.year})` : ''}</p>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// ==========================================
// TEMPLATE 6: GRADIENT HORIZON
// ==========================================
function renderGradientHorizonTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <div class="p-5 rounded-2xl mb-4 text-white shadow-md relative overflow-hidden" style="background: linear-gradient(135deg, ${theme.primaryHex} 0%, #111C2D 100%);">
      <div class="relative z-10">
        <h1 class="font-display text-3xl font-bold tracking-tight" contenteditable="true">${fullName}</h1>
        <p class="text-sm font-medium opacity-90 mt-0.5" contenteditable="true">${title}</p>
        ${contactHtml ? `
          <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs opacity-80">
            ${contactHtml}
          </div>
        ` : ''}
      </div>
    </div>

    ${summary ? `
      <div class="mb-4 p-3 rounded-xl bg-surface-container-low dark:bg-[#201f1f] border ${theme.borderCol}">
        <p class="text-xs leading-relaxed text-on-surface dark:text-[#f8fafc]" contenteditable="true">${summary}</p>
      </div>
    ` : ''}

    <div class="mb-4">
      <h3 class="text-xs font-bold uppercase tracking-wider mb-2" style="color: ${theme.primaryHex};">Core Domain Mastery</h3>
      <div class="flex flex-wrap gap-1.5">
        ${renderSkillChips(skills, theme)}
      </div>
    </div>

    <div class="mb-4">
      <h3 class="text-xs font-bold uppercase tracking-wider mb-2" style="color: ${theme.primaryHex};">Key Experience & Scaled Architecture</h3>
      ${experiences.map(exp => `
        <div class="mb-3.5 pb-2.5 border-b border-outline-variant/10 dark:border-[#334155] last:border-0">
          <div class="flex justify-between items-baseline mb-1">
            <span class="font-bold text-xs text-on-surface dark:text-[#f8fafc]">${exp.role} @ ${exp.company}</span>
            <span class="text-[11px] text-on-surface-variant dark:text-[#94a3b8]">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
          </div>
          <ul class="list-disc list-outside ml-4 text-xs text-on-surface-variant dark:text-[#e2e8f0] space-y-1">
            ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    ${education.length > 0 ? `
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider mb-1" style="color: ${theme.primaryHex};">Education</h3>
        ${education.map(edu => `
          <p class="text-xs font-bold text-on-surface dark:text-[#f8fafc]">${edu.degree} — <span class="font-normal text-on-surface-variant dark:text-[#94a3b8]">${edu.institution}</span></p>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// ==========================================
// TEMPLATE 7: MODERNIST BOLD (NEW ARCHETYPE)
// ==========================================
function renderModernistTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <div class="border-l-4 pl-4 mb-5" style="border-color: ${theme.primaryHex};">
      <h1 class="font-display text-4xl font-extrabold tracking-tight text-on-surface dark:text-[#f8fafc]" contenteditable="true">${fullName}</h1>
      <div class="flex items-center gap-3 mt-1">
        <p class="text-base font-bold" style="color: ${theme.primaryHex};" contenteditable="true">${title}</p>
        <span class="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md text-white" style="background-color: ${theme.primaryHex};">Verified Elite</span>
      </div>
      ${contactHtml ? `
        <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-on-surface-variant dark:text-[#94a3b8]">
          ${contactHtml}
        </div>
      ` : ''}
    </div>

    ${summary ? `
      <div class="mb-5 p-3.5 rounded-xl border border-outline-variant/30 dark:border-[#334155] bg-surface-container-lowest dark:bg-[#1e1e1e] shadow-sm">
        <h3 class="text-[11px] font-black uppercase tracking-wider mb-1" style="color: ${theme.primaryHex};">// EXECUTIVE IMPACT SUMMARY</h3>
        <p class="text-xs leading-relaxed text-on-surface dark:text-[#f8fafc]" contenteditable="true">${summary}</p>
      </div>
    ` : ''}

    <div class="mb-5">
      <h3 class="text-xs font-black uppercase tracking-wider mb-2.5 flex items-center gap-2" style="color: ${theme.primaryHex};">
        <span class="w-2.5 h-2.5 rounded-sm" style="background-color: ${theme.primaryHex};"></span>
        TECHNICAL CAPABILITIES & TOOLING
      </h3>
      <div class="flex flex-wrap gap-1.5">
        ${renderSkillChips(skills, theme)}
      </div>
    </div>

    <div class="mb-5">
      <h3 class="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2" style="color: ${theme.primaryHex};">
        <span class="w-2.5 h-2.5 rounded-sm" style="background-color: ${theme.primaryHex};"></span>
        CORE ARCHITECTURAL ENGAGEMENTS
      </h3>
      ${experiences.map(exp => `
        <div class="mb-4 pl-3.5 border-l-2 border-outline-variant/30 dark:border-[#334155]">
          <div class="flex justify-between items-baseline mb-1">
            <span class="font-extrabold text-xs text-on-surface dark:text-[#f8fafc]">${exp.role} <span class="font-semibold text-on-surface-variant dark:text-[#94a3b8]">· ${exp.company}</span></span>
            <span class="text-[11px] font-bold" style="color: ${theme.primaryHex};">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
          </div>
          <ul class="list-disc list-outside ml-4 text-xs text-on-surface-variant dark:text-[#e2e8f0] space-y-1">
            ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    ${education.length > 0 ? `
      <div>
        <h3 class="text-xs font-black uppercase tracking-wider mb-2" style="color: ${theme.primaryHex};">ACADEMIC FOUNDATION</h3>
        ${education.map(edu => `
          <p class="text-xs font-bold text-on-surface dark:text-[#f8fafc]">${edu.degree} — <span class="font-normal text-on-surface-variant dark:text-[#94a3b8]">${edu.institution} ${edu.year ? `(${edu.year})` : ''}</span></p>
        `).join('')}
      </div>
    ` : ''}
  `;
}

// ==========================================
// TEMPLATE 8: INFOGRAPHIC STAT CALLOUT (NEW ARCHETYPE)
// ==========================================
function renderInfographicTemplate(pInfo, summary, skills, experiences, education, certs, theme) {
  const fullName = pInfo.full_name || pInfo.name || "Candidate Name";
  const title = pInfo.title || pInfo.domain || "Professional Title";
  const contactHtml = renderContactChips(pInfo);

  return `
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 mb-4 border-b-2 ${theme.borderCol}">
      <div>
        <h1 class="font-display text-3xl font-extrabold text-on-surface dark:text-[#f8fafc]" contenteditable="true">${fullName}</h1>
        <p class="text-sm font-bold mt-0.5" style="color: ${theme.primaryHex};" contenteditable="true">${title}</p>
        ${contactHtml ? `
          <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-on-surface-variant dark:text-[#94a3b8]">
            ${contactHtml}
          </div>
        ` : ''}
      </div>
      <div class="mt-2 md:mt-0 flex items-center gap-2">
        <div class="px-3 py-2 rounded-xl text-center text-white font-bold" style="background-color: ${theme.primaryHex};">
          <span class="block text-xs uppercase opacity-80">ATS Grade</span>
          <span class="text-base font-extrabold">96%</span>
        </div>
      </div>
    </header>

    <!-- Stat Callout Cards -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <div class="p-2.5 rounded-xl text-center border ${theme.borderCol}" style="background-color: ${theme.primaryBg};">
        <span class="block text-[10px] uppercase font-bold text-on-surface-variant dark:text-[#94a3b8]">Specialization</span>
        <span class="text-xs font-extrabold text-on-surface dark:text-[#f8fafc]">${title.split(' ')[0] || 'Engineering'}</span>
      </div>
      <div class="p-2.5 rounded-xl text-center border ${theme.borderCol}" style="background-color: ${theme.primaryBg};">
        <span class="block text-[10px] uppercase font-bold text-on-surface-variant dark:text-[#94a3b8]">Delivery Mode</span>
        <span class="text-xs font-extrabold" style="color: ${theme.primaryHex};">Google XYZ</span>
      </div>
      <div class="p-2.5 rounded-xl text-center border ${theme.borderCol}" style="background-color: ${theme.primaryBg};">
        <span class="block text-[10px] uppercase font-bold text-on-surface-variant dark:text-[#94a3b8]">Uptime / Impact</span>
        <span class="text-xs font-extrabold text-on-surface dark:text-[#f8fafc]">Top 5%</span>
      </div>
    </div>

    ${summary ? `
      <div class="mb-4">
        <h3 class="text-xs font-bold uppercase tracking-wider mb-1" style="color: ${theme.primaryHex};">Executive Trajectory</h3>
        <p class="text-xs leading-relaxed text-on-surface-variant dark:text-[#e2e8f0]" contenteditable="true">${summary}</p>
      </div>
    ` : ''}

    <div class="mb-4">
      <h3 class="text-xs font-bold uppercase tracking-wider mb-2" style="color: ${theme.primaryHex};">Technical Proficiency Meters</h3>
      <div class="flex flex-wrap gap-1.5">
        ${renderSkillChips(skills, theme)}
      </div>
    </div>

    <div class="mb-4">
      <h3 class="text-xs font-bold uppercase tracking-wider mb-2" style="color: ${theme.primaryHex};">Production Architecture Milestones</h3>
      ${experiences.map(exp => `
        <div class="mb-3.5 pb-2.5 border-b border-outline-variant/10 dark:border-[#334155] last:border-0">
          <div class="flex justify-between items-baseline mb-1">
            <span class="font-bold text-xs text-on-surface dark:text-[#f8fafc]">${exp.role} @ ${exp.company}</span>
            <span class="text-[11px] text-on-surface-variant dark:text-[#94a3b8]">${exp.start_date || ''} - ${exp.end_date || 'Present'}</span>
          </div>
          <ul class="list-disc list-outside ml-4 text-xs text-on-surface-variant dark:text-[#e2e8f0] space-y-1">
            ${(exp.bullets || []).map(b => `<li contenteditable="true">${b}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    ${education.length > 0 ? `
      <div>
        <h3 class="text-xs font-bold uppercase tracking-wider mb-1" style="color: ${theme.primaryHex};">Education</h3>
        ${education.map(edu => `
          <p class="text-xs font-bold text-on-surface dark:text-[#f8fafc]">${edu.degree} — <span class="font-normal text-on-surface-variant dark:text-[#94a3b8]">${edu.institution}</span></p>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function renderSkillChips(skills, theme) {
  let skillList = [];
  if (typeof skills === "object" && !Array.isArray(skills)) {
    Object.values(skills).forEach(val => {
      if (Array.isArray(val)) skillList.push(...val);
    });
  } else if (Array.isArray(skills)) {
    skillList = skills;
  }

  if (skillList.length === 0) {
    return `<span class="text-xs text-on-surface-variant dark:text-[#94a3b8]">No skills specified</span>`;
  }

  return skillList.map((skill, index) => {
    if (index === 0) {
      return `<span class="px-2.5 py-1 text-white font-label-sm text-[11px] rounded-full font-semibold shadow-sm" style="background-color: ${theme.primaryHex};">${skill}</span>`;
    }
    return `<span class="px-2.5 py-1 text-[11px] rounded-full font-medium" style="background-color: ${theme.primaryBg}; color: ${theme.primaryHex};">${skill}</span>`;
  }).join('');
}

function setupInlineEditListeners() {
  const editables = document.querySelectorAll('#cv-preview [contenteditable="true"]');
  editables.forEach(node => {
    node.addEventListener("blur", () => {
      const field = node.getAttribute("data-field");
      if (field && appState.rewrittenCv) {
        if (field === "personal_info.full_name") {
          if (!appState.rewrittenCv.personal_info) appState.rewrittenCv.personal_info = {};
          appState.rewrittenCv.personal_info.full_name = node.innerText.trim();
        }
        if (field === "personal_info.title") {
          if (!appState.rewrittenCv.personal_info) appState.rewrittenCv.personal_info = {};
          appState.rewrittenCv.personal_info.title = node.innerText.trim();
        }
        if (field === "summary") appState.rewrittenCv.summary = node.innerText.trim();
      }
    });
  });
}

// Studio Utility Functions
function zoomCV(factor) {
  const preview = document.getElementById("cv-preview");
  if (!preview) return;

  if (factor === 1.0) {
    appState.zoomScale = 1.0;
  } else {
    appState.zoomScale = Math.min(Math.max(0.7, appState.zoomScale * factor), 1.4);
  }

  preview.style.transform = `scale(${appState.zoomScale})`;
  showNotification(`Zoom: ${Math.round(appState.zoomScale * 100)}%`);
}

function applySummaryEdit() {
  const summaryInput = document.getElementById("edit-summary-input");
  if (summaryInput && appState.rewrittenCv) {
    appState.rewrittenCv.summary = summaryInput.value;
    renderStudioCV(appState.rewrittenCv);
    showNotification("Executive summary updated!", "success");
  }
}

async function triggerAIDesignGeneration(hint = "") {
  if (!appState.sessionId && !appState.structuredCv) {
    showNotification("Please upload a resume first to generate designs.", "error");
    return;
  }

  showNotification("AI is designing a bespoke, recruiter-grade CV layout...", "info");

  try {
    const res = await api.generateAIDesign(appState.sessionId, hint);
    if (res.success && res.design) {
      const d = res.design;
      appState.styleArchetype = d.archetype || appState.styleArchetype;
      appState.colorPalette = d.palette || appState.colorPalette;
      if (d.rewritten_cv) {
        appState.rewrittenCv = d.rewritten_cv;
      }

      // Update UI archetype buttons
      document.querySelectorAll(".archetype-btn").forEach(btn => {
        if (btn.getAttribute("data-archetype") === appState.styleArchetype) {
          btn.classList.add("active", "border-2", "border-primary", "bg-primary/10", "text-primary");
          btn.classList.remove("bg-surface-container", "text-on-surface-variant");
        } else {
          btn.classList.remove("active", "border-2", "border-primary", "bg-primary/10", "text-primary");
          btn.classList.add("bg-surface-container", "text-on-surface-variant");
        }
      });

      // Update UI palette buttons
      document.querySelectorAll(".palette-btn").forEach(btn => {
        if (btn.getAttribute("data-palette") === appState.colorPalette) {
          btn.classList.add("ring-2", "ring-offset-2", "ring-primary");
          btn.innerHTML = `<span class="material-symbols-outlined text-white absolute inset-0 flex items-center justify-center text-[18px]">check</span>`;
        } else {
          btn.classList.remove("ring-2", "ring-offset-2", "ring-primary");
          btn.innerHTML = "";
        }
      });

      updateVersionLabel();
      renderStudioCV(appState.rewrittenCv || appState.structuredCv);
      showNotification(`✨ New AI Blueprint: ${appState.styleArchetype} in ${appState.colorPalette.toUpperCase()}!`, "success");
    }
  } catch (err) {
    showNotification(`AI Design Generation failed: ${err.message}`, "error");
  }
}

function surpriseMe() {
  triggerAIDesignGeneration("Generate a distinctive, high-impact layout and color harmony that commands recruiter attention");
}

function saveVersion() {
  if (!appState.structuredCv && !appState.rewrittenCv) {
    showNotification("Please upload a resume first to save versions.", "error");
    return;
  }
  showNotification("Resume version saved to your active session!", "success");
}

async function downloadPDF() {
  const paper = document.getElementById("cv-preview") || document.getElementById("cv-paper");
  const cvData = appState.rewrittenCv || appState.structuredCv;

  if (!paper || !cvData || (!cvData.personal_info?.full_name && !cvData.personal_info?.name)) {
    showNotification("Please upload a resume first before downloading PDF.", "error");
    return;
  }

  const fullName = cvData.personal_info?.full_name || cvData.personal_info?.name || 'CareerForge_Resume';
  const name = fullName.replace(/\s+/g, '_');
  const filename = `${name}_${appState.styleArchetype || 'Executive'}.pdf`;

  showNotification("Rendering exact PDF from your screen layout...", "info");

  // Primary: High-fidelity exact WYSIWYG screen export via html2pdf
  if (typeof html2pdf !== "undefined") {
    try {
      const opt = {
        margin:       [4, 4, 4, 4],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff', scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(paper).save();
      showNotification("PDF downloaded successfully matching your exact screen design!", "success");
      return;
    } catch (err) {
      console.warn("Client-side PDF generation error, trying backend fallback:", err);
    }
  }

  // Fallback: Backend PDF generation
  try {
    const blob = await api.generatePDF(
      appState.sessionId,
      cvData,
      appState.styleArchetype,
      appState.colorPalette
    );

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

    showNotification("PDF compiled and downloaded successfully!", "success");
  } catch (err) {
    showNotification(`PDF generation failed: ${err.message}`, "error");
  }
}
