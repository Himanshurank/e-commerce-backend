import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://78a89347536a9127e3479032cda4fbf7@o4510093087932416.ingest.us.sentry.io/4510093091995648",
  integrations: [
    // send console.log, console.warn, and console.error calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
  ],
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  environment: process.env["NODE_ENV"] || "development",
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  // Enable logs to be sent to Sentry
  enableLogs: true,
});
