// Set the timezone to UTC for all tests. Without this configuration
// different machines (or CI runners) may produce Date objects in
// different local time zones when reading timestamps from Postgres. By
// explicitly setting the TZ environment variable, Node will parse
// timestamps consistently and tests that rely on date equality will
// behave the same everywhere.
process.env.TZ = 'UTC';