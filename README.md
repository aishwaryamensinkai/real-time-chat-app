# Real-Time Chat Application

A full-stack real-time chat application built with React, Node.js, and Socket.IO. Features user authentication, chat rooms, and real-time messaging capabilities.

## Features

- User authentication (signup, login, forgot password)
- Real-time messaging with Socket.IO
- Create and join chat rooms
- File attachments support
- Role-based access control (Admin and Member)
- Responsive design
- MongoDB database integration
- JWT authentication
- Secure password hashing with bcrypt

## Tech Stack

### Frontend

- React
- Redux Toolkit
- TypeScript
- Tailwind CSS
- Socket.IO Client
- Axios

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT
- bcrypt

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/aishwaryamensinkai/real-time-chat-app.git
   cd real-time-chat-app
   ```

2. Install frontend dependencies:

   ```bash
   cd client
   npm install
   ```

3. Install backend dependencies:

   ```bash
   cd ../server
   npm install
   ```

4. Set up environment variables:

Frontend (.env in client directory):

    REACT_APP_API_URL=http://localhost:5001

Backend (.env in server directory):

    MONGO_URI=<your-mongodb-uri>
    JWT_SECRET=<your-jwt-secret>
    PORT=5001

### Running the Application

1. Start the backend server:

```shellscript
cd server
npm run dev
```

2. Start the frontend development server:

```shellscript
cd client
npm start
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5001`.

## Socket.IO Events

- `joinRoom`: Join a specific chat room
- `sendMessage`: Send a message to a chat room
- `userJoined`: Notification when a user joins
- `userLeft`: Notification when a user leaves

## Deployment

- Frontend: Currently deployed at [https://real-time-chat-app-mocha.vercel.app](https://real-time-chat-app-mocha.vercel.app)
- Backend: Currently deployed at [https://real-time-chat-app-6vra.onrender.com](https://real-time-chat-app-6vra.onrender.com)
