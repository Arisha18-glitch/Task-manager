# Task Manager

A simple, local Task Manager web application with chatbot assistance and audio reminders.  
Built with a Flask backend, a small C++ task engine, and a vanilla JavaScript frontend.

---

## Features

- Create, edit, complete, and delete tasks
- Task metadata: title, description, priority, category, due date
- Chatbot assistant for quick interactions
- Audio reminder played when a task is due
- Tasks persisted to `tasks.json`

---

## Tech Stack

- Frontend: HTML, CSS, JavaScript (plain)
- Backend: Python (Flask)
- Task engine: C++ (compiled executable invoked by Flask)
- Data: JSON file (`tasks.json`)

---

## Quickstart (development)

1. Clone repository
```sh
git clone https://github.com/Arisha18-glitch/Task-manager.git
cd Task-manager/DS
```

2. (Optional) Create and activate a virtual environment
```sh
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# cmd
.venv\Scripts\activate.bat
```

3. Install Python dependencies
```sh
pip install flask flask-cors
```

4. Compile the C++ task engine (if you modify `task.cpp`)
```sh
g++ task.cpp -o task_backend.exe
```

5. Run the Flask server
```sh
python chat_bot.py
```

6. Open the app in a browser
```
http://127.0.0.1:5000
```

---

## Backend API (summary)

- GET  /api/tasks           — return all tasks (JSON)
- POST /api/task            — add a new task
- PUT  /api/task/<id>       — update task with id
- DELETE /api/task/<id>     — delete task with id
- POST /api/chat            — send message to chatbot

(Adjust endpoints in `chat_bot.py` if implementation differs.)

---

## Files of interest

- `frontend/` — static site (index.html, app.js, style.css, reminder.mp3)
- `chat_bot.py` — Flask backend and API
- `task.cpp` — C++ task engine source
- `task_backend.exe` — compiled C++ executable (optional; compile locally)
- `tasks.json` — persisted tasks file

---

## Notes

- Browsers may block audio autoplay; a user interaction may be required before reminders play.
- For production deployment, replace the Flask dev server with a WSGI server (gunicorn/uwsgi) and secure the executable invocation.

---

## Contributing

1. Fork the repo
2. Create a feature branch
3. Commit changes with clear messages
4. Open a Pull Request

---

## License

MIT License — see LICENSE file or add one to the repo.

---

Maintainer: Arisha18-glitch
