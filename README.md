<p align="center">
  <img src="./docs/banner.svg" alt="AuthFlow Banner" width="600"/>
</p>

<h1 align="center">🧬 AuthFlow</h1>

<p align="center">
  <b>A clean, scalable, and production-ready hybrid authentication system</b><br/>
  Built with <b>Node.js</b> • <b>TypeScript</b> • <b>Express</b> • <b>PostgreSQL</b> • <b>Drizzle ORM</b>
</p>

<p align="center">
  <a href="https://github.com/ryanaxondev"><img src="https://img.shields.io/badge/AXON-Ecosystem-0078ff?style=for-the-badge&logo=github" alt="AXON Ecosystem"/></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-%3E=18.0-green?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  <a href="#"><img src="https://img.shields.io/badge/Docker-Ready-0db7ed?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Ready"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License: MIT"/></a>
</p>

---

**AuthFlow** is a hybrid authentication boilerplate that combines  
secure **session-based** and **JWT-based** auth flows for modern web & API applications.  
Perfect for scalable, full-stack systems with a shared authentication layer.

---

## ✨ Features

* 🔐 **User authentication** with secure password hashing (`bcrypt`)
* 🧠 **Session management** stored in PostgreSQL (`connect-pg-simple`)
* 🌐 Supports both **HTML (session)** and **API (JWT)** routes
  → ideal for hybrid apps (Web + SPA + Mobile)
* ⚙️ **Config-driven setup** with environment validation using **Zod**
* 🧩 Modular, layered architecture — easy to scale and maintain
* 🧱 Ready for **development**, **testing**, and **production**
* 🧾 **Colorized logger** with debug mode for better visibility in dev

---

## ⚡ Quick Start

```bash
git clone https://github.com/ryanaxondev/authflow.git
cd authflow

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# (edit .env.local if needed)

# Start PostgreSQL via Docker
docker compose --env-file .env.local up -d

# Sync database schema
npm run db:push

# Start development server
npm run dev
```

Server will start on: [`http://localhost:3000`](http://localhost:3000)

---

## 🧰 Tech Stack

| Layer              | Tools                                           |
| ------------------ | ----------------------------------------------- |
| **Language**       | TypeScript                                      |
| **Framework**      | Express.js                                      |
| **Database**       | PostgreSQL                                      |
| **ORM**            | Drizzle ORM                                     |
| **Authentication** | express-session, connect-pg-simple, JWT         |
| **Validation**     | Zod                                             |
| **Security**       | bcrypt                                          |
| **Env & Config**   | dotenv + zod                                    |
| **Logging**        | custom colorized logger (`src/utils/logger.ts`) |

---

## 📁 Project Structure

```
root
├── .env.local
├── .env.example
├── .gitattributes
├── .gitignore
│
├── package.json
├── package-lock.json
│
├── tsconfig.json
├── drizzle.config.ts
├── docker-compose.yml
│
├── README.md
│
├── postman/
│   ├── auth-flow.postman_collection.json
│   ├── env.postman_environment.json
│   └── README.md
│
└── src/
    ├── types/
    ├── config/
    ├── db/
    ├── models/
    ├── services/
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── errors/
    ├── utils/
    │   └── logger.ts
    ├── app.ts
    └── server.ts
```

---

## 🐳 Running with Docker

```bash
docker compose --env-file .env.local up -d
```

---

## 🗃️ Database (Drizzle ORM)

Push your schema to the database:

```bash
npm run db:push
```

Open Drizzle Studio for database management:

```bash
npm run db:studio
```

---

### 🔐 Authentication Flows

Detailed diagrams for both session-based and JWT-based authentication:

🔊 [View Auth Flows →](./docs/auth-flows.md)

---

## 🗂️ API Testing

You can test the API in two ways:

1. 🧪 **Using Postman** — a ready-to-use collection is available in `/postman`.
2. 🧠 **Manually with cURL** — see [API Test Guide](./postman/README.md) for examples.

---

## 🧩 Folder Highlights

| Folder           | Description                                           |
| ---------------- | ----------------------------------------------------- |
| **/controllers** | Route handlers (auth, user, etc.)                     |
| **/services**    | Business logic — authentication, JWT, user management |
| **/middleware**  | Security guards, session + JWT verification           |
| **/db**          | Drizzle ORM schema and connection                     |
| **/config**      | Environment config, constants                         |
| **/routes**      | API and HTML routes                                   |
| **/utils**       | Logger, crypto helpers                                |
| **/errors**      | Custom error classes and global error handler         |

---

## 💡 Notes

* Default authentication mode is **hybrid** (Session + JWT)
* Works seamlessly with both **web apps** and **API clients**
* Extendable with:

  * Email verification
  * OAuth (Google, GitHub)
  * Role-based access control (RBAC)
* Each layer (controller/service/middleware) is **independently testable**.
* Docker setup ensures **portable local development** and parity across environments.
* Environment schema validation prevents **runtime config errors**.

---

## 🧑‍💻 Author

Developed with ❤️ by [Ryan Carter](https://github.com/ryanaxondev)  
Part of the **AXON Open Source Ecosystem**.

> “Build systems that teach you something every step of the way.”

---

## ⚖️ License

This project is licensed under the [MIT License](./LICENSE).

---

### 🧩 Part of the AXON Open Source Ecosystem

AuthFlow is part of **AXON**, a collection of open-source tools and libraries
designed for clean, maintainable, and production-ready web systems.
