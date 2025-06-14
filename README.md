# AgriSure App

AgriSure is a real-time agricultural insurance and monitoring platform leveraging Next.js, Supabase, Hedera Hashgraph, n8n, and AI integrations. The platform provides dashboards, smart contract management, workflow automation, and real-time data visualization for farms.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Real-time Dashboard:** Live metrics for farms, contracts, workflows, payments, and sensors.
- **Smart Contracts:** Deploy and monitor insurance contracts on Hedera Hashgraph.
- **Workflow Automation:** Integration with n8n for automated processes.
- **AI Agents:** Risk prediction and recommendations using AI.
- **Sensor Data:** IoT integration for climate and soil monitoring.
- **User Authentication:** Secure login and user management.
- **Event Timeline:** Visualize recent system and user events.
- **System Health:** Monitor connectivity to all core systems.

---

## Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (React)
- **Database:** [Supabase PostgreSQL](https://supabase.com/)
- **Blockchain:** [Hedera Hashgraph](https://hedera.com/)
- **Automation:** [n8n Workflows](https://n8n.io/)
- **Authentication:** Supabase Auth
- **UI:** Custom components, [Lucide Icons](https://lucide.dev/)
- **Styling:** Tailwind CSS, PostCSS
- **TypeScript:** Full type safety

---

## Project Structure

```
.
├── components/           # Shared UI and layout components
│   ├── auth/             # Authentication components
│   ├── layout/           # Main layout and sidebar
│   ├── pages/            # Page-level components (dashboard, project overview, etc.)
│   └── ui/               # Reusable UI primitives (Card, Badge, Tabs, etc.)
├── hooks/                # Custom React hooks
├── lib/                  # API clients, database, and utility libraries
├── public/               # Static assets (SVGs, images)
├── scripts/              # Utility scripts for setup or deployment
├── src/                  # Main source directory (mirrors components, hooks, lib)
│   └── app/              # Next.js app directory (entry point)
├── types/                # TypeScript type definitions
├── .env.local            # Environment variables (not committed)
├── package.json          # Project metadata and scripts
├── tsconfig.json         # TypeScript configuration
├── postcss.config.mjs    # PostCSS configuration
├── eslint.config.mjs     # ESLint configuration
└── README.md             # Project documentation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- Supabase project (for database and auth)
- Access to Hedera Hashgraph and n8n (optional for full functionality)

### Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-org/agrisure-app.git
   cd agrisure-app
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.local.example` to `.env.local` and fill in your credentials.
   - Required variables typically include Supabase URL, Supabase anon key, Hedera credentials, and n8n endpoints.

---

## Environment Variables

Create a `.env.local` file at the root with the following (example):

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
HEDERA_API_URL=your-hedera-api-url
N8N_API_URL=your-n8n-api-url
```

---

## Scripts

- **Start development server:**
  ```sh
  npm run dev
  ```
- **Build for production:**
  ```sh
  npm run build
  ```
- **Start production server:**
  ```sh
  npm start
  ```
- **Lint code:**
  ```sh
  npm run lint
  ```
- **Format code:**
  ```sh
  npm run format
  ```

---

## Development Workflow

- All main logic is in [`src/`](src/) and [`components/`](components/).
- The main dashboard is implemented in [`src/components/pages/project-overview-page.tsx`](src/components/pages/project-overview-page.tsx).
- Authentication is handled via [`useAuth`](components/auth/auth-provider.tsx).
- Database access is abstracted in [`lib/database.ts`](lib/database.ts) and [`lib/supabase.ts`](lib/supabase.ts).
- UI primitives (Card, Badge, Tabs, Progress, etc.) are in [`components/ui/`](components/ui/).
- System status and metrics are fetched and displayed in real time.

---

## Testing

- (Add your testing setup here, e.g., Jest, React Testing Library, Cypress, etc.)
- To run tests:
  ```sh
  npm test
  ```

---

## Deployment

- Deploy on [Vercel](https://vercel.com/) or any Node.js-compatible hosting.
- Ensure all environment variables are set in your deployment environment.

---

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Contact

For questions or support, open an issue or contact the maintainers.
