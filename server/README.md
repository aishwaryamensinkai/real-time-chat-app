# Real-Time Chat Application Backend

This repository contains the backend implementation for a real-time chat application. The backend provides user authentication, chat room management, and real-time messaging functionality.

## Features

- User authentication with role-based access control (Admin, Member)
- Chat room creation, deletion, and management
- Real-time messaging using Socket.IO
- MongoDB for database operations

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.IO
- JWT for authentication
- bcrypt for secure password hashing

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone https://github.com/aishwaryamensinkai/real-time-chat-app
   ```

2. Navigate to the backend folder:

   ```bash
   cd server
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the `server` directory and include the following:

   ```env
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   PORT=5001
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

6. The server will be running at `http://localhost:5001` (or the specified port).

## Deployment

The backend is deployed at: [https://real-time-chat-app-6vra.onrender.com](https://real-time-chat-app-6vra.onrender.com)

## API Endpoints

### Authentication Routes

#### 1. **Sign Up**

- **Endpoint**: `POST /api/auth/signup`
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "username": "testuser",
    "email": "testuser@example.com",
    "password": "Password1!",
    "role": "Member"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "username": "testuser",
      "email": "testuser@example.com",
      "role": "Member"
    }
  }
  ```

#### 2. **Login**

- **Endpoint**: `POST /api/auth/login`
- **Description**: Log in an existing user.
- **Request Body**:
  ```json
  {
    "email": "testuser@example.com",
    "password": "Password1!"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token",
    "user": {
      "id": "user_id",
      "username": "testuser",
      "email": "testuser@example.com",
      "role": "Member"
    }
  }
  ```

### Chat Room Routes

#### 3. **Create Chat Room (Admin Only)**

- **Endpoint**: `POST /api/chatroom/create`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
    "name": "General",
    "is_private": false
  }
  ```
- **Response**:
  ```json
  {
    "msg": "Chat room created",
    "chatRoom": {
      "_id": "room_id",
      "name": "General",
      "is_private": false,
      "created_by": "user_id",
      "participants": []
    }
  }
  ```

#### 4. **Get All Chat Rooms**

- **Endpoint**: `GET /api/chatroom/`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Response**:
  ```json
  [
    {
      "_id": "room_id",
      "name": "General",
      "is_private": false,
      "created_by": {
        "username": "adminuser",
        "email": "admin@example.com"
      },
      "participants": []
    }
  ]
  ```

#### 5. **Join Chat Room**

- **Endpoint**: `POST /api/chatroom/join/:id`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Response**:
  ```json
  {
    "msg": "Joined chat room",
    "chatRoom": {
      "_id": "room_id",
      "name": "General",
      "participants": ["user_id"]
    }
  }
  ```

#### 6. **Leave Chat Room**

- **Endpoint**: `POST /api/chatroom/leave/:id`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Response**:
  ```json
  {
    "msg": "Left chat room",
    "chatRoom": {
      "_id": "room_id",
      "name": "General",
      "participants": []
    }
  }
  ```

#### 7. **Send Message**

- **Endpoint**: `POST /api/chatroom/message`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Request Body**:
  ```json
  {
    "roomId": "room_id",
    "text": "Hello, world!"
  }
  ```
- **Response**:
  ```json
  {
    "msg": "Message sent",
    "message": {
      "text": "Hello, world!",
      "sender": {
        "username": "testuser"
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 8. **Get Chat History**

- **Endpoint**: `GET /api/chatroom/history/:roomId`
- **Headers**:
  ```
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Response**:
  ```json
  [
    {
      "text": "Hello, world!",
      "sender": {
        "username": "testuser"
      },
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ]
  ```

## Real-Time Communication (Socket.IO)

- **Events**:
  - `joinRoom`: Join a specific chat room.
  - `sendMessage`: Send a message to a chat room.
  - `userJoined`: Notify other participants when a user joins.
  - `userLeft`: Notify other participants when a user leaves.

## Testing

You can test these APIs using tools like Postman or cURL.

## License

This project is licensed under the ISC License.
