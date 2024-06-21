import app from '../app.js';

// Vercel seems to work only with '/api/index.js' as the main server file, and does not accept '/index.js' or '/app.js'.
// This is a workaround was created to keep the original structure of my project.
// APIs are found at ./server/handlers