# Convivia24 - Celebration Platform

Convivia24 is a platform for planning and organizing celebrations, connecting with other celebration enthusiasts, and discovering events.

## Features

- **User Authentication**: Sign up, login, and profile management
- **Community**: Join communities, participate in discussions, and connect with other users
- **Events**: Create, discover, and attend events
- **Chat**: Real-time chat with community members

## Tech Stack

### Frontend
- React
- React Router
- Tailwind CSS
- Framer Motion
- Axios

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/convivia24-landing.git
cd convivia24-landing
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/convivia24
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start MongoDB:
```bash
mongod
```

5. Run the development server:
```bash
npm run dev
```

This will start both the frontend and backend servers concurrently.

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
convivia24-landing/
├── public/                  # Static files
├── server/                  # Backend code
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── server.js            # Server entry point
├── src/                     # Frontend code
│   ├── components/          # React components
│   │   ├── auth/            # Authentication components
│   │   └── layout/          # Layout components
│   ├── context/             # React context
│   ├── pages/               # Page components
│   ├── App.js               # Main App component
│   └── index.js             # Frontend entry point
└── package.json             # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user
- `PUT /api/auth/updatedetails` - Update user details
- `PUT /api/auth/updatepassword` - Update user password

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user (admin only)
- `PUT /api/users/profile-picture` - Update profile picture

### Communities
- `GET /api/communities` - Get all communities
- `GET /api/communities/:id` - Get single community
- `POST /api/communities` - Create a community
- `PUT /api/communities/:id` - Update a community
- `DELETE /api/communities/:id` - Delete a community
- `PUT /api/communities/:id/join` - Join a community
- `PUT /api/communities/:id/leave` - Leave a community

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `GET /api/communities/:communityId/events` - Get community events
- `POST /api/communities/:communityId/events` - Create an event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event
- `PUT /api/events/:id/attend` - Attend an event
- `PUT /api/events/:id/cancel` - Cancel attendance

### Messages
- `GET /api/communities/:communityId/messages` - Get community messages
- `POST /api/communities/:communityId/messages` - Send a message
- `DELETE /api/messages/:id` - Delete a message

## License

This project is licensed under the MIT License.
