const API_BASE_URL = "http://localhost:3000/api";

async function apiFetch(path, options = {}) {
  const response = await fetch(API_BASE_URL + path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const logoutButton = document.getElementById("logout-button");

const welcomeMessage = document.getElementById("welcome-message");
const userInfo = document.getElementById("user-info");
const dashboardStatus = document.getElementById("dashboard-status");

const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDescription = document.getElementById("task-description");
const taskResponsiblePerson = document.getElementById("task-responsible-person");
const taskStatus = document.getElementById("task-status");
const taskDueDate = document.getElementById("task-due-date");
const taskFormMessage = document.getElementById("task-form-message");

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
      const sectionId = button.dataset.section;

      showSection(sectionId);

      if (sectionId === "tasks-section") {
        loadTasks();
      }

      if (sectionId === "decisions-section") {
        loadDecisions();
      }
    });
  });

  checkLogin();
});

if (taskForm) {
  taskForm.addEventListener("submit", handleTaskFormSubmit);
}

async function handleTaskFormSubmit(event) {
  event.preventDefault();

  taskFormMessage.textContent = "Creating task...";

  const newTask = {
    title: taskTitle.value,
    description: taskDescription.value,
    responsiblePerson: taskResponsiblePerson.value,
    status: taskStatus.value,
    dueDate: taskDueDate.value
  };

  try {
    await apiFetch("/tasks", {
      method: "POST",
      body: JSON.stringify(newTask)
    });

    taskForm.reset();
    taskFormMessage.textContent = "Task was created.";

    await loadTasks();
  } catch (error) {
    taskFormMessage.textContent = error.message;
  }
}

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
      //the browser is allowed to send the session cookie together with the request to the backend, which is necessary for authentication and session management
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
    //role
    userInfo.textContent = currentUser.username + " (" + currentUser.role + ")";
  } else {
    userInfo.textContent = "member";
  }

  openTasks.textContent = data.openTasks || 0;
  completedTasks.textContent = data.completedTasks || 0;
  openDecisions.textContent = data.openDecisions || 0;
  approvedDecisions.textContent = data.approvedDecisions || 0;

  dashboardStatus.textContent = "Dashboard data was loaded with fetch().";
}

