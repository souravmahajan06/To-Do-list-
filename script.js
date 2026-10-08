const inputBox = document.getElementById("input-box");
const Btn = document.getElementById("Btn");
const taskForm = document.getElementById("task-form");
const statusSelect = document.getElementById("task-status");
const storageKey = "todoTasks";
const validStatuses = ["pending", "inprogress", "completed"];
const validOutcomes = ["", "not-set", "successful", "failed"];

const lists = {
  pending: document.getElementById("pending-list"),
  inprogress: document.getElementById("inprogress-list"),
  completed: document.getElementById("completed-list")
};

function updateTaskCounts() {
  for (const status of validStatuses) {
    const countElement = document.getElementById(`${status}-count`);
    if (countElement) {
      const taskCount = Array.from(lists[status].children).filter(item => !item.classList.contains("empty-state")).length;
      countElement.textContent = taskCount;
    }
  }
}

function updateEmptyStates() {
  for (const status of validStatuses) {
    const list = lists[status];
    let emptyState = list.querySelector(".empty-state");

    if (list.children.length === 0) {
      if (!emptyState) {
        emptyState = document.createElement("li");
        emptyState.className = "empty-state";
        emptyState.textContent = status === "completed"
          ? "No completed tasks yet."
          : status === "inprogress"
            ? "No tasks in progress."
            : "No pending tasks. Add one to get started.";
        list.appendChild(emptyState);
      }
    } else if (emptyState) {
      emptyState.remove();
    }
  }
}

function moveTask(li, newStatus) {
  const targetList = lists[newStatus];
  if (!targetList) return;

  targetList.appendChild(li);
  li.dataset.status = newStatus;

  const statusPill = li.querySelector(".status-pill");
  if (statusPill) {
    statusPill.textContent = newStatus === "inprogress" ? "In progress" : newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    statusPill.className = `status-pill ${newStatus}`;
  }

  const outcomeSelect = li.querySelector(".task-outcome");
  if (newStatus === "completed") {
    outcomeSelect.style.display = "inline";
    outcomeSelect.value = li.dataset.outcome || "not-set";
    li.dataset.outcome = outcomeSelect.value;
  } else {
    outcomeSelect.style.display = "none";
    outcomeSelect.value = "not-set";
    li.dataset.outcome = "";
  }

  updateEmptyStates();
  updateTaskCounts();
  saveTasks();
}

function saveTasks() {
  const tasks = [];

  for (const status of validStatuses) {
    for (const li of lists[status].children) {
      if (li.classList.contains("empty-state")) continue;
      tasks.push({
        text: li.querySelector("span").textContent,
        status,
        outcome: li.dataset.outcome || ""
      });
    }
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(tasks));
  } catch (error) {
    console.error("Unable to save tasks to browser storage.", error);
    alert("Your tasks could not be saved in this browser.");
  }
}

function loadTasks() {
  let storedTasks;

  try {
    storedTasks = window.localStorage.getItem(storageKey);
  } catch (error) {
    console.error("Unable to read tasks from browser storage.", error);
    alert("Your saved tasks could not be loaded from this browser.");
    return;
  }

  if (storedTasks === null) {
    updateEmptyStates();
    updateTaskCounts();
    return;
  }

  try {
    const tasks = JSON.parse(storedTasks);
    if (!Array.isArray(tasks) || !tasks.every(task =>
      task &&
      typeof task.text === "string" &&
      validStatuses.includes(task.status) &&
      validOutcomes.includes(task.outcome)
    )) {
      throw new Error("Saved task data has an invalid format.");
    }

    for (const task of tasks) {
      lists[task.status].appendChild(createTaskItem(task.text, task.status, task.outcome));
    }
  } catch (error) {
    console.error("Unable to restore saved tasks.", error);
    alert("Your saved tasks could not be loaded because the saved data is invalid.");
  }

  updateEmptyStates();
  updateTaskCounts();
}

