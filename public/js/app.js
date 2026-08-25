/**
 * CareerForge AI - App Core & State Management
 */

// Global State
const appState = {
  currentView: "upload",
  sessionId: null,
  structuredCv: null,
  ratingInsights: null,
  rewrittenCv: null,
  matchedJobs: [],
  styleArchetype: "Executive",
  colorPalette: "teal",
  zoomScale: 1.0,
  chatHistory: [],
  theme: "light"
};

// Initialize Application on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupNavListeners();
});

// Theme Management (Light / Lumina Dark)
function initTheme() {
  const savedTheme = localStorage.getItem("careerforge_theme") || "light";
  appState.theme = savedTheme;
  applyTheme(savedTheme);

  const themeToggleBtn = document.getElementById("theme-toggle");
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const nextTheme = appState.theme === "light" ? "dark" : "light";
      appState.theme = nextTheme;
      localStorage.setItem("careerforge_theme", nextTheme);
      applyTheme(nextTheme);
      showNotification(`Switched to ${nextTheme === 'dark' ? 'Lumina Dark' : 'Lumina Light'} mode`);
    });
  }
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
  } else {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }
}

// Navigation Router
function setupNavListeners() {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-target");
      navigateTo(target);
    });
  });
}

function navigateTo(viewId) {
  appState.currentView = viewId;

  // Update desktop nav links styling
  document.querySelectorAll(".nav-link").forEach(link => {
    if (link.getAttribute("data-target") === viewId) {
      link.classList.add("text-primary", "font-bold", "active");
      link.classList.remove("text-on-surface-variant", "dark:text-[#94a3b8]");
      
      // Add active indicator bar
      if (!link.querySelector(".active-indicator")) {
        const ind = document.createElement("span");
        ind.className = "active-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full";
        link.appendChild(ind);
      }
    } else {
      link.classList.remove("text-primary", "font-bold", "active");
      link.classList.add("text-on-surface-variant", "dark:text-[#94a3b8]");
      const ind = link.querySelector(".active-indicator");
      if (ind) ind.remove();
    }
  });

  // Update mobile bottom nav buttons styling
  document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
    if (btn.getAttribute("data-target") === viewId) {
      btn.classList.add("text-primary", "font-bold", "bg-primary/10", "dark:bg-primary/20", "active");
      btn.classList.remove("text-on-surface-variant", "dark:text-[#94a3b8]", "bg-transparent");
    } else {
      btn.classList.remove("text-primary", "font-bold", "bg-primary/10", "dark:bg-primary/20", "active");
      btn.classList.add("text-on-surface-variant", "dark:text-[#94a3b8]", "bg-transparent");
    }
  });

  // Toggle visible section
  document.querySelectorAll(".view-section").forEach(sec => {
    sec.classList.add("hidden");
    sec.classList.remove("active");
  });

  const activeSection = document.getElementById(`view-${viewId}`);
  if (activeSection) {
    activeSection.classList.remove("hidden");
    activeSection.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Trigger view-specific re-renders
  if (viewId === "insights") {
    const emptyState = document.getElementById("insights-empty-state");
    const contentArea = document.getElementById("insights-content");
    
    if (appState.ratingInsights) {
      if (emptyState) emptyState.classList.add("hidden");
      if (contentArea) contentArea.classList.remove("hidden");
      renderInsights(appState.ratingInsights, appState.structuredCv);
    } else {
      if (contentArea) contentArea.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
    }
  } else if (viewId === "studio") {
    renderStudioCV(appState.rewrittenCv || appState.structuredCv);
  } else if (viewId === "jobs") {
    const emptyState = document.getElementById("jobs-empty-state");
    const contentArea = document.getElementById("jobs-content");

    if (appState.matchedJobs && appState.matchedJobs.length > 0) {
      if (emptyState) emptyState.classList.add("hidden");
      if (contentArea) contentArea.classList.remove("hidden");
      renderJobsList(appState.matchedJobs);
    } else {
      if (contentArea) contentArea.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
    }
  }
}

// Toast Notification Manager
function showNotification(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast max-w-sm bg-surface-container-lowest dark:bg-[#1e1e1e] text-on-surface dark:text-[#f8fafc] px-4 py-3 rounded-2xl shadow-xl border border-outline-variant/30 dark:border-[#334155] flex items-center gap-3 text-sm transition-all duration-300`;
  
  let icon = "info";
  let iconColor = "text-primary";
  if (type === "success") { icon = "check_circle"; iconColor = "text-emerald-500"; }
  if (type === "error") { icon = "error"; iconColor = "text-error"; }

  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} text-[20px] shrink-0">${icon}</span>
    <span class="flex-1 font-medium">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
