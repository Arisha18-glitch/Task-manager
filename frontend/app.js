let tasks = [];
let reminderTimeouts = [];
let chatbotEnabled = false;
let editingTaskId = null;

// DOM Elements
const taskForm = document.getElementById('task-form');
const pendingTasksList = document.getElementById('pending-tasks');
const completedTasksList = document.getElementById('completed-tasks');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotContainer = document.getElementById('chatbot-container');
const closeChatbot = document.getElementById('close-chatbot');
const chatMessages = document.getElementById('chatbot-messages');
const chatInput = document.getElementById('chatbot-input');
const sendMessageBtn = document.getElementById('send-message');
const reminderSound = document.getElementById('reminderSound');
const submitBtn = document.getElementById('submit-btn');

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Form Submission
taskForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value;
    const dueDate = document.getElementById('task-due').value;

    const newTask = {
        id: editingTaskId ? editingTaskId : Date.now(),
        title,
        description,
        priority,
        category,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };

    if (editingTaskId) {
        await fetch(`${API_BASE_URL}/api/task/${editingTaskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });
        editingTaskId = null;
        submitBtn.textContent = "Add Task";
    } else {
        await fetch(`${API_BASE_URL}/api/task`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });
    }

    await loadTasks();
    taskForm.reset();
    submitBtn.textContent = "Add Task";
});

// Render Tasks
function renderTasks() {
    pendingTasksList.innerHTML = '';
    completedTasksList.innerHTML = '';

    // Sort tasks by due date
    tasks.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card ${task.completed ? 'completed-task' : ''}`;

        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            ${task.description ? `<p>${task.description}</p>` : ''}
            <div class="task-meta">
                <span class="priority-${task.priority}">${task.priority}</span>
                <span>${task.category}</span>
                ${task.dueDate ? `<span> ${formatDate(task.dueDate)}</span>` : ''}
            </div>
            <div class="task-actions">
                ${!task.completed ? `<button onclick="completeTask(${task.id})"> Complete</button>` : ''}
                <button onclick="editTask(${task.id})"> Edit</button>
                <button onclick="deleteTask(${task.id})"> Delete</button>
            </div>
        `;

        if (task.completed) {
            completedTasksList.appendChild(taskElement);
        } else {
            pendingTasksList.appendChild(taskElement);
        }
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

// Task Actions
window.completeTask = async function (id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = true;
        await fetch(`${API_BASE_URL}/api/task/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(task)
        });
        await loadTasks();
        addBotMessage(`Great job completing "${task.title}"! Keep up the good work!`);
    }
}

window.deleteTask = async function (id) {
    await fetch(`${API_BASE_URL}/api/task/${id}`, {
        method: 'DELETE'
    });
    await loadTasks();
}

window.editTask = function (id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-category').value = task.category;
        document.getElementById('task-due').value = task.dueDate;
        editingTaskId = id;
        submitBtn.textContent = "Update Task";
    }
}

// Chatbot Functionality (unchanged)
// ... (copy your chatbot code here) ...

// Reminder function
function setReminder(task) {
    if (!task.dueDate || task.completed) return;

    const due = new Date(task.dueDate).getTime();
    const now = Date.now();
    const msUntilDue = due - now;

    if (msUntilDue > 0) {
        setTimeout(() => {
            // Play sound
            if (reminderSound) reminderSound.play();
            // Show alert
            alert(`Reminder: Task "${task.title}" is due!`);
        }, msUntilDue);
    }
}

// Add bot message to chat window
function addBotMessage(msg) {
    const messages = document.getElementById('chatbot-messages');
    messages.innerHTML += `<div class="message bot-message">${msg}</div>`;
    messages.scrollTop = messages.scrollHeight;
}

// Load tasks on startup
async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`);
        if (response.ok) {
            const serverTasks = await response.json();
            if (Array.isArray(serverTasks)) {
                tasks = serverTasks;
                tasks.forEach(task => {
                    if (task.dueDate && !task.completed) {
                        setReminder(task);
                    }
                });
            }
        }
    } catch (error) {
        console.log('Using local tasks:', error);
        tasks = [
            {
                id: 1,
                title: "Welcome to Task Manager",
                description: "Try adding your first task!",
                priority: "normal",
                category: "work",
                dueDate: "",
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
    }
    renderTasks();
}

loadTasks();

// Chatbot Toggle
chatbotToggle.addEventListener('click', () => {
    chatbotContainer.style.display = 'flex';
});

closeChatbot.addEventListener('click', () => {
    chatbotContainer.style.display = 'none';
});

document.getElementById('send-message').addEventListener('click', async function () {
    const input = document.getElementById('chatbot-input');
    const message = input.value.trim();
    if (!message) return;

    // Show user message with correct class
    const messages = document.getElementById('chatbot-messages');
    messages.innerHTML += `<div class="message user-message">${message}</div>`;

    // Send to backend
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });
    const data = await res.json();

    // Show bot reply with correct class
    messages.innerHTML += `<div class="message bot-message">${data.reply}</div>`;
    input.value = '';

    // Scroll to bottom
    messages.scrollTop = messages.scrollHeight;
});