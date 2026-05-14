/**
 * MODULE: AcadBot Professional Student Script
 */

let studentId = null;
let currentSessionId = null;
let isSignupMode = false;
let trendsChart = null;

window.onload = () => {
  const saved = localStorage.getItem("stu_id");
  if (saved) {
    studentId = saved;
    document.getElementById("login-overlay").style.display = "none";
    document.getElementById("display-student-id").textContent = "ID: " + saved;
    showView('chat');
    loadSessions();
  }

  // NEW: Enter to Send Listener
  const textarea = document.getElementById("user-input");
  if (textarea) {
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }
};

async function handleAuth() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-pass").value;
  const name = document.getElementById("signup-name").value;
  const sid = document.getElementById("signup-sid").value;

  const endpoint = isSignupMode ? "/api/auth/signup" : "/api/auth/login";
  const body = isSignupMode ? { name, email, password, studentId: sid } : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      if (isSignupMode) { alert("Account created!"); toggleAuth(false); } 
      else {
        studentId = data.studentId;
        localStorage.setItem("stu_id", studentId);
        document.getElementById("login-overlay").style.display = "none";
        document.getElementById("display-student-id").textContent = "ID: " + studentId;
        showView('chat');
        loadSessions();
      }
    } else { alert(data.error); }
  } catch (e) { alert("Auth Failed"); }
}

async function loadSessions() {
  const container = document.getElementById("recent-chats-list");
  try {
    const res = await fetch(`/api/chat/sessions?studentId=${studentId}`);
    const sessions = await res.json();
    container.innerHTML = sessions.map(s => `
      <div class="session-item ${s._id === currentSessionId ? 'active-session' : ''}" 
           onclick="loadSession('${s._id}')" 
           style="display:flex; justify-content:space-between; align-items:center; padding:10px; margin-bottom:5px; border-radius:10px; cursor:pointer; background:rgba(255,255,255,0.03); border:1px solid transparent; transition:0.3s;">
        <span style="font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:130px;">💬 ${s.title}</span>
        <button onclick="event.stopPropagation(); deleteSession('${s._id}')" style="background:none; border:none; color:#ef4444; font-size:10px; cursor:pointer; opacity:0.5;">✕</button>
      </div>
    `).join('');
  } catch(e) { console.error(e); }
}

async function loadSession(id) {
  currentSessionId = id;
  loadSessions(); // Update Active State
  showView('chat');
  const container = document.getElementById("chat-messages");
  container.innerHTML = `<p style="text-align:center; opacity:0.5;">Loading conversation...</p>`;
  try {
    const res = await fetch(`/api/chat/session/${id}`);
    const messages = await res.json();
    container.innerHTML = "";
    messages.forEach(m => appendMessage(m.role, m.content, m.content.includes("[BOOK_NOW]")));
  } catch(e) { console.error(e); }
}

async function deleteSession(id) {
  if(!confirm("Delete this conversation?")) return;
  try {
    await fetch(`/api/chat/session/${id}`, { method: 'DELETE' });
    if (currentSessionId === id) startFreshChat();
    loadSessions();
  } catch(e) { alert("Failed to delete"); }
}

function startFreshChat() {
  currentSessionId = null;
  loadSessions(); // Clear Active State
  document.getElementById("chat-messages").innerHTML = "";
  appendMessage("assistant", "Hello! I am AcadBot. Let's start a new discussion. How can I help you today?");
  showView('chat');
}

function showView(name) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  const target = document.getElementById("view-" + name);
  if (target) target.style.display = "flex";
  if (name === 'appointment') loadStudentAppointments();
}

async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;
  appendMessage("user", text);
  input.value = "";
  const typing = showTyping();
  try {
    const provider = document.getElementById("model-selector").value;
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, studentId, sessionId: currentSessionId, provider })
    });
    const data = await res.json();
    typing.remove();
    if (data.response) {
      if (!currentSessionId) {
        currentSessionId = data.sessionId;
        loadSessions();
      }
      renderResponse(data.response, data.usage, data.provider);
    } else {
      appendMessage("assistant", "I'm sorry, I'm having a connection issue. Please try refreshing the page.");
    }
  } catch (err) { 
    if (typing) typing.remove();
    appendMessage("assistant", "The system is momentarily unavailable. Please check your internet and try again.");
  }
}

