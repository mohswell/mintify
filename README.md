# AI-Integrated Code Pipeline  

Welcome to the **AI-Powered GitHub Code Application**, a powerful tool designed to leverage AI capabilities for analyzing pull requests, commits, and repository data. This monorepo uses [Turborepo](https://turbo.build/repo) for an efficient and scalable monolithic development.

### Installing the turbo CLI

```bash
npm install turbo --save-dev
```

---

## 🛠️ What Does This App Do?

This application provides intelligent insights into GitHub pull requests by analyzing:
- Code changes, commit messages, and statistics.
- AI-driven suggestions for PR quality improvements.
- PR risk assessments based on AI analysis.
- Reviewer suggestions and code quality highlights.

## 📂 Monorepo Structure

This repository follows a monorepo architecture to manage multiple projects and shared resources efficiently:

### Apps and Packages

- **`web`**: The main user-facing [Next.js](https://nextjs.org/) application for viewing and managing pull request analyses.
- **`api`**: The backend service powered by [Prisma](https://www.prisma.io/) and [Nest.js](https://nestjs.com/) for interacting with the database and integrating AI services like Gemini.
- **`@repo/ui`**: A shared React component library for consistent UI across applications.
- **`@repo/eslint-config`**: Shared `eslint` configuration (including Next.js and Prettier rules).
- **`@repo/typescript-config`**: Centralized `tsconfig.json` files for consistent TypeScript configuration.

## 🌟 Features

- **AI Analysis**: Uses Google Gemini Nano AI models (`gemini-pro`, `gemini-pro-vision`) to analyze pull requests and commits.
- **Supabase Integration**: Manages user sessions and stores metadata.
- **GitHub OAuth**: Secure GitHub login for seamless access to repository data.
- **Efficient Monorepo Setup**: Built with Turborepo for shared tooling and caching.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16.x or later.
- A running PostgreSQL database.
- Supabase account for backend storage.
- Google Gemini API access.
- A `.env` file for environment-specific variables.

---

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mohswell/mintify.git
cd mintify
npm install
```

---

### Environment Variables

Configure environment variables in `.env`, `.env.local`, or `.env.template` for different environments.

#### Root `.env` Example:
```env
DATABASE_URL=""
DIRECT_URL=""
```

#### For the Frontend go to `web` and create a `.env.local` Example:
```env
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
NEXT_PUBLIC_AUTH_REDIRECT_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_SECRET=""
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"
```

#### For the Frontend go to `api` and create a `.env` Example:
```env
GEMINI_API_KEY=""
GEMINI_PRO_MODEL="gemini-pro"
GEMINI_PRO_VISION_MODEL="gemini-pro-vision"
PORT=8000
JWT_SECRET=""
DATABASE_URL=""
```

---

### Scripts

Here are the key npm scripts for managing the monorepo:

| Command           | Description                                              |
|-----------------  |----------------------------------------------------------|
| `turbo run build` | Builds all apps and packages.                            |
| `rubo run dev`    | Starts the development servers for all apps.             |
| `turbo run lint`  | Runs ESLint across all apps and packages.                |
| `turbo run format`| Formats code using Prettier.                             |
| `turbo run start` | Starts the whole application in production mode.         |

---

### Development

To start the development environment for all apps and packages:

```bash
turbo run dev
```

To build all apps and packages for production:

```bash
turbo run build
```

---

## 🧩 Remote Caching with Turborepo

Turborepo supports [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) for faster builds. To enable:

1. Login to your Vercel account:
   ```bash
   npx turbo login
   ```

2. Link your Turborepo to a Remote Cache:
   ```bash
   npx turbo link
   ```

---

## 🛡️ GitHub Actions

The project includes CI workflows to streamline development and deployment. Example snippets include:

```bash
# Setting up AI in a CI/CD pipleline in GitHub Actions
- uses: mohswell/ai@v1
  with:
    base_app_url: ${{ secrets.BASE_APP_URL }}
    api_key: ${{ secrets.API_KEY }}
```

---

## Tools and Utilities

- **TypeScript**: For shared static typing across the monolithic codebase.
- **ESLint and Prettier**: For linting and consistent formatting.
- **Husky and Lint-Staged**: For pre-commit hooks and staged file linting.
- **Commitizen**: For generating conventional commit messages.

---

## License

The repository is licensed under GNU GENERAL PUBLIC LICENSE, ensuring proper attribution and restricted commercial use. See the `LICENSE` file for details.

---

## Contributing

Contributions are welcome! Please fork the repo and create a pull request with your changes and tag me in to review your features.

---

## Contact

If you have questions or suggestions, feel free to [open an issue](https://github.com/mohswell/mintify/issues) or contact me directly at [mohammedabdy10@gmail.com].

---