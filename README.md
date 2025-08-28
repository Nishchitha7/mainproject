# Interview Prep Pro

A comprehensive job interview preparation platform with user authentication and profile management.

## Features

### 🔐 User Authentication
- **Sign Up**: Create account with job preparation details
- **Log In**: Authenticate with email/password and update job preferences
- **Profile Management**: View and manage user profile information
- **Logout**: Secure session termination

### 💼 Job Preparation Fields
- **User Type**: Student, Professional, or Job Seeker
- **Location**: City and Country
- **Career Goal**: Target job position (e.g., Software Engineer)
- **Preferred Technologies**: Multiple technology selections
- **Personal Information**: Username, full name, email, phone (optional)

### 🏠 Homepage Features
- **Profile Button**: Access user profile in navigation bar
- **Profile Modal**: Display all authentication details (except phone and password)
- **Responsive Design**: Works on desktop and mobile devices
- **AI Chatbot**: Interview preparation assistance

### 🗄️ Database Storage
- **MongoDB Integration**: All user data stored securely
- **Session Management**: Secure user sessions
- **Data Privacy**: Phone numbers and passwords are hidden in profile view

## Setup Instructions

### Prerequisites
- Node.js installed
- MongoDB running on localhost:27017
- XAMPP or similar local server

### Installation

1. **Start MongoDB**
   ```bash
   # Ensure MongoDB is running on localhost:27017
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start Backend Server**
   ```bash
   cd backend
   node server.js
   ```
   Server will run on http://localhost:3000

4. **Start Frontend**
   - Place files in XAMPP htdocs directory
   - Access via http://localhost/geminitest/

## File Structure

```
geminitest/
├── index.html          # Homepage with profile functionality
├── login.html          # Enhanced login form with job prep fields
├── signup.html         # Enhanced signup form with job prep fields
├── login.js           # Login form handling
├── signup.js          # Signup form handling
├── script.js          # Homepage functionality and profile modal
├── style.css          # Complete styling for all pages
├── backend/
│   └── server.js      # Node.js backend with MongoDB integration
└── README.md          # This file
```

## API Endpoints

- `POST /api/signup` - User registration
- `POST /api/login` - User authentication
- `GET /api/profile` - Get user profile (excludes password/phone)
- `POST /api/logout` - User logout

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CORS protection
- Input validation
- Secure data storage

## User Experience

1. **New Users**: Sign up with comprehensive job preparation details
2. **Returning Users**: Log in and optionally update job preferences
3. **Profile Access**: Click profile button in navigation to view details
4. **Logout**: Use logout button in profile modal to end session

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: bcrypt, express-session
- **Styling**: Custom CSS with gradients and modern design
