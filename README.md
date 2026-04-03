# Digital Queue Management System

A full-stack queue management system (QMS) designed for tokens generation, real-time queue display, and seamless counter operations.

## Features
- **Token Generation**: Easily generate and print tokens for customers.
- **Queue Display**: A real-time, responsive kiosk-style display board for waiting users.
- **Operator Panel**: Manage current and upcoming tokens directly from a counter interface.
- **Admin Dashboard**: Comprehensive view of all ongoing queues and generated tokens.

## Tech Stack
- **Frontend**: React.js
- **Backend**: Django & Django REST Framework (DRF)
- **Database**: SQLite (default)

## Project Structure
- `/frontend`: The React front-end application.
- `/dqms`: The main Django project configuration.
- `/digitalqueue`: The Django application containing models, views, and API routes.
- `manage.py`: The Django command-line utility.

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (3.8+)

### Backend Setup (Django)
1. Open a terminal in the root folder containing `manage.py`.
2. *(Optional)* Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install the required Python dependencies (Assuming you have a `requirements.txt` or manually install `django`, `djangorestframework`, etc).
4. Run the database migrations:
   ```bash
   python manage.py migrate
   ```
5. Start the backend development server:
   ```bash
   python manage.py runserver
   ```
   The backend should now run on `http://127.0.0.1:8000/`.

### Frontend Setup (React)
1. Open a new terminal instance and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the necessary NPM dependencies:
   ```bash
   npm install
   ```
3. Start the front-end development server:
   ```bash
   npm start  # or npm run dev
   ```
   The frontend should now run locally, typically on `http://localhost:3000/` or `http://localhost:5173/`.
