
# AI-Code Review

AI-Code Review is a tool that automates code reviews on every pull request by using AI. It integrates with GitHub via webhooks to analyze code files, detect bugs, suggest improvements, and ensure code styling consistency.

## Target Audience

This project is designed for developers who want automated and reliable code reviews integrated into their CI/CD pipelines.


## Features

- **Code Review Automation**: Analyzes code changes for bugs, improvements, and styling suggestions.
- **Webhooks Integration**: (Pending) Listens to GitHub webhooks for real-time PR analysis.
- **Queue Processing**: Efficient task processing with BullMQ and Redis.
- **Scalable Backend**: Built with Node.js, TypeScript, and Prisma, containerized with Docker, and deployed on EC2 with CI/CD pipelines.
- **Task Management**: Retrieve task status and results for every PR analysis.



## Tech Stack

**Backend Framework:** Node.js (TypeScript) with Express

**AI Integration:** Gemini API

**Database:** PostgreSQL with Prisma

**Caching:** Redis

**Task Queue:** BullMQ

**Validation:** Zod

**HTTP Client:** Axios

## Installation and Setup

**Prerequisites:**
- Node.js
- Docker
- Redis

**Steps:**
1. Clone the repository.
2. Set up the environment variables (.env file).

```bash
GITHUB_TOKEN=gitub_token
DATABASE_URL=your_postgres_connection_string
GEMINI_API_KEY=your_api_key
REDIS_URL=your_redis_connection_string
```
3. Install dependencies:
```
npm install
```
4. Start Service:
```
npm run dev
```
5. The backend is now available at: `http://localhost:3001`
## Testing

Use Postman or a similar tool to test the endpoints:

1. **Analyze a pull request:**
```bash
POST http://code-review.arnab-personal.tech/api/analyze_pr
{
    "repo_url": "https://github.com/<username>/<repo_name>/pull/<pull_request_number>",
    "pr_number": pull_request_number,
    "github_token": "<Github_Token>"
}
```

2. **Check task status:**
```bash
GET http://code-review.arnab-personal.tech/api/status/:task_id  
```

3. **Get task results:**
```bash
GET http://code-review.arnab-personal.tech/api/results/:task_id  
```

## Roadmap

**Webhook Support:**
Add GitHub webhook integration to trigger the code review process automatically on every pull request.

## Notes
- Ensure that the backend server and BullMQ worker are running simultaneously for the application to function correctly.
- The incomplete webhook feature does not affect the functionality of the existing APIs.
