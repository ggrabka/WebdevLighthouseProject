const API_BASE_URL = "http://localhost:3000/api";

const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");

const logoutButton = document.getElementById("logout-button");

const welcomeMessage = document.getElementById("welcome-message");
const userInfo = document.getElementById("user-info");
const dashboardStatus = document.getElementById("dashboard-status");

const openTasks = document.getElementById("open-tasks");
const completedTasks = document.getElementById("completed-tasks");
const openDecisions = document.getElementById("open-decisions");
const approvedDecisions = document.getElementById("approved-decisions");

const tasksList = document.getElementById("tasks-list");
const decisionsList = document.getElementById("decisions-list");
const recentDecisionsList = document.getElementById("recent-decisions-list");

const navButtons = document.querySelectorAll(".nav-button");
const dashboardSections = document.querySelectorAll(".dashboard-section");

let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  loginForm.addEventListener("submit", handleLogin);
  logoutButton.addEventListener("click", handleLogout);

  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showDashboardSection(button.dataset.section);
    });
  });

  await checkLoginState();
});

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function checkLoginState() {
  try {
    await loadDashboardData();
    showDashboardView();
  } catch (error) {
    showLoginView();

    if (error.status === 401) {
      loginMessage.textContent = "Please log in to view the dashboard.";
      loginMessage.className = "message";
    } else {
      loginMessage.textContent = "Could not connect to backend.";
      loginMessage.className = "message error";
    }
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  loginMessage.textContent = "Logging in...";
  loginMessage.className = "message";

  try {
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });

    currentUser = data.user;

    loginMessage.textContent = "";
    await loadDashboardData();
    showDashboardView();
  } catch (error) {
    loginMessage.textContent = error.message || "Login failed.";
    loginMessage.className = "message error";
  }
}

async function handleLogout() {
  try {
    await apiFetch("/logout", {
      method: "POST"
    });
  } catch (error) {
    console.log("Logout failed or session already ended:", error);
  }

  currentUser = null;
  clearDashboard();
  showLoginView();

  loginMessage.textContent = "You have been logged out.";
  loginMessage.className = "message success";
}

async function loadDashboardData() {
  dashboardStatus.textContent = "Loading dashboard data via fetch()...";

  const dashboardData = await apiFetch("/dashboard");
  renderDashboard(dashboardData);

  await loadTasks();
  await loadDecisions();

  dashboardStatus.textContent =
    "Dashboard data was loaded asynchronously from the backend.";
}

async function loadTasks() {
  try {
    const data = await apiFetch("/tasks");
    const tasks = extractArray(data, "tasks");

    const openTaskCount = tasks.filter((task) => {
  return task.status?.toLowerCase() !== "done";
}).length;

const completedTaskCount = tasks.filter((task) => {
  return task.status?.toLowerCase() === "done";
}).length;

    openTasks.textContent = openTaskCount;
    completedTasks.textContent = completedTaskCount;

    renderList(tasksList, tasks, "No tasks available yet.");
  } catch (error) {
    tasksList.innerHTML = `<p class="message error">Could not load tasks.</p>`;
    openTasks.textContent = "-";
    completedTasks.textContent = "-";
  }
}

async function loadDecisions() {
  try {
    const data = await apiFetch("/decisions");
    const decisions = extractArray(data, "decisions");

   const recentDecisions = [...decisions]
  .sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || 0);
    const dateB = new Date(b.createdAt || b.created_at || 0);

    return dateB - dateA;
  })
  .slice(0, 3);

    renderList(decisionsList, decisions, "No decisions available yet.");
    renderRecentDecisions(recentDecisions);
  } catch (error) {
    decisionsList.innerHTML =
      `<p class="message error">Could not load decisions.</p>`;

    recentDecisionsList.innerHTML =
      `<p class="message error">Could not load recent decisions.</p>`;
  }
}

function renderDashboard(data) {
  const dashboard = data.dashboard || data;

  welcomeMessage.textContent =
    dashboard.welcomeMessage ||
    dashboard.message ||
    "Welcome to your community dashboard.";

  openTasks.textContent =
    dashboard.openTasks ??
    dashboard.open_tasks ??
    0;

  completedTasks.textContent =
    dashboard.completedTasks ??
    dashboard.completed_tasks ??
    0;

  openDecisions.textContent =
    dashboard.openDecisions ??
    dashboard.open_decisions ??
    0;

  approvedDecisions.textContent =
    dashboard.approvedDecisions ??
    dashboard.approved_decisions ??
    0;

  const username =
    currentUser?.username ||
    dashboard.username ||
    "member";

  const role =
    currentUser?.role ||
    dashboard.userRole ||
    dashboard.role ||
    "member";

  userInfo.textContent = `${username} (${role})`;
}

function renderList(container, items, emptyMessage) {
  if (!items || items.length === 0) {
    container.innerHTML = `<p class="muted">${emptyMessage}</p>`;
    return;
  }

  container.innerHTML = "";

  items.forEach((item) => {
    const title =
      item.title ||
      item.name ||
      item.description ||
      "Untitled item";

    const description =
      item.description ||
      item.details ||
      "";

    const status =
      item.status ||
      item.state ||
      "open";

    const element = document.createElement("div");
    element.className = "list-item";

    element.innerHTML = `
      <strong>${escapeHtml(title)}</strong>
      ${description ? `<span>${escapeHtml(description)}</span>` : ""}
      <br />
      <span class="status-badge">${escapeHtml(status)}</span>
    `;

    container.appendChild(element);
  });
}

function renderRecentDecisions(decisions) {
  if (!decisions || decisions.length === 0) {
    recentDecisionsList.innerHTML =
      `<p class="muted">No recent decisions available yet.</p>`;
    return;
  }

  recentDecisionsList.innerHTML = "";

  decisions.forEach((decision) => {
    const title =
      decision.title ||
      decision.name ||
      "Untitled decision";

    const status =
      decision.status ||
      decision.state ||
      "open";

    const element = document.createElement("div");
    element.className = "list-item";

    element.innerHTML = `
      <strong>${escapeHtml(title)}</strong>
      <br />
      <span class="status-badge">${escapeHtml(status)}</span>
    `;

    recentDecisionsList.appendChild(element);
  });
}

function extractArray(data, propertyName) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data[propertyName])) {
    return data[propertyName];
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

function showLoginView() {
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
}

function showDashboardView() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  showDashboardSection("summary-section");
}

function showDashboardSection(sectionId) {
  dashboardSections.forEach((section) => {
    section.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");

  navButtons.forEach((button) => {
    button.classList.remove("active");

    if (button.dataset.section === sectionId) {
      button.classList.add("active");
    }
  });
}

function clearDashboard() {
  welcomeMessage.textContent = "";
  userInfo.textContent = "Logged out";
  dashboardStatus.textContent = "";

  openTasks.textContent = "-";
  completedTasks.textContent = "-";
  openDecisions.textContent = "-";
  approvedDecisions.textContent = "-";

  tasksList.innerHTML = "";
  decisionsList.innerHTML = "";
  recentDecisionsList.innerHTML = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}