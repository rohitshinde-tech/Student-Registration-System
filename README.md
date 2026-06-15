# Student Registration System
A comprehensive MERN stack web application designed to streamline the student admission and registration process for educational institutions. It provides a secure, efficient, and paperless way to manage student enrollments, document verification, and administrative tasks.
## 🚀 Features
- **Role-Based Access Control**: Dedicated, secure portals for Students, Administrators, and Department Admins.
- **Student Dashboard**: Intuitive interface for students to register, complete their profiles, securely upload required documents, and track their admission status in real-time.
- **Multi-Level Verification System**: Granular verification process where administrators can approve or reject individual pieces of information and documents (e.g., identity proof, marksheets, caste certificates).
- **Secure Document Management**: Integration with Cloudinary for robust and secure storage of sensitive student documents and photographs.
- **Automated PRN Generation**: The system automatically generates Permanent Registration Numbers (PRNs) for fully approved students based on their batch year, admission type, and institute codes.
- **Analytics & Reporting**: Interactive, visual dashboards (powered by Recharts) providing administrators with insights into admission statistics, demographic distributions, and verification progress.
- **Email Notifications**: Automated email workflows using Nodemailer for registration confirmation, OTP-based password resets, and important status updates.
- **ID Card & Report Generation**: Automated generation of student ID cards and admission summaries in PDF format (using PDFKit and jsPDF).
## 🛠️ Technology Stack
### Frontend
- **Framework**: React.js (Bootstrapped with Vite for optimal performance)
- **Styling**: Tailwind CSS for responsive, modern UI design
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **PDF Generation**: jsPDF & jsPDF-AutoTable
### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs for password hashing
- **File Uploads**: Multer & Multer-Storage-Cloudinary
- **Email Services**: Nodemailer
- **PDF Generation**: PDFKit
## ⚙️ Installation & Setup
### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- A [Cloudinary](https://cloudinary.com/) account for image/document storage
### 1. Clone the repository
```bash
git clone https://github.com/rohitshinde-tech/Student-Registration-System.git
cd student-registration-system
```
### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and configure the following environment variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-registration  # Or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```
Start the backend development server:
```bash
npm run dev
```
### 3. Frontend Setup
Open a new terminal window/tab:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```
The application should now be running. The frontend will typically be accessible at `http://localhost:5173` and the backend API at `http://localhost:5000`.
### 4. Default Admin Credentials
To access the Admin Panel for the first time, select the **Admin** tab on the login page and use the following default credentials:
- **Email:** `admin@system.com`
- **Password:** `admin123`
*(The backend will automatically register this user as the Super Admin upon the first login attempt.)*
## 📁 Project Structure
```text
student-registration-system/
├── backend/                  # Express.js API
│   ├── controllers/          # Business logic for routes
│   ├── middleware/           # Custom middleware (auth, etc.)
│   ├── models/               # Mongoose database schemas
│   ├── routes/               # API route definitions
│   ├── utils/                # Utility functions (Cloudinary config, etc.)
│   ├── index.js              # Entry point for the backend server
│   └── package.json          
└── frontend/                 # React.js User Interface
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── context/          # React Context (AuthContext)
    │   ├── pages/            # Page components (Dashboards, Login, etc.)
    │   ├── App.jsx           # Main application routing
    │   ├── main.jsx          # React entry point
    │   └── index.css         # Global styles (Tailwind)
    ├── vite.config.js        
    ├── tailwind.config.js    
    └── package.json          
```
## 🔐 Security
- Passwords are cryptographically hashed before being stored in the database.
- Protected routes are secured using JWT-based authentication.
- Role-based middleware ensures users can only access their permitted endpoints.
