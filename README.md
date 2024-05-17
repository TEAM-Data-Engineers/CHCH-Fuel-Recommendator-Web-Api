# CHCH-Fuel-Recommendator-Web-Api

## Description

The `CHCH-Fuel-Recommendator-Web-Api` is part of the CHCH-Fuel-Recommendator project by Group TEAM. This API provides backend services for managing user authentication, retrieving gas station information, and fuel prices. It is built using Node.js, Express, and PostgreSQL, and is documented using Swagger.

## Project Overview

This project focuses on data engineering and involves the development of microservices for the frontend, backend, and mobile end. We use PostgreSQL and MongoDB databases to manage data. GitHub issues and projects are utilized for project management.

## Features

- User authentication and authorization.
- Retrieve gas station information based on user location.
- Provide fuel prices for different gas stations.
- API documentation using Swagger.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:

   ```sh
   git clone git@github.com:TEAM-Data-Engineers/CHCH-Fuel-Recommendator-Web-Api.git
   cd CHCH-Fuel-Recommendator-Web-Api
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory with the following content:

   ```sh
   PORT=5002
   DATABASE_URL=your_database_url
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

## Project Structure

The project directory is structured as follows:

```
CHCH-Fuel-Recommendator-Web-Api/
├── config/
│   └── db.js
├── middlewares/
│   └── authorization.js
├── routes/
│   ├── auth-routes.js
│   ├── gas-station-routes.js
│   └── users-routes.js
├── .env
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── README.md
```

## API Endpoints

### User Authentication

- `POST /api/v1/auth/login`: Login a user.
- `GET /api/v1/auth/refresh_token`: Refresh the access token.
- `DELETE /api/v1/auth/refresh_token`: Delete the refresh token.

### Gas Stations

- `GET /api/v1/gas-stations`: Retrieve gas stations within a 5 km radius based on user's location.

## Usage

### API Documentation

The API documentation is available at `/api-docs`. The documentation provides details about each endpoint, including request parameters and responses.

### Example Request

To get gas stations within a 5 km radius, send a GET request to:

```sh
GET /api/v1/gas-stations?latitude=<latitude>&longitude=<longitude>
```

## Contact

If you have any questions or need further assistance, please contact our team at [aemooooon@gmail.com].
