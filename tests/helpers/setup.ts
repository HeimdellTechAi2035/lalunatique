// Guards against ever running the test suite against a database that
// isn't the dedicated test database — resetDb() (tests/helpers/db.ts)
// truncates every table, so pointing this at dev or production by
// accident would be destructive.
if (!process.env.DATABASE_URL?.includes("_test")) {
  throw new Error(
    `Refusing to run tests: DATABASE_URL does not look like a test database (${process.env.DATABASE_URL}). ` +
      "Check TEST_DATABASE_URL in .env and vitest.config.ts.",
  );
}
