/**
 * CareerForge AI - Upload Handler & Progress Animation
 */

document.addEventListener("DOMContentLoaded", () => {
  setupDropzone();
  setupFileInput();
});

function setupDropzone() {
  const dropzone = document.getElementById("dropzone");
  const dropDefault = document.getElementById("drop-default");
  const dropActive = document.getElementById("drop-active");
  const uploadState = document.getElementById("upload-state");

  if (!dropzone) return;

  ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    }, false);
  });

  ["dragenter", "dragover"].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      if (uploadState.classList.contains("hidden")) {
        dropDefault.classList.add("hidden");
        dropActive.classList.remove("hidden");
        dropzone.classList.add("border-primary", "shadow-primary/20");
      }
    }, false);
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, () => {
      dropActive.classList.add("hidden");
      dropzone.classList.remove("border-primary", "shadow-primary/20");
      if (uploadState.classList.contains("hidden")) {
        dropDefault.classList.remove("hidden");
      }
    }, false);
  });

  dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelected(files[0]);
    }
  });
}

function setupFileInput() {
  const fileInput = document.getElementById("file-input");
  if (!fileInput) return;

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  });
}

async function handleFileSelected(file) {
  // Validate file type
  const allowedExtensions = [".pdf", ".docx", ".doc", ".txt"];
  const fileExt = "." + file.name.split(".").pop().toLowerCase();
  
  if (!allowedExtensions.includes(fileExt)) {
    showNotification("Please upload a PDF, DOCX, or TXT file.", "error");
    return;
  }

  // Start animated upload sequence
  startProgressAnimation();

  try {
    const data = await api.uploadResume(file);
    appState.sessionId = data.session_id;
    appState.structuredCv = data.structured_cv;
    appState.ratingInsights = data.rating_insights;
    appState.rewrittenCv = data.rewritten_cv;
    appState.matchedJobs = data.matched_jobs;

    completeProgressAnimation(() => {
      showNotification("Resume ingested & evaluated successfully!", "success");
      navigateTo("insights");
    });
  } catch (err) {
    console.error("[Upload Error]", err);
    resetUploadUI();
    showNotification(`Processing failed: ${err.message}`, "error");
  }
}

async function loadSampleResume(sampleId) {
  startProgressAnimation();

  try {
    const data = await api.loadSampleResume(sampleId);
    appState.sessionId = data.session_id;
    appState.structuredCv = data.structured_cv;
    appState.ratingInsights = data.rating_insights;
    appState.rewrittenCv = data.rewritten_cv;
    appState.matchedJobs = data.matched_jobs;

    completeProgressAnimation(() => {
      const name = sampleId === "sarah_chen" ? "Sarah Chen (AI Engineer)" : "Alex Morgan (Product Designer)";
      showNotification(`Loaded demo profile: ${name}`, "success");
      navigateTo("insights");
    });
  } catch (err) {
    console.error("[Sample Load Error]", err);
    resetUploadUI();
    showNotification("Failed to load sample resume", "error");
  }
}

let progressInterval = null;

function startProgressAnimation() {
  const dropDefault = document.getElementById("drop-default");
  const dropActive = document.getElementById("drop-active");
  const uploadState = document.getElementById("upload-state");
  const dropzone = document.getElementById("dropzone");
  const progressCircle = document.getElementById("progress-circle");
  const loadingTitle = document.getElementById("loading-title");
  const loadingText = document.getElementById("loading-text");

  dropDefault.classList.add("hidden");
  dropActive.classList.add("hidden");
  uploadState.classList.remove("hidden");
  dropzone.classList.add("pointer-events-none");

  const totalLength = 283; // Circumference for r=45
  let progress = 5;

  const steps = [
    { p: 20, title: "Parsing Document Matrix...", text: "Extracting raw entities, headings, and dates..." },
    { p: 45, title: "AI Multi-Dimensional Grading...", text: "Benchmarking ATS keywords & Google XYZ formula..." },
    { p: 70, title: "Dynamic Story Rebuilding...", text: "Rewriting bullet points with power action verbs..." },
    { p: 90, title: "Finding match", text: "Retrieving high-affinity live job listings..." },
  ];

  let stepIndex = 0;
  progressInterval = setInterval(() => {
    if (progress < 90) {
      progress += 1.8;
      
      if (stepIndex < steps.length && progress >= steps[stepIndex].p) {
        loadingTitle.innerText = steps[stepIndex].title;
        loadingText.innerText = steps[stepIndex].text;
        stepIndex++;
      }

      const offset = totalLength - (progress / 100) * totalLength;
      progressCircle.style.strokeDashoffset = offset;
    }
  }, 60);
}

function completeProgressAnimation(callback) {
  clearInterval(progressInterval);
  const progressCircle = document.getElementById("progress-circle");
  const loadingTitle = document.getElementById("loading-title");
  const loadingText = document.getElementById("loading-text");

  progressCircle.style.strokeDashoffset = "0";
  loadingTitle.innerText = "Complete!";
  loadingText.innerText = "Your new professional story is ready.";

  setTimeout(() => {
    resetUploadUI();
    if (callback) callback();
  }, 700);
}

function resetUploadUI() {
  clearInterval(progressInterval);
  const dropDefault = document.getElementById("drop-default");
  const dropActive = document.getElementById("drop-active");
  const uploadState = document.getElementById("upload-state");
  const dropzone = document.getElementById("dropzone");
  const progressCircle = document.getElementById("progress-circle");
  const fileInput = document.getElementById("file-input");

  if (uploadState) uploadState.classList.add("hidden");
  if (dropActive) dropActive.classList.add("hidden");
  if (dropDefault) dropDefault.classList.remove("hidden");
  if (dropzone) dropzone.classList.remove("pointer-events-none");
  if (progressCircle) progressCircle.style.strokeDashoffset = "283";
  if (fileInput) fileInput.value = "";
}
