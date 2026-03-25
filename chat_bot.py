import os
import json
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Dictionary of keywords and responses
RESPONSE_DICT = {
    "hello": "Hello! How can I help you with your tasks today?",
    "hi": "Hi there! Need help managing your tasks?",
    "help": "You can say things like: add task, delete task, complete task, or list tasks.",
    "thanks": "You're welcome! Let me know if you need anything else.",
    "thank you": "Glad to help! Anything else?",
    "bye": "Goodbye! Have a productive day.",
    "how are you": "I'm just a bot, but I'm here to help you with your tasks!"
}

def handle_chat(message):
    msg = message.lower().strip()
    # Direct keyword match
    for key in RESPONSE_DICT:
        if key in msg:
            return RESPONSE_DICT[key]

    # Task command patterns
    if msg.startswith("add task"):
        return "To add a task, please use the task form or say: add task <title> <description> <priority> <category> <dueDate>."
    elif msg.startswith("delete task"):
        return "To delete a task, please specify the task ID. Example: delete task 2"
    elif msg.startswith("complete task"):
        return "To complete a task, please specify the task ID. Example: complete task 2"
    elif msg.startswith("list tasks"):
        # List tasks from tasks.json
        if not os.path.exists("tasks.json"):
            return "No tasks found."
        with open("tasks.json", "r") as f:
            tasks = json.load(f)
        if not tasks:
            return "No tasks found."
        reply = "Here are your tasks:\n"
        for t in tasks:
            status = "✅" if t.get("completed") else "❌"
            reply += f"{t['id']}: {t['title']} [{status}]\n"
        return reply

    # Fallback for unknown input
    return "Sorry, I didn't understand that. Type 'help' for what I can do!"

# Serve static files (HTML, CSS, JS)
@app.route("/")
def serve_index():
    return send_from_directory("frontend", "index.html")

@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory("frontend", path)

# Task endpoints
@app.route("/api/task", methods=["POST"])
def add_task():
    data = request.get_json()
    exe_path = os.path.join(os.path.dirname(__file__), "task_backend.exe")
    args = [
        exe_path,
        data.get("title", ""),
        data.get("description", ""),
        data.get("priority", "Normal"),
        data.get("category", "General"),
        data.get("dueDate", "2025-12-31T23:59")
    ]
    try:
        subprocess.run(args, check=True)
        return jsonify({"status": "success", "message": "Task added."})
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/tasks", methods=["GET"])
def get_tasks():
    if not os.path.exists("tasks.json"):
        return jsonify([])
    with open("tasks.json", "r") as f:
        return jsonify(json.load(f))

@app.route("/api/task/<int:task_id>", methods=["PUT"])
def update_task(task_id):
    data = request.get_json()
    if not os.path.exists("tasks.json"):
        return jsonify({"status": "error", "message": "No tasks found."}), 404
    with open("tasks.json", "r") as f:
        tasks = json.load(f)
    updated = False
    for i, t in enumerate(tasks):
        if t["id"] == task_id:
            tasks[i] = data
            updated = True
            break
    if not updated:
        return jsonify({"status": "error", "message": "Task not found."}), 404
    with open("tasks.json", "w") as f:
        json.dump(tasks, f, indent=4)
    return jsonify({"status": "success"})

@app.route("/api/task/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    if not os.path.exists("tasks.json"):
        return jsonify({"status": "error", "message": "No tasks found."}), 404
    with open("tasks.json", "r") as f:
        tasks = json.load(f)
    new_tasks = [t for t in tasks if t["id"] != task_id]
    if len(new_tasks) == len(tasks):
        return jsonify({"status": "error", "message": "Task not found."}), 404
    with open("tasks.json", "w") as f:
        json.dump(new_tasks, f, indent=4)
    return jsonify({"status": "success"})

# Chat endpoint
@app.route("/api/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")
    if not user_message:
        return jsonify({"error": "Message is empty"}), 400
    reply = handle_chat(user_message)
    return jsonify({"reply": reply})

# Health check
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=5000, debug=True)