const inputBox = document.getElementById("input-box");
const Btn = document.getElementById("Btn");
const statusSelect = document.getElementById("task-status");

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
  } else {
    outcomeSelect.style.display = "none";
    outcomeSelect.value = "not-set";
    li.dataset.outcome = "";
  }
}

function createTaskItem(taskText, status = "pending") {
  const li = document.createElement("li");
  li.dataset.status = status;

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
  outcomeSelect.value = "not-set";
  outcomeSelect.style.display = status === "completed" ? "inline" : "none";
  outcomeSelect.addEventListener("change", function () {
    li.dataset.outcome = this.value;
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
}

Btn.addEventListener("click", addtask);