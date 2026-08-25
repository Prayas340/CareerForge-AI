/**
 * CareerForge AI - Smart Job Matches & Vector RAG Board
 */

let currentJobFilter = "all";
let currentJobSort = "match_desc";

function renderJobsList(jobs) {
  const container = document.getElementById("jobs-grid");
  const countBadge = document.getElementById("job-count-badge");
  if (!container) return;

  let filtered = jobs || [];

  if (currentJobFilter === "remote") {
    filtered = filtered.filter(j => j.location.toLowerCase().includes("remote"));
  } else if (currentJobFilter === "high_match") {
    filtered = filtered.filter(j => (j.match_score || 0) >= 80);
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
      <div class="col-span-full py-12 text-center text-on-surface-variant dark:text-[#94a3b8]">
        <span class="material-symbols-outlined text-[48px] text-outline mb-2">search_off</span>
        <p class="font-headline-md text-lg">No roles found matching the selected filter.</p>
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
            <h3 class="font-headline-md text-[18px] text-on-surface dark:text-[#f8fafc] font-bold leading-tight mb-1 group-hover:text-primary transition-colors">${job.title}</h3>
            <p class="font-body-md text-label-md text-on-surface-variant dark:text-[#94a3b8]">${job.company} • ${job.location}</p>
          </div>
        </div>
        <button aria-label="Save job" class="text-outline hover:text-primary transition-colors p-1" onclick="toggleBookmark(this)">
          <span class="material-symbols-outlined text-[20px]">bookmark_border</span>
        </button>
      </div>

      <!-- Match Score & Estimated Salary Widget -->
      <div class="flex items-center justify-between mb-stack-md bg-surface-container-low dark:bg-[#201f1f] rounded-xl p-stack-sm border border-outline-variant/30 dark:border-[#334155] relative z-10">
        <div class="flex items-center gap-unit">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-[20px]">analytics</span>
          </div>
          <div class="flex flex-col">
            <span class="font-label-sm text-label-sm text-on-surface-variant dark:text-[#94a3b8] uppercase tracking-wider text-[10px] font-bold">Match Score</span>
            <span class="font-headline-md text-headline-md ${scoreColor} font-bold text-lg">${score}%</span>
          </div>
        </div>
        <div class="text-right">
          <span class="font-label-sm text-label-sm text-on-surface-variant dark:text-[#94a3b8] uppercase tracking-wider block mb-0.5 text-[10px] font-bold">Est. Salary</span>
          <span class="font-body-md text-body-md text-on-surface dark:text-[#f8fafc] font-semibold text-sm">${job.salary_range || '$120k - $150k'}</span>
        </div>
      </div>

      <!-- Skill Breakdown -->
      <div class="mb-stack-lg flex-grow relative z-10">
        <h4 class="font-label-sm text-label-sm text-on-surface-variant dark:text-[#94a3b8] uppercase tracking-wider mb-stack-sm font-semibold text-[11px]">Skill Breakdown</h4>
        <div class="flex flex-wrap gap-1.5">
          ${(job.matching_skills || []).map(s => `
            <span class="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-[11px] flex items-center gap-1 border border-primary/20 font-medium">
              <span class="material-symbols-outlined text-[13px]">check_circle</span> ${s}
            </span>
          `).join('')}
          ${(job.missing_skills || []).map(s => `
            <span class="px-2.5 py-1 rounded-full bg-surface-container-high dark:bg-[#2a2a2a] text-on-surface-variant dark:text-[#94a3b8] font-label-sm text-[11px] flex items-center gap-1 border border-outline-variant/40 dark:border-[#334155]">
              <span class="material-symbols-outlined text-[13px]">remove</span> ${s}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Apply Button -->
      <div class="mt-auto relative z-10">
        <a href="${job.apply_url || '#'}" target="_blank" class="w-full py-2.5 bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md rounded-xl transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-unit group/btn font-bold">
          Apply Directly
          <span class="material-symbols-outlined text-[18px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
        </a>
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
  }
}
