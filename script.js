var taskForm = document.getElementById("taskForm");
var taskInput = document.getElementById("taskInput");
var priorityInput = document.getElementById("priorityInput");
var dueDateInput = document.getElementById("dueDateInput");
var taskList = document.getElementById("taskList");
var filterButtons = document.querySelectorAll(".filters button");
var sortButtons = document.querySelectorAll(".sorts button");
var searchInput = document.getElementById("searchInput");

var tasks = [];
var currentFilter = "all";
var currentSort = null;
var editingId = null;

function loadTasks() {
    var saved = localStorage.getItem("tasks");
    if (saved) { tasks = JSON.parse(saved); renderTasks(currentFilter); }
}

function saveTasks() { localStorage.setItem("tasks", JSON.stringify(tasks)); }

function addTask(text, priority, dueDate) {
    var task = { id: Date.now(), text: text, priority: priority, dueDate: dueDate, completed: false };
    tasks.push(task);
    saveTasks();
    renderTasks(currentFilter);
}

function updateTask(id, newText, newPriority, newDueDate) {
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
            tasks[i].text = newText;
            tasks[i].priority = newPriority;
            tasks[i].dueDate = newDueDate;
            break;
        }
    }
    saveTasks();
    editingId = null;
    taskForm.querySelector("button").textContent = "Add Task";
    renderTasks(currentFilter);
}

function toggleTask(id) {
    for (var i = 0; i < tasks.length; i++) if (tasks[i].id === id) tasks[i].completed = !tasks[i].completed;
    saveTasks(); renderTasks(currentFilter);
}

function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    saveTasks(); renderTasks(currentFilter);
}

function clearCompleted() {
    tasks = tasks.filter(function (t) { return !t.completed; });
    saveTasks(); renderTasks(currentFilter);
}

function sortTasks(list) {
    if (currentSort === "date") list.sort(function (a, b) { return new Date(a.dueDate || 0) - new Date(b.dueDate || 0); });
    if (currentSort === "priority") {
        var order = { High: 1, Medium: 2, Low: 3 };
        list.sort(function (a, b) { return order[a.priority] - order[b.priority]; });
    }
    return list;
}

function isOverdue(task) {
    if (!task.dueDate) return false;
    var today = new Date();
    var due = new Date(task.dueDate);
    return !task.completed && due < new Date(today.toDateString());
}

function renderTasks(filter) {
    currentFilter = filter;
    taskList.innerHTML = "";
    var keyword = searchInput.value.toLowerCase();


    var filtered = tasks.filter(function (t) {
        var matchesFilter = true;
        if (filter === "completed") matchesFilter = t.completed;
        if (filter === "pending") matchesFilter = !t.completed;
        var matchesSearch = t.text.toLowerCase().indexOf(keyword) !== -1;
        return matchesFilter && matchesSearch;
    });

    filtered = sortTasks(filtered);

    for (var i = 0; i < filtered.length; i++) {
        var task = filtered[i];
        var li = document.createElement("li");
        if (task.completed) li.classList.add("completed");
        if (isOverdue(task)) li.classList.add("overdue");

        var info = document.createElement("div");
        var textSpan = document.createElement("span"); textSpan.textContent = task.text;
        var priorityBadge = document.createElement("span"); priorityBadge.className = "badge " + task.priority.toLowerCase(); priorityBadge.textContent = task.priority;
        var dateSpan = document.createElement("span"); dateSpan.textContent = task.dueDate ? "(Due: " + task.dueDate + ")" : "";
        info.appendChild(textSpan); info.appendChild(priorityBadge); info.appendChild(dateSpan);

        var actions = document.createElement("div");
        var toggleBtn = document.createElement("button"); toggleBtn.textContent = task.completed ? "Undo" : "Done";
        toggleBtn.addEventListener("click", function (id) { return function () { toggleTask(id); }; }(task.id));

        var editBtn = document.createElement("button"); editBtn.textContent = "Edit";
        editBtn.addEventListener("click", function (task) {
            return function () {
                taskInput.value = task.text;
                priorityInput.value = task.priority;
                dueDateInput.value = task.dueDate;
                editingId = task.id;
                taskForm.querySelector("button").textContent = "Update Task";
            };
        }(task));

        var deleteBtn = document.createElement("button"); deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", function (id) { return function () { deleteTask(id); }; }(task.id));

        actions.appendChild(toggleBtn); actions.appendChild(editBtn); actions.appendChild(deleteBtn);
        li.appendChild(info); li.appendChild(actions); taskList.appendChild(li);
    }


}

taskForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = taskInput.value.trim();
    var priority = priorityInput.value;
    var dueDate = dueDateInput.value;
    if (text.length === 0) return;


    if (editingId === null) addTask(text, priority, dueDate);
    else updateTask(editingId, text, priority, dueDate);

    taskInput.value = ""; dueDateInput.value = "";


});

for (var i = 0; i < filterButtons.length; i++) filterButtons[i].addEventListener("click", function () { renderTasks(this.getAttribute("data-filter")); });
for (var j = 0; j < sortButtons.length; j++) sortButtons[j].addEventListener("click", function () { currentSort = this.getAttribute("data-sort"); renderTasks(currentFilter); });

searchInput.addEventListener("input", function () { renderTasks(currentFilter); });

loadTasks();