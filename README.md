# CTMS Backend API 🔧

**Candidate Tracking Management System - Backend Service**

[![Development Status](https://img.shields.io/badge/Status-Under%20Development-yellow.svg)](https://github.com/your-username/CTMS-Backend)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green.svg)](https://mongodb.com/)
[![Render](https://img.shields.io/badge/Deployment-Render-purple.svg)](https://render.com/)

> ⚠️ **Note**: This project is currently under active development.

## 📋 About

The CTMS Backend is a robust Node.js/Express.js RESTful API service that powers the Candidate Tracking Management System. It handles all business logic, data management, authentication, and integration services for the recruitment process management platform.

## 🎯 Core Features

### Authentication & Authorization
- ✅ JWT-based authentication system
- ✅ Role-based access control (Admin/HR)
- ✅ Secure password hashing and validation
- ✅ Session management and token refresh

### Candidate Management
- ✅ CRUD operations for candidate records
- ✅ Duplicate detection and prevention system
- ✅ Candidate history tracking and audit trail
- ✅ Advanced search and filtering capabilities

### Interview Management
- ✅ Interview scheduling and calendar integration
- ✅ Automated email notifications and reminders
- ✅ Feedback recording and outcome tracking
- ✅ Meeting link generation and management

### Reporting & Analytics
- ✅ Comprehensive reporting system for Admins
- ✅ Real-time data aggregation and statistics
- ✅ Candidate status tracking and progression
- ✅ Export capabilities for various formats

## 🛠️ Tech Stack

- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB 6.x with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: NodeMailer with SMTP
- **File Upload**: Multer
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Joi / Express Validator
- **Deployment**: Render

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RansaraNS/CTMS-Backend.git
   cd CTMS-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Start the development server**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

   The API will be available at `http://localhost:5000`

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Runs the server in production mode |
| `npm run dev` | Runs the server with nodemon for development |
| `npm test` | Runs the test suite |
| `npm run seed` | Seeds the database with initial data |


## 🌐 Deployment

This application is deployed on **Render** for reliable cloud hosting and automatic deployments.

### Production Environment Variables
Ensure all environment variables are properly configured in your Render dashboard.

### Deployment Steps
1. Connect your GitHub repository to Render
2. Configure environment variables
3. Set build command: `npm install`
4. Set start command: `npm start`

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Prevents API abuse and brute force attacks
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Input Validation**: Request validation and sanitization
- **Security Headers**: Helmet.js for security headers

## 📧 Email Integration

The system includes automated email functionality for:
- Interview invitations with meeting links
- Candidate status updates
- HR account creation notifications
- System alerts and reminders

## 🤝 Contributing

As this project is under development, contributions are welcomed! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Development Status

- [ ] Authentication & Authorisation System
- [ ] User Management (Admin/HR)
- [ ] Candidate CRUD Operations
- [ ] Duplicate Detection Algorithm
- [ ] Interview Scheduling System
- [ ] Email Integration & Notifications
- [ ] Reporting & Analytics Engine
- [ ] File Upload & Management
- [ ] API Documentation (Swagger)
- [ ] Unit & Integration Tests

---

⭐ **Star this repository if you find it helpful!**