function createTaskItem(taskText, status = "pending", outcome = "") {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.status = status;
  li.dataset.outcome = status === "completed" ? (outcome || "not-set") : "";

  const taskContent = document.createElement("div");
  taskContent.className = "task-content";

  const statusPill = document.createElement("span");
  statusPill.className = `status-pill ${status}`;
  statusPill.textContent = status === "inprogress" ? "In progress" : status.charAt(0).toUpperCase() + status.slice(1);

  const textSpan = document.createElement("span");
  textSpan.textContent = taskText;

  taskContent.appendChild(statusPill);
  taskContent.appendChild(textSpan);

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = taskText;
  editInput.style.display = "none";

  const menuToggle = document.createElement("button");
  menuToggle.type = "button";
  menuToggle.className = "menu-toggle";
  menuToggle.setAttribute("aria-label", "Open task options");
  menuToggle.textContent = "⋮";

  const taskMenu = document.createElement("div");
  taskMenu.className = "task-menu";
  taskMenu.hidden = true;

  const moveLabel = document.createElement("label");
  moveLabel.className = "task-menu-label";
  moveLabel.textContent = "Move to";

  const moveSelect = document.createElement("select");
  moveSelect.className = "task-menu-status";
  moveSelect.innerHTML = `
    <option value="" disabled>Choose a status</option>
    <option value="pending">Pending</option>
    <option value="inprogress">In Progress</option>
    <option value="completed">Completed</option>
  `;
  moveSelect.value = "";
  moveSelect.setAttribute("aria-label", "Move task to status");
  moveSelect.addEventListener("change", function () {
    moveTask(li, this.value);
    taskMenu.hidden = true;
    moveSelect.value = "";
  });

  const outcomeSelect = document.createElement("select");
  outcomeSelect.className = "task-outcome";
  outcomeSelect.innerHTML = `
    <option value="not-set">Outcome</option>
    <option value="successful">Successful</option>
    <option value="failed">Failed</option>
  `;
  outcomeSelect.value = li.dataset.outcome || "not-set";
  outcomeSelect.style.display = status === "completed" ? "inline" : "none";
  outcomeSelect.addEventListener("change", function () {
    li.dataset.outcome = this.value;
    saveTasks();
  });

  const menuEditBtn = document.createElement("button");
  menuEditBtn.type = "button";
  menuEditBtn.className = "menu-action";
  menuEditBtn.textContent = "Edit";

  const menuDeleteBtn = document.createElement("button");
  menuDeleteBtn.type = "button";
  menuDeleteBtn.className = "menu-action danger";
  menuDeleteBtn.textContent = "Delete";

  function saveTaskText() {
    const trimmedText = editInput.value.trim();

    if (trimmedText === "") {
      alert("Task cannot be empty.");
      editInput.focus();
      return;
    }

    textSpan.textContent = trimmedText;
    textSpan.style.display = "inline";
    editInput.style.display = "none";
    taskMenu.hidden = true;
    saveTasks();
  }

  menuEditBtn.addEventListener("click", function () {
    if (editInput.style.display !== "none") {
      saveTaskText();
      return;
    }

    editInput.value = textSpan.textContent;
    textSpan.style.display = "none";
    editInput.style.display = "inline-block";
    taskMenu.hidden = true;
    editInput.focus();
  });

  editInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      saveTaskText();
    }

    if (event.key === "Escape") {
      editInput.value = textSpan.textContent;
      textSpan.style.display = "inline";
      editInput.style.display = "none";
    }
  });

  menuDeleteBtn.addEventListener("click", function () {
    li.remove();
    updateEmptyStates();
    updateTaskCounts();
    saveTasks();
  });

  menuToggle.addEventListener("click", function (event) {
    event.stopPropagation();
    taskMenu.hidden = !taskMenu.hidden;
  });

  document.addEventListener("click", function (event) {
    if (!li.contains(event.target)) {
      taskMenu.hidden = true;
    }
  });

  moveLabel.appendChild(moveSelect);
  taskMenu.appendChild(moveLabel);
  taskMenu.appendChild(outcomeSelect);
  taskMenu.appendChild(menuEditBtn);
  taskMenu.appendChild(menuDeleteBtn);

  li.appendChild(taskContent);
  li.appendChild(editInput);
  li.appendChild(menuToggle);
  li.appendChild(taskMenu);

  return li;
}

function updateAddButtonState() {
  Btn.disabled = inputBox.value.trim() === "";
}

function addtask(event) {
  if (event) {
    event.preventDefault();
  }

  const text = inputBox.value.trim();

  if (text === "") {
    alert("You must write something.");
    return;
  }

  const status = statusSelect.value;
  const li = createTaskItem(text, status);
  lists[status].appendChild(li);
  inputBox.value = "";
  updateAddButtonState();
  updateEmptyStates();
  updateTaskCounts();
  saveTasks();
}

inputBox.addEventListener("input", updateAddButtonState);
inputBox.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    addtask(event);
  }
});

Btn.addEventListener("click", addtask);

updateAddButtonState();
loadTasks();
