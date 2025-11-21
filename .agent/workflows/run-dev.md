---
description: How to run the development environment with hot reloading
---

# Running the Development Environment

To run the application with hot reloading enabled (so you don't have to restart Docker for every change), follow these steps:

1.  **Start Docker Compose**:
    Run the following command in your terminal:
    ```bash
    docker compose up --build
    ```
    The `--build` flag ensures that any changes to the `Dockerfile` or dependencies are applied.

2.  **Access the Application**:
    -   **Frontend/API**: Open [http://localhost:3001](http://localhost:3001)
    -   **AI Service**: [http://localhost:5002](http://localhost:5002)

3.  **Making Changes**:
    -   Edit files in `apps/web` (frontend) or `apps/api` (backend).
    -   The application should automatically reload or reflect changes instantly.
    -   If you add new dependencies (`package.json`), you will need to rebuild:
        ```bash
        docker compose down
        docker compose up --build
        ```

4.  **Troubleshooting**:
    -   If changes aren't showing, check the logs: `docker compose logs -f web`
    -   Ensure `NODE_ENV` is set to `development` (this is now default in `docker-compose.yml`).
