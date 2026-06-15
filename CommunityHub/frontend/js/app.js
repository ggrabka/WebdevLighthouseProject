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

const decisionForm = document.getElementById("decision-form");
const decisionTitle = document.getElementById("decision-title");
const decisionDescription = document.getElementById("decision-description");
const decisionProposal = document.getElementById("decision-proposal");
const decisionStatus = document.getElementById("decision-status");
const decisionFormMessage = document.getElementById("decision-form-message");

const navButtons = document.querySelectorAll(".nav-button");
const dashboardSections = document.querySelectorAll(".dashboard-section");

const hamburgerButton = document.getElementById("hamburger-button");
const sidebarMenu = document.getElementById("sidebar-menu");
const sidebarOverlay = document.getElementById("sidebar-overlay");

const weatherLocation = document.getElementById("weather-location");
const weatherTemperature = document.getElementById("weather-temperature");
const weatherWind = document.getElementById("weather-wind");
const weatherMessage = document.getElementById("weather-message");

const newTaskButton = document.getElementById("new-task-button");
const taskCreateCard = document.getElementById("task-create-card");

const newDecisionButton = document.getElementById("new-decision-button");
const decisionCreateCard = document.getElementById("decision-create-card");

let currentUser = null;

function isAdmin() {
  return currentUser && currentUser.role === "admin";
}

function updateTaskFormVisibility() {
  if (!newTaskButton || !taskCreateCard) {
    return;
  }

  if (isAdmin()) {
    newTaskButton.classList.remove("hidden");
    taskCreateCard.classList.add("hidden");
    newTaskButton.textContent = "+ New Task";
  } else {
    newTaskButton.classList.add("hidden");
    taskCreateCard.classList.add("hidden");
  }
}

function updateDecisionFormVisibility() {
  if (!newDecisionButton || !decisionCreateCard) {
    return;
  }

  if (isAdmin()) {
    newDecisionButton.classList.remove("hidden");
    decisionCreateCard.classList.add("hidden");
    newDecisionButton.textContent = "+ New Decision";
  } else {
    newDecisionButton.classList.add("hidden");
    decisionCreateCard.classList.add("hidden");
  }
}

function updateRoleBasedVisibility() {
  updateTaskFormVisibility();
  updateDecisionFormVisibility();
}

function openSidebar() {
  sidebarMenu.classList.remove("hidden");
  sidebarOverlay.classList.remove("hidden");
}

function closeSidebar() {
  sidebarMenu.classList.add("hidden");
  sidebarOverlay.classList.add("hidden");
}

function toggleSidebar() {
  if (sidebarMenu.classList.contains("hidden")) {
    openSidebar();
  } else {
    closeSidebar();
  }
}

function toggleTaskCreateForm() {
  if (taskCreateCard.classList.contains("hidden")) {
    taskCreateCard.classList.remove("hidden");
    newTaskButton.textContent = "Cancel";
  } else {
    taskCreateCard.classList.add("hidden");
    newTaskButton.textContent = "+ New Task";
  }
}

function toggleDecisionCreateForm() {
  if (decisionCreateCard.classList.contains("hidden")) {
    decisionCreateCard.classList.remove("hidden");
    newDecisionButton.textContent = "Cancel";
  } else {
    decisionCreateCard.classList.add("hidden");
    newDecisionButton.textContent = "+ New Decision";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loginForm.addEventListener("submit", login);
  logoutButton.addEventListener("click", logout);

  if (hamburgerButton) {
    hamburgerButton.addEventListener("click", function () {
      toggleSidebar();
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function () {
      closeSidebar();
    });
  }

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

      closeSidebar();
    });
  });

  if (newTaskButton) {
    newTaskButton.addEventListener("click", function () {
      toggleTaskCreateForm();
    });
  }

  if (newDecisionButton) {
    newDecisionButton.addEventListener("click", function () {
      toggleDecisionCreateForm();
    });
  }

  checkLogin();
});

if (taskForm) {
  taskForm.addEventListener("submit", handleTaskFormSubmit);
}

if (decisionForm) {
  decisionForm.addEventListener("submit", handleDecisionFormSubmit);
}

