const inputBox = document.getElementById("input-box");
const Btn = document.getElementById("Btn");
const statusSelect = document.getElementById("task-status");
const storageKey = "todoTasks";
const validStatuses = ["pending", "inprogress", "completed"];
const validOutcomes = ["", "not-set", "successful", "failed"];

const lists = {
  pending: document.getElementById("pending-list"),
  inprogress: document.getElementById("inprogress-list"),
  completed: document.getElementById("completed-list")
};

function moveTask(li, newStatus) {
  const targetList = lists[newStatus];
  if (!targetList) return;

  targetList.appendChild(li);
  li.dataset.status = newStatus;

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

  saveTasks();
}

function saveTasks() {
  const tasks = [];

  for (const status of validStatuses) {
    for (const li of lists[status].children) {
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

  if (storedTasks === null) return;

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
}

function createTaskItem(taskText, status = "pending", outcome = "") {
  const li = document.createElement("li");
  li.dataset.status = status;
  li.dataset.outcome = status === "completed" ? (outcome || "not-set") : "";

  const textSpan = document.createElement("span");
  textSpan.textContent = taskText;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = taskText;
  editInput.style.display = "none";

  const taskStatus = document.createElement("select");
  taskStatus.innerHTML = `
    <option value="pending">Pending</option>
    <option value="inprogress">In Progress</option>
    <option value="completed">Completed</option>
  `;
  taskStatus.value = status;
  taskStatus.addEventListener("change", function () {
    moveTask(li, this.value);
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

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";

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
    editBtn.textContent = "Edit";
    saveTasks();
  }

  editBtn.addEventListener("click", function () {
    if (editInput.style.display !== "none") {
      saveTaskText();
      return;
    }

    editInput.value = textSpan.textContent;
    textSpan.style.display = "none";
    editInput.style.display = "inline-block";
    editBtn.textContent = "Save";
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
      editBtn.textContent = "Edit";
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", function () {
    li.remove();
    saveTasks();
  });

  li.appendChild(textSpan);
  li.appendChild(editInput);
  li.appendChild(taskStatus);
  li.appendChild(outcomeSelect);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

function addtask() {
  const text = inputBox.value.trim();

  if (text === "") {
    alert("You must write something.");
    return;
  }

  const status = statusSelect.value;
  const li = createTaskItem(text, status);
  lists[status].appendChild(li);
  inputBox.value = "";
  saveTasks();
}

loadTasks();
Btn.addEventListener("click", addtask);
