import { createApp } from './app.js';
import { config } from './config/index.js';
import { resetStore } from './data/memoryStore.js';

/**
 * Server entry point.
 *
 * Responsibilities: prepare the in-memory store, start Express and shut down
 * cleanly. All application logic lives in app.js and below.
 */
const app = createApp();

const { todos, notes } = resetStore({ seed: config.seedData });

const server = app.listen(config.port, () => {
  const lines = [
    '',
    '  TaskNest API is running',
    `  URL           http://localhost:${config.port}/api`,
    `  Health check  http://localhost:${config.port}/api/health`,
    `  Environment   ${config.env}`,
    `  Storage       in-memory  (${todos.length} todos, ${notes.length} notes${config.seedData ? '' : ', seeding disabled'})`,
    '  Note          in-memory data resets every time this server restarts',
    '',
  ];
  console.log(lines.join('\n'));
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${config.port} is already in use. Set PORT to a free port and try again.`);
    process.exit(1);
  }
  throw error;
});

/** Close the HTTP server before exiting so restarts are clean. */
function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down TaskNest API...`);
  server.close(() => process.exit(0));
}

['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));
