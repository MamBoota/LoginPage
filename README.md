# Authorization Screen (2FA)

**Tech stack**: React, React Query.

## Setup
1. Ensure Node.js (v18+) and npm/yarn installed.
2. Clone repo:  
   ```bash
   git clone <repository>

3. Install dependencies:

bash
### npm install

Commands
Development
bash
### npm start                  # Runs on http://localhost:3000

Production
bash
### npm run build            # Builds static files

Testing & Linting
bash
### npm test                 # Run tests
### npm run lint             # ESLint check
### npm run format           # Prettier formatting

Docker
bash
### make docker-build        # Build image
### make docker-run          # Run container

Structure
src/ — source code.

public/ — static assets.

tests/ — test files.

docker/ — Docker config.

Makefile — build scripts.

Key Components
LoginForm — email/password validation.

TwoFactorForm — 6-digit code input.

useAuth — auth state & API hook.

API Mocks
authApi.login(email, password) → { success: true } (for test@...).

authApi.verifyTwoFactor(code) → { valid: true }.

Environment
Create .env:

plaintext
NODE_ENV=development
PORT=3000