async function loadTasks() {
  try {
    const data = await apiFetch("/tasks");
    const tasks = data.tasks;

    let openCounter = 0;
    let doneCounter = 0;

    tasks.forEach(function (task) {
      if (task.status && task.status.toLowerCase() === "done") {
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
      return;
    }

    tasks.forEach(function (task) {
      const taskElement = document.createElement("div");
      taskElement.className = "list-item";

      const titleLabel = document.createElement("label");
      titleLabel.textContent = "Title";

      const titleInput = document.createElement("input");
      titleInput.className = "edit-task-title";
      titleInput.value = task.title || "";

      const responsibleLabel = document.createElement("label");
      responsibleLabel.textContent = "Responsible person";

      const responsibleInput = document.createElement("input");
      responsibleInput.className = "edit-task-responsible";
      responsibleInput.value = task.responsiblePerson || "";

      const statusLabel = document.createElement("label");
      statusLabel.textContent = "Status";

      const statusSelect = document.createElement("select");
      statusSelect.className = "edit-task-status";

      const statuses = ["New", "In Progress", "Waiting for Feedback", "Done"];

      statuses.forEach(function (status) {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;

        if (task.status === status) {
          option.selected = true;
        }

        statusSelect.appendChild(option);
      });

      const dueDateLabel = document.createElement("label");
      dueDateLabel.textContent = "Due date";

      const dueDateInput = document.createElement("input");
      dueDateInput.className = "edit-task-due-date";
      dueDateInput.type = "date";
      dueDateInput.value = task.dueDate || "";

      const saveButton = document.createElement("button");
      saveButton.textContent = "Save changes";

      saveButton.type = "button";

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.textContent = "Delete task";

      deleteButton.addEventListener("click", function () {
      deleteTask(task.id);
      });

      const message = document.createElement("p");
      message.className = "message";

      saveButton.addEventListener("click", function () {
        updateTask(task.id, taskElement, message);
      });

      taskElement.appendChild(titleLabel);
      taskElement.appendChild(titleInput);

      taskElement.appendChild(responsibleLabel);
      taskElement.appendChild(responsibleInput);

      taskElement.appendChild(statusLabel);
      taskElement.appendChild(statusSelect);

      taskElement.appendChild(dueDateLabel);
      taskElement.appendChild(dueDateInput);

      taskElement.appendChild(saveButton);
      taskElement.appendChild(deleteButton);
      taskElement.appendChild(message);

      tasksList.appendChild(taskElement);
    });
  } catch (error) {
    tasksList.innerHTML = "<p class='message error'>Could not load tasks.</p>";
    openTasks.textContent = "-";
    completedTasks.textContent = "-";
  }
}

async function updateTask(taskId, taskElement, messageElement) {
  messageElement.textContent = "Saving task...";

  const titleInput = taskElement.querySelector(".edit-task-title");
  const responsibleInput = taskElement.querySelector(".edit-task-responsible");
  const statusSelect = taskElement.querySelector(".edit-task-status");
  const dueDateInput = taskElement.querySelector(".edit-task-due-date");

  const updatedTask = {
    title: titleInput.value,
    responsiblePerson: responsibleInput.value,
    status: statusSelect.value,
    dueDate: dueDateInput.value
  };

  try {
    await apiFetch("/tasks/" + taskId, {
      method: "PUT",
      body: JSON.stringify(updatedTask)
    });

    messageElement.textContent = "Task was updated.";

    await loadTasks();
  } catch (error) {
    messageElement.textContent = "Could not update task.";
  }
}

async function deleteTask(taskId) {
  const shouldDelete = confirm("Do you really want to delete this task?");

  if (!shouldDelete) {
    return;
  }

  try {
    await apiFetch("/tasks/" + taskId, {
      method: "DELETE"
    });

    await loadTasks();
  } catch (error) {
    alert("Could not delete task.");
  }
}

function renderTasks(tasks) {
  const tasksList = document.getElementById("tasks-list");

  tasksList.innerHTML = "";

  if (tasks.length === 0) {
    tasksList.textContent = "No tasks found.";
    return;
  }

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";

    const title = document.createElement("h3");
    title.textContent = task.title;

    const responsiblePerson = document.createElement("p");
    responsiblePerson.textContent = "Responsible: " + (task.responsiblePerson || "Not set");

    const status = document.createElement("p");
    status.textContent = "Status: " + (task.status || "New");

    const dueDate = document.createElement("p");
    dueDate.textContent = "Due date: " + (task.dueDate || "Not set");

    taskCard.appendChild(title);
    taskCard.appendChild(responsiblePerson);
    taskCard.appendChild(status);
    taskCard.appendChild(dueDate);

    tasksList.appendChild(taskCard);
  });
}

async function loadDecisions() {
  try {
    const data = await apiFetch("/decisions");
    const decisions = data.decisions;

    decisionsList.innerHTML = "";
    recentDecisionsList.innerHTML = "";

    if (decisions.length === 0) {
      decisionsList.innerHTML = "<p class='muted'>No decisions available yet.</p>";
      recentDecisionsList.innerHTML = "<p class='muted'>No recent decisions available yet.</p>";
      return;
    }

    decisions.forEach(function (decision) {
      const decisionElement = document.createElement("div");
      decisionElement.className = "list-item";

      const title = document.createElement("h4");
      title.textContent = decision.title;

      const description = document.createElement("p");
      description.textContent = decision.description;

      const status = document.createElement("p");
      status.innerHTML = "Status: <span class='status-badge'>" + decision.status + "</span>";

      decisionElement.appendChild(title);
      decisionElement.appendChild(description);
      decisionElement.appendChild(status);

      decisionsList.appendChild(decisionElement);
    });

    const recentDecisions = decisions.slice(0, 3);

    recentDecisions.forEach(function (decision) {
      const decisionElement = document.createElement("div");
      decisionElement.className = "list-item";

      const title = document.createElement("strong");
      title.textContent = decision.title;

      const status = document.createElement("p");
      status.innerHTML = "Status: <span class='status-badge'>" + decision.status + "</span>";

      decisionElement.appendChild(title);
      decisionElement.appendChild(status);

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