async function handleTaskFormSubmit(event) {
  event.preventDefault();

    if (!isAdmin()) {
    taskFormMessage.textContent = "Only admins can create tasks.";
    return;
  }

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

    taskCreateCard.classList.add("hidden");
newTaskButton.textContent = "+ New Task";

    await loadTasks();
  } catch (error) {
    taskFormMessage.textContent = error.message;
  }
}

async function handleDecisionFormSubmit(event) {
  event.preventDefault();

  if (!isAdmin()) {
  decisionFormMessage.textContent = "Only admins can create decisions.";
  return;
}

  decisionFormMessage.textContent = "Creating decision...";

  const newDecision = {
    title: decisionTitle.value,
    description: decisionDescription.value,
    proposal: decisionProposal.value,
    status: decisionStatus.value
  };

  try {
    await apiFetch("/decisions", {
      method: "POST",
      body: JSON.stringify(newDecision)
    });

    decisionForm.reset();
    decisionFormMessage.textContent = "Decision was created.";

    decisionCreateCard.classList.add("hidden");
newDecisionButton.textContent = "+ New Decision";

    await loadDecisions();
    await loadDashboard();
    showSection("decisions-section");
  } catch (error) {
    decisionFormMessage.textContent = error.message;
  }
}

async function checkLogin() {
  try {
    const loginData = await apiFetch("/protected");

    currentUser = loginData.user;

    await loadDashboard();
    await loadWeather();

    updateRoleBasedVisibility();
    showDashboard();
  } catch (error) {
    currentUser = null;
    updateRoleBasedVisibility();

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
      await loadWeather();
      updateRoleBasedVisibility();
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
  updateRoleBasedVisibility();

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

const openTaskCount = data.openTasks || 0;
const completedTaskCount = data.completedTasks || 0;
const openDecisionCount = data.openDecisions || 0;
const approvedDecisionCount = data.approvedDecisions || 0;

openTasks.textContent = openTaskCount;
completedTasks.textContent = completedTaskCount;
openDecisions.textContent = openDecisionCount;
approvedDecisions.textContent = approvedDecisionCount;

if (openTaskCount > 0 && openDecisionCount > 0) {
  dashboardStatus.textContent =
    "There are " + openTaskCount + " open tasks and " +
    openDecisionCount + " open decisions.";
} else if (openTaskCount > 0) {
  dashboardStatus.textContent =
    "There are " + openTaskCount + " open tasks that need attention.";
} else if (openDecisionCount > 0) {
  dashboardStatus.textContent =
    "There are " + openDecisionCount + " open decisions to review.";
} else {
  dashboardStatus.textContent =
    "Everything looks good. There are no open tasks or decisions.";
}
}

async function loadWeather() {
  try {
    const data = await apiFetch("/weather");

    weatherLocation.textContent = data.location;
    weatherTemperature.textContent = data.temperature + " °C";
    weatherWind.textContent = data.windSpeed + " km/h";
    weatherMessage.textContent = data.weatherText;
  } catch (error) {
    weatherLocation.textContent = "-";
    weatherTemperature.textContent = "-";
    weatherWind.textContent = "-";
    weatherMessage.textContent = "Weather could not be loaded.";
  }
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

      const title = document.createElement("h4");
      title.textContent = task.title || "Untitled task";

      const description = document.createElement("p");
      description.textContent = task.description || "No description available.";

      const responsiblePerson = document.createElement("p");
      responsiblePerson.textContent =
        "Responsible person: " + (task.responsiblePerson || task.responsible_person || "Not set");

      const status = document.createElement("p");
      status.innerHTML =
        "Status: <span class='status-badge'>" + (task.status || "New") + "</span>";

      const dueDate = document.createElement("p");
      dueDate.textContent =
        "Due date: " + (task.dueDate || task.due_date || "Not set");

      taskElement.appendChild(title);
      taskElement.appendChild(description);
      taskElement.appendChild(responsiblePerson);
      taskElement.appendChild(status);
      taskElement.appendChild(dueDate);

      if (isAdmin()) {
        const actions = document.createElement("div");
        actions.className = "card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "danger-button";

        editButton.addEventListener("click", function () {
          showTaskEditForm(task, taskElement);
        });

        deleteButton.addEventListener("click", function () {
          deleteTask(task.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        taskElement.appendChild(actions);
      }

      tasksList.appendChild(taskElement);
    });
  } catch (error) {
    tasksList.innerHTML = "<p class='message error'>Could not load tasks.</p>";
    openTasks.textContent = "-";
    completedTasks.textContent = "-";
  }
}

function showTaskEditForm(task, taskElement) {
  taskElement.innerHTML = "";

  const titleLabel = document.createElement("label");
  titleLabel.textContent = "Title";

  const titleInput = document.createElement("input");
  titleInput.className = "edit-task-title";
  titleInput.value = task.title || "";

  const descriptionLabel = document.createElement("label");
  descriptionLabel.textContent = "Description";

  const descriptionInput = document.createElement("textarea");
  descriptionInput.className = "edit-task-description";
  descriptionInput.value = task.description || "";

  const responsibleLabel = document.createElement("label");
  responsibleLabel.textContent = "Responsible person";

  const responsibleInput = document.createElement("input");
  responsibleInput.className = "edit-task-responsible";
  responsibleInput.value = task.responsiblePerson || task.responsible_person || "";

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
  dueDateInput.value = task.dueDate || task.due_date || "";

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Save changes";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.className = "secondary-button";

  const message = document.createElement("p");
  message.className = "message";

  saveButton.addEventListener("click", function () {
    updateTask(task.id, taskElement, message);
  });

  cancelButton.addEventListener("click", function () {
    loadTasks();
  });

  actions.appendChild(saveButton);
  actions.appendChild(cancelButton);

  taskElement.appendChild(titleLabel);
  taskElement.appendChild(titleInput);

  taskElement.appendChild(descriptionLabel);
  taskElement.appendChild(descriptionInput);

  taskElement.appendChild(responsibleLabel);
  taskElement.appendChild(responsibleInput);

  taskElement.appendChild(statusLabel);
  taskElement.appendChild(statusSelect);

  taskElement.appendChild(dueDateLabel);
  taskElement.appendChild(dueDateInput);

  taskElement.appendChild(actions);
  taskElement.appendChild(message);
}

async function updateTask(taskId, taskElement, messageElement) {
  messageElement.textContent = "Saving task...";

  const titleInput = taskElement.querySelector(".edit-task-title");
  const descriptionInput = taskElement.querySelector(".edit-task-description");
  const responsibleInput = taskElement.querySelector(".edit-task-responsible");
  const statusSelect = taskElement.querySelector(".edit-task-status");
  const dueDateInput = taskElement.querySelector(".edit-task-due-date");

  const updatedTask = {
    title: titleInput.value,
    description: descriptionInput.value,
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
    await loadDashboard();

    showSection("tasks-section");
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
      title.textContent = decision.title || "Untitled decision";

      const description = document.createElement("p");
      description.textContent = decision.description || "No description available.";

      const proposal = document.createElement("p");
      proposal.textContent =
        "Proposal: " + (decision.proposal || "No proposal documented.");

      const currentStatus = document.createElement("p");
      currentStatus.innerHTML =
        "Current status: <span class='status-badge'>" + (decision.status || "Proposal") + "</span>";

      const currentResult = document.createElement("p");
      currentResult.textContent =
        "Result: " + (decision.result || "No result documented yet.");

      decisionElement.appendChild(title);
      decisionElement.appendChild(description);
      decisionElement.appendChild(proposal);
      decisionElement.appendChild(currentStatus);
      decisionElement.appendChild(currentResult);

      if (isAdmin()) {
        const actions = document.createElement("div");
        actions.className = "card-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "danger-button";

        editButton.addEventListener("click", function () {
          showDecisionEditForm(decision, decisionElement);
        });

        deleteButton.addEventListener("click", function () {
          deleteDecision(decision.id);
        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        decisionElement.appendChild(actions);
      }

      decisionsList.appendChild(decisionElement);
    });

    const recentDecisions = decisions.slice(0, 3);

    recentDecisions.forEach(function (decision) {
      const decisionElement = document.createElement("div");
      decisionElement.className = "list-item";

      const title = document.createElement("strong");
      title.textContent = decision.title;

      const status = document.createElement("p");
      status.innerHTML =
        "Status: <span class='status-badge'>" + decision.status + "</span>";

      decisionElement.appendChild(title);
      decisionElement.appendChild(status);

      recentDecisionsList.appendChild(decisionElement);
    });
  } catch (error) {
    decisionsList.innerHTML = "<p class='message error'>Could not load decisions.</p>";
    recentDecisionsList.innerHTML = "<p class='message error'>Could not load recent decisions.</p>";
  }
}

function showDecisionEditForm(decision, decisionElement) {
  decisionElement.innerHTML = "";

  const title = document.createElement("h4");
  title.textContent = decision.title || "Untitled decision";

  const description = document.createElement("p");
  description.textContent = decision.description || "No description available.";

  const proposal = document.createElement("p");
  proposal.textContent =
    "Proposal: " + (decision.proposal || "No proposal documented.");

  const statusLabel = document.createElement("label");
  statusLabel.textContent = "Change status";

  const statusSelect = document.createElement("select");
  statusSelect.className = "edit-decision-status";

  const statuses = ["Proposal", "In Discussion", "Approved", "Rejected", "Archived"];

  statuses.forEach(function (status) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = status;

    if (decision.status === status) {
      option.selected = true;
    }

    statusSelect.appendChild(option);
  });

  const resultLabel = document.createElement("label");
  resultLabel.textContent = "Result";

  const resultInput = document.createElement("textarea");
  resultInput.className = "edit-decision-result";
  resultInput.value = decision.result || "";

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const saveButton = document.createElement("button");
  saveButton.type = "button";
  saveButton.textContent = "Save decision";

  const cancelButton = document.createElement("button");
  cancelButton.type = "button";
  cancelButton.textContent = "Cancel";
  cancelButton.className = "secondary-button";

  const message = document.createElement("p");
  message.className = "message";

  saveButton.addEventListener("click", function () {
    updateDecision(decision.id, decisionElement, message);
  });

  cancelButton.addEventListener("click", function () {
    loadDecisions();
  });

  actions.appendChild(saveButton);
  actions.appendChild(cancelButton);

  decisionElement.appendChild(title);
  decisionElement.appendChild(description);
  decisionElement.appendChild(proposal);

  decisionElement.appendChild(statusLabel);
  decisionElement.appendChild(statusSelect);

  decisionElement.appendChild(resultLabel);
  decisionElement.appendChild(resultInput);

  decisionElement.appendChild(actions);
  decisionElement.appendChild(message);
}

