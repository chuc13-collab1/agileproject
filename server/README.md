# Agile Project Management - Backend Server

Express.js backend API for Agile Project Management system with MySQL database.

## 🚀 Features

- RESTful API for user management (Students, Teachers, Admins)
- MySQL database integration
- Firebase Authentication
- CRUD operations for all user types
- Batch import students from Excel
- Transaction support for data integrity

## 📋 Prerequisites

- Node.js >= 16.x
- MySQL >= 8.0
- Firebase project with Admin SDK credentials

## 🛠️ Installation

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Setup MySQL Database

Create database and run migration:

```bash
# Login to MySQL
mysql -u root -p

# Run migration script
mysql -u root -p < migrations/001_create_tables.sql
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
PORT=3001
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=agile_project_management

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

### 4. Get Firebase Admin SDK Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the values to your `.env` file

## 🏃 Running the Server

### Development mode (with nodemon)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

Server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check

```
GET /health
```

### Students

```
GET    /api/students                    # Get all students
POST   /api/students                    # Create student
PUT    /api/students/:id                # Update student
DELETE /api/students/:id                # Delete student
PATCH  /api/students/:id/toggle-active  # Toggle active status
POST   /api/students/batch-import       # Batch import from Excel
```

### Teachers

```
GET    /api/teachers                    # Get all teachers
POST   /api/teachers                    # Create teacher
PUT    /api/teachers/:id                # Update teacher
DELETE /api/teachers/:id                # Delete teacher
PATCH  /api/teachers/:id/toggle-active  # Toggle active status
```

### Admins

```
GET    /api/admins                      # Get all admins
POST   /api/admins                      # Create admin
DELETE /api/admins/:id                  # Delete admin
PATCH  /api/admins/:id/toggle-active    # Toggle active status
```

## 🔐 Authentication

All API endpoints (except `/health`) require Firebase Authentication token in the header:

```
Authorization: Bearer <firebase-id-token>
```

## 📊 Database Schema

### Tables

- `users` - Base table for all users
- `students` - Student-specific information (NO GPA field)
- `teachers` - Teacher-specific information
- `teacher_specializations` - Teacher specializations (many-to-many)
- `admins` - Admin-specific information
- `admin_permissions` - Admin permissions (many-to-many)

See `migrations/001_create_tables.sql` for complete schema.

## 🧪 Testing

Test the API using:

- Postman
- curl
- Frontend application

Example curl request:

```bash
curl -X GET http://localhost:3001/api/students \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

## 📝 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js      # MySQL connection
│   │   └── firebase.js      # Firebase Admin SDK
│   ├── middleware/
│   │   ├── auth.js          # Token verification
│   │   └── errorHandler.js  # Error handling
│   ├── routes/
│   │   ├── students.js      # Student routes
│   │   ├── teachers.js      # Teacher routes
│   │   └── admins.js        # Admin routes
│   └── index.js             # Entry point
├── migrations/
│   └── 001_create_tables.sql
├── package.json
├── .env.example
└── .gitignore
```

## ⚠️ Important Notes

- **No GPA field**: The GPA field has been removed from the student table
- **Firebase Auth**: User authentication is handled by Firebase
- **MySQL**: User data is stored in MySQL database
- **Transactions**: All multi-table operations use transactions for data integrity

## 🐛 Troubleshooting

### MySQL Connection Error

```
Error: ER_ACCESS_DENIED_ERROR
```

**Solution**: Check your MySQL credentials in `.env`

### Firebase Auth Error

```
Error: Invalid or expired token
```

**Solution**: Ensure Firebase credentials are correct and token is valid

### Port Already in Use

```
Error: EADDRINUSE
```

**Solution**: Change PORT in `.env` or kill the process using port 3001

---

Made with ❤️ for Agile Project Management System
