# Dynamic Mock Service

A lightweight, containerized Express API that allows you to dynamically create, manage, and consume mock endpoints using MongoDB.

## Features

- **Dynamic Routing:** Create new API endpoints on the fly without restarting the server.
- **Persistence:** Mocks are stored in MongoDB.
- **Dockerized:** Simple setup with Docker Compose.
- **Hot Reloading:** Development mode enabled with `nodemon`.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

1.  **Start the services:**

    ```bash
    docker-compose up --build
    ```

    The API will be accessible at `http://localhost:8280`.

## Usage

### 1. Create a Mock

Send a `POST` request to the admin endpoint to define a new route.

**POST** `http://localhost:8280/api/mocks`

**Body:**

```json
{
  "method": "POST",
  "path": "/v1/users",
  "statusCode": 201,
  "response": {
    "id": 1,
    "name": "John Doe",
    "age": 30
  }
}
```

### 2. Consume the Mock

Once created, the endpoint is immediately available.

**POST** `http://localhost:8280/v1/users`

It will return the JSON response you defined.

## Admin API Reference

| Method   | Endpoint         | Description                   |
| :------- | :--------------- | :---------------------------- |
| `GET`    | `/api/health`    | Service health check          |
| `GET`    | `/api/mocks`     | List all registered mocks     |
| `POST`   | `/api/mocks`     | Create a new mock             |
| `PUT`    | `/api/mocks/:id` | Update an existing mock by ID |
| `DELETE` | `/api/mocks/:id` | Delete a mock by ID           |