function renderResponse(raw, usage, provider) {
  const hasBookNow = raw.includes("[BOOK_NOW]");
  const chips = raw.match(/\[SUGGESTED\]:\s*([^[\n]+)/g);
  let cleanText = raw.replace(/\[SUGGESTED\]:\s*([^[\n]+)/g, '').replace(/\[BOOK_NOW\]/g, '').replace(/\[LOG:.*?\]/g, '').trim();
  appendMessage("assistant", cleanText, hasBookNow, usage, provider);
  const chipContainer = document.getElementById("suggestion-chips");
  chipContainer.innerHTML = "";
  if (chips) {
    chips.forEach(c => {
      const label = c.replace('[SUGGESTED]:', '').trim();
      const b = document.createElement("button");
      b.className = "chip-btn";
      b.textContent = label;
      b.onclick = () => { input.value = label; sendMessage(); };
      chipContainer.appendChild(b);
    });
  }
}

function parseMarkdown(text) {
  if (!text) return "";
  // 1. Bullet points
  let html = text.replace(/^\*\s(.*)/gm, '<li>$1</li>');
  // 2. Bold text
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // 3. Newlines
  html = html.replace(/\n/g, '<br/>');
  // 4. Wrap lists
  if (html.includes('<li>')) {
    html = html.replace(/(<li>.*<\/li>)/gms, '<ul style="margin: 10px 0 10px 20px;">$1</ul>');
  }
  return html;
}

async function appendMessage(role, content, showBookBtn = false, usage = null, provider = null) {
  const container = document.getElementById("chat-messages");
  const div = document.createElement("div");
  div.className = `message ${role}-message`;
  
  let metaHtml = "";
  if (role === "assistant") {
    const providerName = provider || "AcadBot AI";
    const tokens = usage && usage.totalTokenCount ? ` | ⚡ ${usage.totalTokenCount} tkn` : "";
    metaHtml = `<div style="font-size:9px; opacity:0.5; margin-top:5px; text-align:right;">🤖 ${providerName}${tokens}</div>`;
  }

  const avatar = `<div class="avatar">${role === 'user' ? '👤' : '🤖'}</div>`;
  const bubbleId = `bubble-${Date.now()}`;
  
  div.innerHTML = `
    ${avatar}
    <div class="bubble" id="${bubbleId}"></div>
  `;
  container.appendChild(div);
  
  const bubble = document.getElementById(bubbleId);
  
  if (role === 'assistant') {
    // ⌨️ Typing Effect
    const fullHtml = parseMarkdown(content) + (showBookBtn ? `<br/><button onclick="showView('appointment')" style="margin-top:10px;">📅 Book Consultation</button>` : "") + metaHtml;
    await typeEffect(bubble, fullHtml);
  } else {
    bubble.innerHTML = parseMarkdown(content);
  }
  
  container.scrollTop = container.scrollHeight;
}

function typeEffect(element, html) {
  return new Promise((resolve) => {
    let i = 0;
    const speed = 15; // ms per char
    element.innerHTML = "";
    
    // To handle HTML tags, we reveal the full HTML gradually using a hidden div or similar
    // But for simplicity, we'll just inject the HTML and use a "fade in" or "clip" effect
    // OR we can just show it instantly if it's too complex. 
    // Let's do a simple "chunk" reveal.
    
    element.style.opacity = 0;
    element.innerHTML = html;
    let opacity = 0;
    const timer = setInterval(() => {
      opacity += 0.1;
      element.style.opacity = opacity;
      if (opacity >= 1) {
        clearInterval(timer);
        resolve();
      }
    }, 30);
  });
}

function showTyping() {
  const c = document.getElementById("chat-messages");
  const t = document.createElement("div");
  t.className = "message bot-message typing-indicator";
  t.innerHTML = `<div class="avatar">🤖</div><div class="bubble" style="opacity:0.7;">Thinking...</div>`;
  c.appendChild(t);
  c.scrollTop = c.scrollHeight;
  return t;
}

function toggleAuth(signup) {
  isSignupMode = signup;
  document.getElementById("auth-title").textContent = signup ? "Create Account" : "Welcome Back";
  document.getElementById("signup-fields").style.display = signup ? "block" : "none";
  document.getElementById("signup-fields-2").style.display = signup ? "block" : "none";
  document.getElementById("auth-btn").textContent = signup ? "Sign Up" : "Login";
}

function clearSession() { localStorage.clear(); location.reload(); }
