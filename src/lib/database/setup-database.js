#!/usr/bin/env node

const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Correct Supabase connection details for direct database access
// Note: The hostname format is different for direct Postgres connections vs API connections
const SUPABASE_PROJECT_ID = "raeateoobiztkzpppvas";
const DEFAULT_CONNECTION_STRING = `postgresql://postgres:[YOUR-PASSWORD]@${SUPABASE_PROJECT_ID}.supabase.co:5432/postgres`;

console.log("GigaVibe Database Setup");
console.log("========================");
console.log(
  "This script will reset your Supabase database and create a new schema specifically designed for GigaVibe."
);
console.log("WARNING: This will delete all existing data in the database!");
console.log("");

rl.question("Enter your Supabase database password: ", (password) => {
  // Replace [YOUR-PASSWORD] with the actual password
  const connectionString = DEFAULT_CONNECTION_STRING.replace(
    "[YOUR-PASSWORD]",
    password
  );

  console.log("\nConnecting to Supabase database...");

  // Path to the SQL schema file
  const schemaFilePath = path.join(__dirname, "new-supabase-schema.sql");

  // Check if schema file exists
  if (!fs.existsSync(schemaFilePath)) {
    console.error(
      "Error: Schema file not found. Make sure new-supabase-schema.sql exists in the database directory."
    );
    rl.close();
    return;
  }

  // Mask password in logs for security
  const maskedConnectionString = connectionString.replace(password, "*****");
  console.log(`Using connection: ${maskedConnectionString}`);

  // Command to execute the SQL file
  const command = `PGPASSWORD=${password} psql "${connectionString}" -f "${schemaFilePath}"`;

  console.log("Executing SQL schema...");

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.log("\nTroubleshooting:");
      console.log("1. Make sure you have PostgreSQL client (psql) installed");
      console.log("2. Verify your Supabase connection details:");
      console.log(`   - Host: ${SUPABASE_PROJECT_ID}.supabase.co`);
      console.log("   - Port: 5432");
      console.log("   - Database: postgres");
      console.log("   - Username: postgres");
      console.log(
        "3. Check if your IP is allowed in Supabase network settings"
      );
      console.log(
        "4. Try running the SQL script manually using the Supabase SQL editor"
      );
      rl.close();
      return;
    }

    if (stderr) {
      console.error(`Warning: ${stderr}`);
    }

    console.log(stdout);
    console.log("\nDatabase setup completed successfully!");
    console.log("The following tables have been created:");
    console.log("- users");
    console.log("- performances");
    console.log("- performance_metrics");
    console.log("- performance_coins");
    console.log("- viral_queue");
    console.log("- viral_thresholds (initialized with default values)");
    console.log("- analytics_events");
    console.log("- notification_preferences");
    console.log("- notifications");
    console.log(
      "\nYou can now use the DatabaseService to interact with your Supabase database."
    );

    rl.close();
  });
});
