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

document.addEventListener("DOMContentLoaded", function () {
  loginForm.addEventListener("submit", login);
  logoutButton.addEventListener("click", logout);

  navButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      showSection(button.dataset.section);
    });
  });

  checkLogin();
});

async function checkLogin() {
  try {
    await loadDashboard();
    showDashboard();
  } catch (error) {
    showLogin();
    loginMessage.textContent = "Please log in to view the dashboard.";
  }
}

async function login(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  loginMessage.textContent = "Logging in...";

  try {
    const response = await fetch(API_BASE_URL + "/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();

    if (response.ok) {
      currentUser = data.user;
      loginMessage.textContent = "";

      await loadDashboard();
      showDashboard();
    } else {
      loginMessage.textContent = data.message;
      loginMessage.className = "message error";
    }
  } catch (error) {
    loginMessage.textContent = "Login failed.";
    loginMessage.className = "message error";
  }
}

async function logout() {
  try {
    await fetch(API_BASE_URL + "/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch (error) {
    console.log(error);
  }

  currentUser = null;

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

  showLogin();

  loginMessage.textContent = "You have been logged out.";
  loginMessage.className = "message success";
}

async function loadDashboard() {
  dashboardStatus.textContent = "Loading dashboard data...";

  const response = await fetch(API_BASE_URL + "/dashboard", {
    credentials: "include"
  });

  if (!response.ok) {
    throw new Error("Not logged in");
  }

  const data = await response.json();

  welcomeMessage.textContent = data.welcomeMessage || "Welcome to your community dashboard.";

  if (currentUser) {
    userInfo.textContent = currentUser.username + " (" + currentUser.role + ")";
  } else {
    userInfo.textContent = "member";
  }

  openTasks.textContent = data.openTasks || 0;
  completedTasks.textContent = data.completedTasks || 0;
  openDecisions.textContent = data.openDecisions || 0;
  approvedDecisions.textContent = data.approvedDecisions || 0;

  await loadTasks();
  await loadDecisions();

  dashboardStatus.textContent = "Dashboard data was loaded with fetch().";
}

async function loadTasks() {
  try {
    const response = await fetch(API_BASE_URL + "/tasks", {
      credentials: "include"
    });

    const data = await response.json();
    const tasks = data.tasks;

    let openCounter = 0;
    let doneCounter = 0;

    tasks.forEach(function (task) {
      if (task.status === "done") {
        doneCounter++;
      } else {
        openCounter++;
      }
    });

    openTasks.textContent = openCounter;
    completedTasks.textContent = doneCounter;

    tasksList.innerHTML = "";

    if (tasks.length === 0) {
      tasksList.innerHTML = "<p class='muted'>No tasks available yet.</p>";
    }

    tasks.forEach(function (task) {
      const taskElement = document.createElement("div");
      taskElement.className = "list-item";

      taskElement.innerHTML = `
        <strong>${task.title}</strong>
        <span>Responsible: ${task.responsiblePerson}</span>
        <span>Due date: ${task.dueDate}</span>
        <br>
        <span class="status-badge">${task.status}</span>
      `;

      tasksList.appendChild(taskElement);
    });
  } catch (error) {
    tasksList.innerHTML = "<p class='message error'>Could not load tasks.</p>";
    openTasks.textContent = "-";
    completedTasks.textContent = "-";
  }
}

async function loadDecisions() {
  try {
    const response = await fetch(API_BASE_URL + "/decisions", {
      credentials: "include"
    });

    const data = await response.json();
    const decisions = data.decisions;

    decisionsList.innerHTML = "";
    recentDecisionsList.innerHTML = "";

    if (decisions.length === 0) {
      decisionsList.innerHTML = "<p class='muted'>No decisions available yet.</p>";
      recentDecisionsList.innerHTML = "<p class='muted'>No recent decisions available yet.</p>";
    }

    decisions.forEach(function (decision) {
      const decisionElement = document.createElement("div");
      decisionElement.className = "list-item";

      decisionElement.innerHTML = `
        <strong>${decision.title}</strong>
        <br>
        <span class="status-badge">${decision.status}</span>
      `;

      decisionsList.appendChild(decisionElement);
    });

    const recentDecisions = decisions.slice(0, 3);

    recentDecisions.forEach(function (decision) {
      const decisionElement = document.createElement("div");
      decisionElement.className = "list-item";

      decisionElement.innerHTML = `
        <strong>${decision.title}</strong>
        <br>
        <span class="status-badge">${decision.status}</span>
      `;

      recentDecisionsList.appendChild(decisionElement);
    });
  } catch (error) {
    decisionsList.innerHTML = "<p class='message error'>Could not load decisions.</p>";
    recentDecisionsList.innerHTML = "<p class='message error'>Could not load recent decisions.</p>";
  }
}

function showLogin() {
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");

  showSection("summary-section");
}

function showSection(sectionId) {
  dashboardSections.forEach(function (section) {
    section.classList.add("hidden");
  });

  document.getElementById(sectionId).classList.remove("hidden");

  navButtons.forEach(function (button) {
    button.classList.remove("active");

    if (button.dataset.section === sectionId) {
      button.classList.add("active");
    }
  });
}