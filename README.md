# ResourceHub

## Project Description

ResourceHub is a website for students to post course resources, hold discussions, and join or create courses. 

## Features

- Creating discussions
- Replying to other users discussions (given that you are a member of the course that discussion belongs to)
- Searching for discussions
- Upvoting, downvoting discussions
- Changing your profile info
- Creating a course
- Joining courses
- etc.

## How to Run

### Running with Docker (Recommended)

This project can be run using Docker, which starts the frontend, backend, and MongoDB together.

#### Prerequisites
- Docker installed
- Docker Compose installed

#### Setup

No manual setup is required. All runtime environment variables are defined in `docker-compose.yml`.

#### Run the application

From the project root directory, run:

~~~
docker compose up --build
~~~

#### Access the application

- App (frontend + backend via proxy): http://localhost:4000  
- Backend docs: http://localhost:4000/api-docs  

#### Stop the application

~~~
docker compose down
~~~

#### Install npm packages

If there are issues with npm packages not resolving while the docker container is up, run:

~~~
docker compose exec client npm install
~~~

or

~~~
docker compose exec server npm install
~~~

While the Docker containers are running in a different terminal window, use the `client` or `server` keyword depending on where the package needs to be installed.

### Running from a Tarball Release

If you downloaded a release tarball instead of cloning the repository:

1. Get a release from the [releases folder](releases/) and extract the archive:

~~~
tar -xzf ResourceHub-v1.0.0.tar.gz
~~~

2. After extraction, in your terminal, move to the root directory of that extracted file (e.g., ResourceHub-v1.0.0)

3. Start the app with Docker:

~~~
docker compose up --build
~~~

#### Access the application

- App (frontend + backend via proxy): http://localhost:4000  
- Backend docs: http://localhost:4000/api-docs  

#### Stop the application

~~~
docker compose down
~~~

## Environment Variables
##### Database
~~~
MONGO_URI=mongodb://mongo:27017/resourcehub
~~~

These are configured directly in `docker-compose.yml` so TAs can run with one command.

##### JWT
~~~
ACCESS_TOKEN_SECRET_KEY=your_access_token_secret
~~~
## Project Structure

~~~
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
~~~

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

Always run `npm i` or 
~~~
docker compose exec client npm install
~~~

or 

~~~
docker compose exec server npm install
~~~

before trying to run the Docker/program.

## Development

### Running Tests

To run tests on the backend, make sure your current directory is `.../server`, then run:
~~~
npm run test
~~~

To run tests on the frontend, make sure your current directory is `.../client`, then run:
~~~
npm run test:run
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
