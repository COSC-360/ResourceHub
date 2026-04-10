# ResourceHub

## Project Description

ResourceHub is a website for students to post course resources, hold discussions, and join or create courses. 

## Features

## How to Run

### Running with Docker (Recommended)

This project can be run using Docker, which starts the frontend, backend, and MongoDB together.

#### Prerequisites
- Docker installed
- Docker Compose installed

#### Setup

1. Create a `.env` file for the backend by copying the example:

```
cp server/.env.example server/.env
```

2. Add the required environment variables inside `server/.env`:

##### Database
```
MONGO_URI=your_mongodb_connection_string
```

##### JWT
```
ACCESS_TOKEN_SECRET_KEY=your_access_token_secret
```

#### Run the application

From the project root directory, run:

docker compose up --build

#### Access the application

- Frontend: http://localhost:5173  
- Backend: http://localhost:3000  

#### Stop the application

docker compose down

#### Install npm packages

If there are issues with npm packages not resolving while the docker container is up, run:

```
docker compose exec client npm install
```

or

```
docker compose exec server npm install
```

While the docker container is running in a different terminal window. Client or server keyword dependent on where the package needs to be installed.

### Running from a Tarball Release

If you downloaded a release tarball instead of cloning the repository:

1. Extract the archive:

~~~
tar -xzf ResourceHub-alpha-YYYY-MM-DD-HHMM.tar.gz
~~~

2. Move into the extracted folder.

3. Create the backend environment file if needed:

~~~
cp server/.env.example server/.env
~~~

4. Fill in the required environment variables in `server/.env`.

5. Start the app with Docker:

~~~
docker compose up --build
~~~

## Environment Variables

## Project Structure

```
ResourceHub/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # React components (AddMyCoursePage, AdminPanel, AuthForms, Cards, etc.)
│   │   ├── pages/           # Page components
│   │   ├── constants/       # Constants and configurations
│   │   ├── lib/             # Utility libraries
│   │   ├── assets/          # Static assets
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── AuthContext.jsx
│   ├── public/              # Public static files
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
│
├── server/                   # Backend (Node.js + Express)
│   ├── controllers/         # Request handlers
│   ├── services/           # Business logic
│   ├── repositories/       # Data access layer
│   ├── models/             # Database schemas
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   ├── errors/             # Error definitions
│   ├── tests/              # Test files
│   ├── uploads/            # File uploads directory
│   ├── assets/             # Static assets
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml       # Docker Compose configuration
├── README.md
└── LICENSE
```

## Tech Stack

### Frontend
- **React** 19 - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **TailwindCSS** - Styling
- **Socket.io Client** - Real-time communication
- **Recharts** - Data visualization and charting
- **ESLint** - Code linting

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT (jsonwebtoken)** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **Swagger** - API documentation
- **Jest** - Testing framework
- **ESLint** - Code linting

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Troubleshooting

## Development

### Running Tests

To run tests on the backend, make sure your current directory is `.../server`, then run:
~~~
npm run test
~~~

### Running Linter

To run the linter on the frontend, make sure your current directory is `.../client`, then run:
~~~
npm run lint
~~~

To run the linter on the backend, make sure your current directory is `.../server`, then run:
~~~
npm run lint
~~~
