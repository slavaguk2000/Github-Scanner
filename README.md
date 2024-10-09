# GitHub Scanner

GitHub Scanner is a robust tool designed to fetch and display repositories and detailed information for any GitHub user. The scanner provides two primary functionalities: listing all repositories for a user and displaying detailed information about a specific repository. This tool is highly extensible, making it easy to add new features as needed.

## Requirements

- **Node.js**: Version 20. This version provides the latest features and optimizations, ensuring that the scanner runs efficiently and is compatible with the latest packages.
- **GitHub Personal Access Token**: Required for authenticating requests to the GitHub API.

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/github-scanner.git
   cd github-scanner
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Install `tsx` globally** (if not already installed):

   ```bash
   npm install -g tsx
   ```

4. **Run the application:**
   ```bash
   npm start
   ```

The main entry point is **`src/index.ts`**, and the application will initialize the server on port 5000 by default. The application will log the server URL in the console.

## Key Libraries and Why We Use Them

- **core-js**: Provides polyfills for modern JavaScript features, ensuring compatibility across environments.
- **Apollo Server**: Enables a GraphQL server that integrates seamlessly with TypeScript and `type-graphql` for type safety. This choice allows for easy extension and future growth with minimal refactoring.
- **type-graphql**: Leverages TypeScript decorators to build a GraphQL schema, improving developer experience and reducing errors during development.
- **Octokit**: A modern GitHub API client for Node.js. It’s reliable and provides a simple interface for interacting with GitHub’s API, supporting all our use cases like fetching repository data and webhooks.
- **dotenv** (optional): Use this for managing environment variables securely. Although not included by default, it's recommended for storing your GitHub Personal Access Token.

## Core Functionality

- **Listing Repositories**: Fetches and displays a list of repositories associated with the authenticated GitHub account. This feature is useful for an overview of all projects and their metadata.
- **Detailed Repository Information**: For any repository, detailed information such as visibility, size, owner details, and webhooks can be retrieved. This is particularly helpful for monitoring and managing repository resources.

## Extensibility

The codebase is designed with extensibility in mind:

1. **Resolvers**: The `RepoResolver` class can be easily extended with new queries and mutations for additional GitHub data (e.g., issues, pull requests).
2. **Service Layer**: The `GithubService` class contains methods that interact with the GitHub API. Additional methods can be added here to handle more specific API endpoints.
3. **Task Queue**: Implements a basic task queue for rate-limited requests. Although this is currently implemented in-memory, it can be replaced with a Redis or database-backed queue for distributed environments.

## Folder Structure

- **constants/**: Contains constant values, like `MAX_ASYNC_REQUESTS_COUNT`, to control global configurations.
- **enums/**: Holds enumerations that define various states, such as `RepositoryVisibility`, to ensure type safety and consistency across the application.
- **resolvers/**: Houses GraphQL resolvers, which define the data retrieval logic for each query.
- **dictionaries/**: Contains dictionaries to map data to enums or other types.
- **services/**: Manages API calls and business logic. For example, `GithubService` encapsulates GitHub API interactions, and `TaskQueue` manages rate-limited tasks.
