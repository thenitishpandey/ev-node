## My Express JS REST API Setup Template

This is a template for setting up an Express.js REST API with TypeScript, Prisma, and PostgreSQL.

### Getting Started

#### Prerequisites

-   Node.js
-   Docker (for PostgreSQL)
-   npm or yarn

#### Installation

1. Clone the repository:

    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies:

    ```sh
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:
   Copy the `.env.example` file to `.env` and fill in the required values.

    ```sh
     cp .env.example .env
    ```

4. Start PostgreSQL using Docker:

    ```sh
    docker-compose up -d
    ```

5. Run database migrations:

    ```sh
    npx prisma migrate dev
    ```

6. Start the development server:
    ```sh
    npm run dev
    # or
    yarn dev
    ```

### Project Structure Details

-   `app/index.ts`: Entry point of the application.
-   `app/config/`: Configuration files for authentication and other settings.
-   `app/handlers/`: Request handlers for different routes.
-   `app/services/`: Business logic and services.
-   `app/utils/`: Utility functions and helpers.
-   `postgres-data/`: PostgreSQL data directory.
-   `prisma/schema.prisma`: Prisma schema definition.
-   `prisma/migrations/`: Database migration files.

### Scripts

-   `npm run dev`: Start the development server.
-   `npm run build`: Build the project.
-   `npm run start`: Start the production server.
-   `npm run lint`: Run ESLint.
-   `npm run format`: Format code with Prettier.

### Libraries Used

-   [Express](https://expressjs.com/): Web framework for Node.js.
-   [TypeScript](https://www.typescriptlang.org/): Typed superset of JavaScript.
-   [Prisma](https://www.prisma.io/): ORM for Node.js and TypeScript.
-   [Docker](https://www.docker.com/): Containerization platform.
-   [PostgreSQL](https://www.postgresql.org/): Relational database.

### License

This project is licensed under the MIT License.
