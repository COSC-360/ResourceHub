## Project Description

## Features

## How to Run

You need to run both the front and backend. You will need two terminals for this.

1. Running the frontend

in one of the terminals, make sure your current directory is `.../client`, then run:
~~~
npm run dev
~~~

if you run into import/module issues, try running:
~~~
npm install
~~~

2. Running the backend

in the other terminal, make sure your current directory is `.../server`, then run:
~~~
node server.js
~~~

if you run into import/module issues, try running:
~~~
npm install
~~~

### Running with Docker (Recommended)

This project can be run using Docker, which starts the frontend, backend, and MongoDB together.

#### Prerequisites
- Docker installed
- Docker Compose installed

#### Setup

1. Create a `.env` file for the backend by copying the example:

cp server/.env.example server/.env

2. Add the required environment variables inside `server/.env`:

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
ACCESS_TOKEN_SECRET_KEY=your_access_token_secret

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

docker compose exec client npm install

or

docker compose exec server npm install


While the docker container is running in a different terminal window. Client or server keyword dependent on where the package needs to be installed.

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
