/**
 * MODULE: AcadBot Frontend Logic
 * Handles real-time chat, appointment booking, and analytics dashboard.
 */

let studentId = null;
let chatHistory = [];
let trendsChart = null;

// MODULE: Identity Management
function login() {
  const idInput = document.getElementById("student-id-input").value.trim();
  if (!idInput) return alert("Please enter a valid Student ID");
  
  studentId = idInput;
  localStorage.setItem("stu_id", studentId);
  document.getElementById("login-overlay").style.display = "none";
  document.getElementById("display-student-id").textContent = "ID: " + studentId;
  
  // Initial Load
  loadSession();
}

function loadSession() {
  const savedId = localStorage.getItem("stu_id");
  if (savedId) {
    studentId = savedId;
    document.getElementById("login-overlay").style.display = "none";
    document.getElementById("display-student-id").textContent = "ID: " + studentId;
  }
}

window.onload = loadSession;

// MODULE: Navigation
function showView(viewName) {
  document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  
  document.getElementById("view-" + viewName).classList.add("active");
  document.getElementById("btn-" + viewName).classList.add("active");
  
  if (viewName === "appointment") fetchAppointments();
  if (viewName === "analytics") loadAnalytics();
}

// MODULE: Chat Logic
async function sendMessage() {
  const input = document.getElementById("user-input");
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  input.value = "";
  
  const typing = showTyping();
  
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, history: chatHistory, studentId })
    });
    
    const data = await res.json();
    typing.remove();
    
    addMessage("assistant", data.response);
    chatHistory.push({ role: "user", content: text });
    chatHistory.push({ role: "assistant", content: data.response });
    
  } catch (err) {
    typing.remove();
    addMessage("assistant", "Sorry, I am facing a connection issue.");
  }
}

function addMessage(role, content) {
  const container = document.getElementById("chat-messages");
  const msgDiv = document.createElement("div");
  msgDiv.className = `message ${role}-message`;
  
  msgDiv.innerHTML = `
    <div class="avatar ${role}-avatar">${role === 'user' ? '👤' : '🤖'}</div>
    <div class="bubble">${content}</div>
  `;
  
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById("chat-messages");
  const typing = document.createElement("div");
  typing.className = "message bot-message typing";
  typing.innerHTML = `<div class="bubble">Typing...</div>`;
  container.appendChild(typing);
  return typing;
}

// MODULE: Appointments
async function submitAppointment() {
  const name = document.getElementById("appt-name").value;
  const email = document.getElementById("appt-email").value;
  const date = document.getElementById("appt-date").value;
  const time = document.getElementById("appt-time").value;
  const reason = document.getElementById("appt-reason").value;
  const status = document.getElementById("appt-status");

  try {
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, date, time, reason, studentId })
    });
    
    const data = await res.json();
    if (res.ok) {
      status.className = "appt-status success";
      status.textContent = "Confirmed! Slot reserved.";
      fetchAppointments();
    } else {
      status.className = "appt-status error";
      status.textContent = data.error;
    }
  } catch (err) {
    status.className = "appt-status error";
    status.textContent = "Server Error.";
  }
}

async function fetchAppointments() {
  const list = document.getElementById("appointments-list");
  const res = await fetch("/api/appointments");
  const appts = await res.json();
  
  list.innerHTML = appts.map(a => `
    <div class="appt-item">
      <div class="appt-info">
        <h4>${a.name}</h4>
        <p>${a.reason}</p>
      </div>
      <div class="appt-date-pill">${a.date} | ${a.time}</div>
    </div>
  `).join("");
}

// MODULE: Analytics Hub
async function loadAnalytics() {
  try {
    const res = await fetch("/api/analytics/trends");
    const data = await res.json();
    
    document.getElementById("total-queries").textContent = data.stats.reduce((a, b) => a + b.count, 0);
    document.getElementById("priority-cases").textContent = data.priorityCount;
    
    const labels = data.stats.map(s => s._id);
    const counts = data.stats.map(s => s.count);
    
    if (trendsChart) trendsChart.destroy();
    
    const ctx = document.getElementById('trendsChart').getContext('2d');
    trendsChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: counts,
          backgroundColor: ['#4f8ef7', '#7c5af7', '#22c55e', '#f59e0b', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { display: true, position: 'bottom', labels: { color: '#e8edf5' } } }
      }
    });
    
  } catch (err) {
    console.error("Analytics failed", err);
  }
}

// Helper: Auto-resize textarea
function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }
