/**
 * CareerForge AI - Conversational Coach AI Drawer
 */

let coachOpen = false;

function toggleCoach() {
  const drawer = document.getElementById("coach-drawer");
  if (!drawer) return;

  coachOpen = !coachOpen;
  if (coachOpen) {
    drawer.classList.remove("opacity-0", "translate-y-6", "pointer-events-none");
    drawer.classList.add("opacity-100", "translate-y-0", "pointer-events-auto");
    const input = document.getElementById("coach-input");
    if (input) setTimeout(() => input.focus(), 150);
  } else {
    drawer.classList.add("opacity-0", "translate-y-6", "pointer-events-none");
    drawer.classList.remove("opacity-100", "translate-y-0", "pointer-events-auto");
  }
}

async function handleCoachSubmit(e) {
  if (e) e.preventDefault();
  const input = document.getElementById("coach-input");
  if (!input) return;

  const msg = input.value.trim();
  if (!msg) return;

  input.value = "";
  appendCoachMessage("user", msg);

  // Add temporary typing indicator
  const typingId = appendTypingIndicator();

  try {
    const res = await api.chatCoach(appState.sessionId, msg, appState.chatHistory);
    removeTypingIndicator(typingId);
    
    appendCoachMessage("coach", res.reply);
    appState.chatHistory.push({ role: "user", content: msg });
    appState.chatHistory.push({ role: "model", content: res.reply });
  } catch (err) {
    removeTypingIndicator(typingId);
    appendCoachMessage("coach", "I'm analyzing your profile context. Tip: Try adding 2-3 quantified metrics to your lead work experience bullets using the Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z]).");
  }
}

function sendCoachQuickPrompt(promptText) {
  const input = document.getElementById("coach-input");
  if (input) {
    input.value = promptText;
    handleCoachSubmit();
  }
}

function appendCoachMessage(sender, text) {
  const container = document.getElementById("coach-messages");
  if (!container) return;

  const msgDiv = document.createElement("div");
  if (sender === "user") {
    msgDiv.className = "flex items-start gap-2 max-w-[85%] ml-auto bg-primary text-white p-3 rounded-2xl rounded-tr-none shadow-sm";
    msgDiv.innerHTML = `<p class="text-xs leading-relaxed">${escapeHTML(text)}</p>`;
  } else {
    msgDiv.className = "flex items-start gap-2 max-w-[85%] bg-surface-container dark:bg-[#2a2a2a] text-on-surface dark:text-[#f8fafc] p-3 rounded-2xl rounded-tl-none border border-outline-variant/20 dark:border-[#334155]";
    msgDiv.innerHTML = `<p class="text-xs leading-relaxed">${formatCoachReply(text)}</p>`;
  }

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById("coach-messages");
  if (!container) return null;

  const id = "typing-" + Date.now();
  const div = document.createElement("div");
  div.id = id;
  div.className = "flex items-center gap-1.5 p-3 rounded-2xl rounded-tl-none bg-surface-container dark:bg-[#2a2a2a] max-w-[80px]";
  div.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-primary animate-bounce"></span>
    <span class="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
    <span class="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  if (!id) return;
  const elem = document.getElementById(id);
  if (elem) elem.remove();
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

function formatCoachReply(str) {
  return escapeHTML(str)
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}
