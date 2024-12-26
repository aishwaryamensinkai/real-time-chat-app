# Real-Time Chat Application

## Overview

This is a real-time chat application built with React, Redux, and Socket.io. It features user authentication, chat rooms, and real-time messaging capabilities.

## Features

- User authentication (signup, login, forgot password, reset password)
- Create and join chat rooms
- Real-time messaging
- File attachments
- User roles (Admin and Member)
- Responsive design

## Project Structure

```
.
├── public/
├── src/
│   ├── components/
│   │   ├── ChatRoom.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Login.tsx
│   │   ├── Notifications.tsx
│   │   ├── ResetPassword.tsx
│   │   └── Signup.tsx
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       └── chatSlice.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── dateFormatter.ts
│   ├── App.tsx
│   ├── index.css
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Setup

1. Clone the repository:

   ```
   git clone https://github.com/aishwaryamensinkai/real-time-chat-app.git
   cd real-time-chat-app
   cd client
   ```

2. Install dependencies:

   ```
   npm install
   ```

   or

   ```
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   REACT_APP_API_URL=<your-api-url>
   ```

## Running the Application

To start the development server:

```
npm start
```

or

```
yarn start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```
npm run build
```

or

```
yarn build
```

## Testing

To run tests:

```
npm test
```

or

```
yarn test
```

## Technologies Used

- React
- Redux Toolkit
- TypeScript
- Tailwind CSS
- Socket.io
- Axios
