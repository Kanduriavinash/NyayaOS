# NyayaOS: The Agentic Operating System for the Justice Ecosystem

⚖️ **Hackathon Track:** Open Innovation (Legal Technology)  
🚀 **Tech Stack:** Next.js (React/TypeScript), Tailwind CSS, Prisma, SQLite, and **NitroStack** (Official MCP Framework).

---

## Executive Summary

**NyayaOS** is a decentralized, agentic AI platform built on the Model Context Protocol (MCP) designed to streamline and automate the entire lifecycle of judicial cases. Instead of automating a single legal task, NyayaOS connects citizens, lawyers, court registries, and judges through specialized MCP servers, coordinating files, schedules, and analytics dynamically.

---

## Core System Architecture

The project is configured as a **pnpm monorepo** containing:
1. **Shared Database Package (`@nyayaos/database`)**: Built with Prisma and SQLite, ensuring zero database installation dependencies.
2. **8 MCP Servers (`/mcp`)**: Bootstrapped using **NitroStack** decorators (`@McpApp`, `@Module`, `@Tool`, `@Resource`, `@Prompt`) running on dual transport (STDIO + HTTP SSE).
3. **5 Frontend Portals (`/apps`)**: Fully functioning Next.js applications styled with a premium dark-themed Tailwind CSS design.

---

## Folder Structure & Portfolio

```text
NITROSTACK/
├── apps/                        # Frontend Portals (Next.js)
│   ├── citizen-portal/          # Intake, identity, uploads, status tracking (Port 3000)
│   ├── lawyer-dashboard/        # Case claiming, AI plaint drafting, legal research (Port 3001)
│   ├── judge-dashboard/         # Briefs, courtroom scheduling, order issuing (Port 3002)
│   ├── registry-dashboard/      # Automatic/manual case registry audit & approvals (Port 3003)
│   └── admin-dashboard/         # Global stats, system users, audit logs (Port 3004)
├── mcp/                         # 8 NitroStack MCP Servers (Ports 4001 - 4008)
│   ├── identity-server/         # Citizen identity verification
│   ├── document-server/         # OCR, signature detection, page completeness checks
│   ├── registry-server/         # Jurisdiction, fee calculator, registry validation
│   ├── research-server/         # Statutes search, precedents & case-law search
│   ├── scheduling-server/       # Room availability, hearing allocations
│   ├── notification-server/     # Email, SMS, and push notification dispatches
│   ├── analytics-server/        # Court workloads and disposal metrics
│   └── knowledge-server/        # Legal guides and acts reference
└── packages/
    └── database/                # SQLite Prisma client and seeding scripts
```

---

## Getting Started & Installation

Follow these steps to run the entire project locally from scratch:

### 1. Prerequisites
Ensure you have Node.js (v18+) and `pnpm` installed on your machine.

### 2. Install Dependencies
Run the installation command in the root folder to download and link all workspace projects:
```bash
pnpm install
```

### 3. Initialize the SQLite Database & Seed Data
Generate the Prisma Client, synchronize the schema, and populate the database with default lawyers, judges, and courts:
```bash
# Push database schema to SQLite (packages/database/prisma/dev.db)
pnpm --filter @nyayaos/database prisma db push

# Seed initial system users and baseline records
pnpm --filter @nyayaos/database seed
```

### 4. Build the Monorepo Packages
Compile all TypeScript libraries, MCP servers, and Next.js applications:
```bash
pnpm build
```

---

## Running the Applications

### Start all 8 MCP Servers (HTTP + STDIO Dual Mode)
Run the following command to start all MCP servers on ports `4001` through `4008`:
```bash
pnpm --filter "@nyayaos/*-server" start:prod
```

### Start the Frontend Dashboards
Run the Next.js portals in development mode:
```bash
pnpm dev
```
Once running, you can access the portals in your browser:
* **Citizen Portal:** [http://localhost:3000](http://localhost:3000)
* **Lawyer Workspace:** [http://localhost:3001](http://localhost:3001)
* **Judge Chambers:** [http://localhost:3002](http://localhost:3002)
* **Registry Dashboard:** [http://localhost:3003](http://localhost:3003)
* **Central Admin Console:** [http://localhost:3004](http://localhost:3004)

---

## Connecting to NitroStudio

You can load and test the tools/resources/prompts of the MCP servers visually inside **NitroStudio**:

### Option A: STDIO Connection (Recommended)
1. Open **NitroStudio**.
2. Click **Add Server** → Select the **Nitro Project** tab.
3. Browse to the folder of the server you want to connect (e.g. `mcp/identity-server` or `mcp/document-server`).
4. Click **Open Project** → Select **Studio App Canvas**.

### Option B: HTTP Stream Connection
Since the servers run in dual transport mode in production, you can link them directly via URL:
1. Open **NitroStudio**.
2. Click **Add Server** → Select the **Other Project** tab.
3. Name your project (e.g. `document-server`).
4. Set Connection Type to **HTTP (Streamable HTTP)**.
5. Set URL to: `http://localhost:4002/mcp` (substitute the port `4001`-`4008` for other servers).
6. Click **Add Server**.

---

## Deploying to NitroCloud

To deploy your server to the official NitroCloud hosting platform:
1. Make sure you are logged into your NitroStack CLI:
   ```bash
   npx @nitrostack/cli login
   ```
2. Navigate to the specific server folder:
   ```bash
   cd mcp/identity-server
   ```
3. Build and deploy:
   ```bash
   npx @nitrostack/cli build
   npx @nitrostack/cli deploy
   ```
   *(Or link it inside NitroStudio and click the **Deploy** button in the visual interface)*

---
⚖️ **NyayaOS** — Bringing Speed, Automation, and Transparency to Justice.
