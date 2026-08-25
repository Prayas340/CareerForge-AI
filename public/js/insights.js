/**
 * CareerForge AI - Insights & Multi-Dimensional Rating Renderer with Smooth Fluid Animations
 */

// Ease-out cubic easing curve
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// Smooth Number Counting Animation
function animateNumberCount(element, startVal, endVal, durationMs = 1200, suffix = "") {
  if (!element) return;
  const startTime = performance.now();
  const range = endVal - startVal;

  function updateCount(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    const easedProgress = easeOutCubic(progress);
    const currentVal = Math.round(startVal + range * easedProgress);

    element.innerText = `${currentVal}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateCount);
    } else {
      element.innerText = `${endVal}${suffix}`;
    }
  }

  requestAnimationFrame(updateCount);
}

function renderInsights(insights, structuredCv) {
  if (!insights) return;

  const fullName = structuredCv?.personal_info?.full_name || "Alex";
  const firstName = fullName.split(" ")[0];

  // 1. Overall Score & Circular Gauge
  const score = insights.overall_score || 78;
  const label = insights.score_label || "Strong Foundation";
  
  const scoreElem = document.getElementById("gauge-score");
  const labelElem = document.getElementById("gauge-label");
  const circleElem = document.getElementById("gauge-circle");
  
  if (labelElem) labelElem.innerText = label;
  
  // Animate Gauge Number & Stroke
  if (scoreElem) {
    animateNumberCount(scoreElem, 0, score, 1300, "");
    scoreElem.classList.remove("score-number-pop");
    void scoreElem.offsetWidth; // Trigger reflow
    scoreElem.classList.add("score-number-pop");
  }
  
  if (circleElem) {
    const circumference = 251.2; // 2 * pi * 40
    // Reset to empty first
    circleElem.style.transition = "none";
    circleElem.style.strokeDashoffset = circumference;
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        circleElem.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1)";
        const targetOffset = circumference - (score / 100) * circumference;
        circleElem.style.strokeDashoffset = targetOffset;
      });
    });
  }

  // 2. Greeting & Feedback Summary
  const greetingElem = document.getElementById("insights-greeting");
  const critiqueElem = document.getElementById("insights-critique");
  
  if (greetingElem) greetingElem.innerText = `You're off to a great start, ${firstName}!`;
  if (critiqueElem && insights.summary_critique) {
    critiqueElem.innerText = insights.summary_critique;
  }

  // 3. Four Metric Cards with Cascading Animated Bars
  const dims = insights.dimensions || {};
  
  // ATS Compatibility
  const ats = dims.ats_compatibility || { score: 85, feedback: "Parsers can easily read your timeline." };
  animateMetricCard("ats", ats.score, ats.feedback, 80);

  // Impact & Metrics
  const impact = dims.impact_metrics || { score: 62, feedback: "Lacking quantifiable results in recent roles." };
  animateMetricCard("impact", impact.score, impact.feedback, 200);

  // Readability
  const readability = dims.readability || { score: 90, feedback: "Clear phrasing and good use of action verbs." };
  animateMetricCard("readability", readability.score, readability.feedback, 320);

  // Industry Alignment
  const industry = dims.industry_alignment || { score: 75, feedback: "Missing key modern frameworks for Senior roles." };
  animateMetricCard("industry", industry.score, industry.feedback, 440);
}

function animateMetricCard(name, score, feedback, staggerDelayMs = 0) {
  const scoreElem = document.getElementById(`score-${name}`);
  const feedbackElem = document.getElementById(`feedback-${name}`);
  const barElem = document.getElementById(`bar-${name}`);

  if (feedbackElem) feedbackElem.innerText = feedback;

  // Add animated-score-bar CSS class
  if (barElem) {
    barElem.classList.add("animated-score-bar");
    // Start at 0%
    barElem.style.width = "0%";
    
    // Set dynamic color classes based on score
    barElem.classList.remove("bg-primary", "bg-error", "bg-secondary", "bg-[#b89047]");
    if (score >= 80) {
      barElem.classList.add("bg-primary");
    } else if (score >= 70) {
      barElem.classList.add("bg-[#b89047]");
    } else {
      barElem.classList.add("bg-error");
    }

    setTimeout(() => {
      barElem.style.width = `${score}%`;
    }, staggerDelayMs);
  }

  // Animate count-up on percentage
  if (scoreElem) {
    setTimeout(() => {
      animateNumberCount(scoreElem, 0, score, 1100, "%");
      scoreElem.classList.remove("score-number-pop");
      void scoreElem.offsetWidth; // Reflow
      scoreElem.classList.add("score-number-pop");
    }, staggerDelayMs);
  }
}
