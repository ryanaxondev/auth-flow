/**
 * src/server.ts
 * ----------------------------------------
 * Process bootstrap entry — spins up HTTP server and wires lifecycle hooks.
 *
 * Integrates:
 *  - app (Express instance)
 *  - env config
 *  - DB pool (Drizzle PostgreSQL client)
 *
 * @module server
 * ----------------------------------------
 */

import "dotenv/config";
import { config } from "#/config/env.js";
import app from "#/app.js";
import { db } from "#/db/index.js";

const PORT = config.port || 4000;
let server: import("http").Server;

/* ----------------------------------------
 * DB Shutdown
 * ----------------------------------------
 *
 * Closes PostgreSQL pool if available.
 */
async function closeDb() {
  if (db?.$client && typeof db.$client.end === "function") {
    try {
      await db.$client.end();
      console.log("PostgreSQL pool closed successfully.");
    } catch (err) {
      console.error("Error closing PostgreSQL pool:", err);
    }
  } else {
    console.warn("db.$client.end() not found. Skipping DB shutdown.");
  }
}

/* ----------------------------------------
 * Graceful Shutdown Signal Handler
 * ----------------------------------------
 */
function shutdown(signal: string) {
  console.log(`${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      console.log("Server closed. Cleaning up resources...");
      await closeDb();
      process.exit(0);
    });

    setTimeout(() => {
      console.warn("Could not close connections in time, forcing shutdown");
      process.exit(1);
    }, 30_000).unref();
  } else {
    (async () => {
      await closeDb();
      process.exit(0);
    })();
  }
}

/* ----------------------------------------
 * Start Server
 * ----------------------------------------
 *
 * Performs optional DB warm-up then listens on configured port.
 */
async function startServer() {
  try {
    if (db?.$client) {
      await db.$client.query("SELECT 1").catch(() => null);
    }

    server = app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT} [${config.env}]`);
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error("Server error:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

/* ----------------------------------------
 * Process Signal Listeners
 * ----------------------------------------
 */
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

/* ----------------------------------------
 * Bootstrap
 * ----------------------------------------
 */
startServer();
