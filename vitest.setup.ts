// Provide env vars some modules read at import time so unit tests can import
// them without a live database or real secrets. No queries run in unit tests.
process.env.AUTH_SECRET ??= "test-secret-please-change-test-secret-please-x";
process.env.NEXTAUTH_SECRET ??= process.env.AUTH_SECRET;
process.env.DATABASE_URL ??=
  "postgresql://test:test@localhost:5432/test?schema=public";
process.env.APP_URL ??= "http://localhost:3000";
