/**
 * CareerForge AI - Smart Job Matches & Real Live Job Board Engine
 */

let currentJobFilter = "all";
let currentJobSort = "match_desc";
let jobKeywordQuery = "";

function renderJobsList(jobs) {
  const container = document.getElementById("jobs-grid");
  const countBadge = document.getElementById("job-count-badge");
  if (!container) return;

  let filtered = jobs || [];

  // Filter by category
  if (currentJobFilter === "remote") {
    filtered = filtered.filter(j => (j.location || "").toLowerCase().includes("remote"));
  } else if (currentJobFilter === "high_match") {
    filtered = filtered.filter(j => (j.match_score || 0) >= 85);
  } else if (currentJobFilter === "tailored") {
    filtered = filtered.filter(j => j.is_tailored);
  }

  // Filter by keyword query
  if (jobKeywordQuery.trim()) {
    const q = jobKeywordQuery.toLowerCase().trim();
    filtered = filtered.filter(j =>
      (j.title || "").toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q) ||
      (j.required_skills || []).some(s => s.toLowerCase().includes(q)) ||
      (j.location || "").toLowerCase().includes(q)
    );
  }

  // Sort
  if (currentJobSort === "match_desc") {
    filtered.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
  } else if (currentJobSort === "salary_desc") {
    filtered.sort((a, b) => (b.salary_range || '').localeCompare(a.salary_range || ''));
  } else if (currentJobSort === "newest") {
    filtered.sort((a, b) => (a.posted_days_ago || 0) - (b.posted_days_ago || 0));
  }

  if (countBadge) countBadge.innerText = filtered.length;
  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-on-surface-variant dark:text-[#94a3b8]">
        <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <span class="material-symbols-outlined text-[36px]">search_off</span>
        </div>
        <p class="font-headline-md text-xl font-bold text-on-surface dark:text-[#f8fafc] mb-1">No roles matching your criteria</p>
        <p class="text-sm text-on-surface-variant dark:text-[#94a3b8]">Try clearing filters or searching for different keywords.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(job => {
    const card = document.createElement("div");
    card.className = "bg-surface-container-lowest dark:bg-[#1e1e1e] rounded-2xl p-stack-md shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 flex flex-col h-full relative group border border-outline-variant/20 dark:border-[#334155] overflow-hidden";

    const score = job.match_score || 85;
    const scoreColor = score >= 90 ? "text-primary" : score >= 80 ? "text-secondary" : "text-on-surface-variant";
    const barGradient = score >= 90 ? "from-primary to-primary-fixed" : "from-secondary to-secondary-fixed";

    card.innerHTML = `
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${barGradient}"></div>

      <!-- Top Header -->
      <div class="flex justify-between items-start mb-stack-md relative z-10">
        <div class="flex items-center gap-stack-md">
          <div class="w-12 h-12 rounded-xl bg-surface-container-high dark:bg-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0 border border-outline-variant/30 dark:border-[#334155] p-2">
            ${job.logo ? `
              <img class="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" src="${job.logo}" alt="${job.company}">
            ` : `
              <span class="material-symbols-outlined text-primary text-[28px]">${job.logo_icon || 'business'}</span>
            `}
          </div>
          <div>
            <h3 class="font-headline-md text-[17px] text-on-surface dark:text-[#f8fafc] font-bold leading-tight mb-1 group-hover:text-primary transition-colors">${job.title}</h3>
            <p class="font-body-md text-label-md text-on-surface-variant dark:text-[#94a3b8] text-xs">${job.company} • ${job.location}</p>
          </div>
        </div>
        <button aria-label="Save job" class="text-outline hover:text-primary transition-colors p-1" onclick="toggleBookmark(this)">
          <span class="material-symbols-outlined text-[20px]">bookmark_border</span>
        </button>
      </div>

      <!-- Match Score & Estimated Salary Widget -->
      <div class="flex items-center justify-between mb-3 bg-surface-container-low dark:bg-[#201f1f] rounded-xl p-2.5 border border-outline-variant/30 dark:border-[#334155] relative z-10">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[18px]">analytics</span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant dark:text-[#94a3b8] font-bold">Match Score</span>
            <span class="font-headline-md ${scoreColor} font-bold text-base leading-none">${score}%</span>
          </div>
        </div>
        <div class="text-right">
          <span class="font-label-sm text-[10px] uppercase tracking-wider text-on-surface-variant dark:text-[#94a3b8] block mb-0.5 font-bold">Est. Salary</span>
          <span class="font-body-md text-on-surface dark:text-[#f8fafc] font-bold text-xs">${job.salary_range || '$130k - $180k'}</span>
        </div>
      </div>

      <!-- AI Match Rationale Callout -->
      ${job.ai_rationale ? `
        <div class="mb-3 p-2 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 text-[11px] text-on-surface dark:text-[#f8fafc] flex items-center gap-1.5">
          <span>${job.ai_rationale}</span>
        </div>
      ` : ''}

      <!-- Skill Breakdown -->
      <div class="mb-4 flex-grow relative z-10">
        <h4 class="font-label-sm text-[11px] text-on-surface-variant dark:text-[#94a3b8] uppercase tracking-wider mb-2 font-bold">Skill Breakdown</h4>
        <div class="flex flex-wrap gap-1.5">
          ${(job.matching_skills || []).map(s => `
            <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] flex items-center gap-1 border border-primary/20 font-medium">
              <span class="material-symbols-outlined text-[13px]">check_circle</span> ${s}
            </span>
          `).join('')}
          ${(job.missing_skills || []).map(s => `
            <span class="px-2 py-0.5 rounded-full bg-surface-container-high dark:bg-[#2a2a2a] text-on-surface-variant dark:text-[#94a3b8] font-label-sm text-[11px] flex items-center gap-1 border border-outline-variant/40 dark:border-[#334155]">
              <span class="material-symbols-outlined text-[13px]">remove</span> ${s}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Action Buttons (Apply & Multi-Source Deep Links) -->
      <div class="mt-auto relative z-10 flex flex-col gap-2 pt-2 border-t border-outline-variant/10 dark:border-[#334155]">
        <a href="${job.apply_url || '#'}" target="_blank" rel="noopener noreferrer" class="w-full py-2.5 bg-primary hover:bg-surface-tint text-on-primary font-label-md text-xs rounded-xl transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-1.5 group/btn font-bold">
          Apply Directly
          <span class="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
        </a>

        <div class="grid grid-cols-3 gap-1.5">
          <a href="${job.linkedin_url || '#'}" target="_blank" rel="noopener noreferrer" class="py-1.5 px-2 bg-surface-container-high dark:bg-[#2a2a2a] hover:bg-[#0077B5]/15 hover:text-[#0077B5] dark:hover:text-[#38bdf8] text-on-surface-variant dark:text-[#94a3b8] text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 font-semibold border border-outline-variant/20 dark:border-[#334155]">
            <span class="font-bold">in</span> LinkedIn
          </a>
          <a href="${job.indeed_url || '#'}" target="_blank" rel="noopener noreferrer" class="py-1.5 px-2 bg-surface-container-high dark:bg-[#2a2a2a] hover:bg-[#2164f3]/15 hover:text-[#2164f3] dark:hover:text-[#60a5fa] text-on-surface-variant dark:text-[#94a3b8] text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 font-semibold border border-outline-variant/20 dark:border-[#334155]">
            <span class="material-symbols-outlined text-[13px]">work</span> Indeed
          </a>
          <a href="${job.google_jobs_url || '#'}" target="_blank" rel="noopener noreferrer" class="py-1.5 px-2 bg-surface-container-high dark:bg-[#2a2a2a] hover:bg-primary/15 hover:text-primary text-on-surface-variant dark:text-[#94a3b8] text-[11px] rounded-lg transition-colors flex items-center justify-center gap-1 font-semibold border border-outline-variant/20 dark:border-[#334155]">
            <span class="material-symbols-outlined text-[13px]">search</span> Google
          </a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function filterJobs(filterKey) {
  currentJobFilter = filterKey;

  const chips = document.querySelectorAll("#job-filters .filter-chip");
  chips.forEach(chip => {
    if (chip.getAttribute("data-filter") === filterKey) {
      chip.classList.add("bg-primary-container", "text-on-primary-container");
      chip.classList.remove("bg-surface", "dark:bg-[#2a2a2a]", "text-on-surface-variant", "dark:text-[#94a3b8]");
    } else {
      chip.classList.remove("bg-primary-container", "text-on-primary-container");
      chip.classList.add("bg-surface", "dark:bg-[#2a2a2a]", "text-on-surface-variant", "dark:text-[#94a3b8]");
    }
  });

  renderJobsList(appState.matchedJobs);
}

function sortJobs(sortKey) {
  currentJobSort = sortKey;
  renderJobsList(appState.matchedJobs);
}

function searchJobs(query) {
  jobKeywordQuery = query || "";
  renderJobsList(appState.matchedJobs);
}

function toggleBookmark(btn) {
  const icon = btn.querySelector(".material-symbols-outlined");
  if (icon.innerText === "bookmark_border") {
    icon.innerText = "bookmark";
    icon.classList.add("text-primary");
    icon.style.fontVariationSettings = "'FILL' 1";
    showNotification("Role saved to your bookmarked list!", "success");
  } else {
    icon.innerText = "bookmark_border";
    icon.classList.remove("text-primary");
    icon.style.fontVariationSettings = "'FILL' 0";
    showNotification("Role removed from bookmarked list.");
  }
}