async function updateDecision(decisionId, decisionElement, messageElement) {
  messageElement.textContent = "Saving decision...";

  const statusSelect = decisionElement.querySelector(".edit-decision-status");
  const resultInput = decisionElement.querySelector(".edit-decision-result");

  const updatedDecision = {
    status: statusSelect.value,
    result: resultInput.value
  };

  try {
    await apiFetch("/decisions/" + decisionId, {
      method: "PUT",
      body: JSON.stringify(updatedDecision)
    });

    messageElement.textContent = "Decision was updated.";

    await loadDecisions();
    await loadDashboard();

    showSection("decisions-section");
  } catch (error) {
    messageElement.textContent = "Could not update decision.";
  }
}

async function deleteDecision(decisionId) {
  const shouldDelete = confirm("Do you really want to delete this decision?");

  if (!shouldDelete) {
    return;
  }

  try {
    await apiFetch("/decisions/" + decisionId, {
      method: "DELETE"
    });

    await loadDecisions();
    await loadDashboard();

    showSection("decisions-section");
  } catch (error) {
    alert("Could not delete decision.");
  }
}

function showLogin() {
  loginView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
  closeSidebar();
}

function showDashboard() {
  loginView.classList.add("hidden");
  dashboardView.classList.remove("hidden");

  closeSidebar();
  showSection("summary-section");
}

function showSection(sectionId) {
  const selectedSection = document.getElementById(sectionId);

  if (!selectedSection) {
    return;
  }

  dashboardSections.forEach(function (section) {
    section.classList.add("hidden");
  });

  selectedSection.classList.remove("hidden");

  navButtons.forEach(function (button) {
    button.classList.remove("active");

    if (button.dataset.section === sectionId) {
      button.classList.add("active");
    }
  });
}