import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5433,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "root",
  database: process.env.PGDATABASE || "kidwell",
});

async function main() {
  console.log("Connecting to Postgres...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('student','parent','counsellor')),
      full_name TEXT NOT NULL,
      age INT,
      parent_id INT REFERENCES users(id),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS checkins (
      id SERIAL PRIMARY KEY,
      student_id INT NOT NULL REFERENCES users(id),
      mood INT NOT NULL,
      energy INT NOT NULL,
      sleep_hours NUMERIC(4,1) NOT NULL,
      pain_areas TEXT,
      wellbeing_score NUMERIC(5,2),
      summary TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  console.log("Tables ready.");

  // Reset demo data so seeding is idempotent
  await pool.query("DELETE FROM checkins;");
  await pool.query("DELETE FROM users;");
  await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1;");
  await pool.query("ALTER SEQUENCE checkins_id_seq RESTART WITH 1;");

  // Parent
  const parent = (
    await pool.query(
      `INSERT INTO users (username, password, role, full_name)
       VALUES ($1,$2,'parent',$3) RETURNING id`,
      ["parent", "parent", "Mrs. Alemu"]
    )
  ).rows[0];

  // Counsellor
  await pool.query(
    `INSERT INTO users (username, password, role, full_name)
     VALUES ($1,$2,'counsellor',$3)`,
    ["counsellor", "counsellor", "Mr. Bekele"]
  );

  // Student (Sara), linked to parent
  const student = (
    await pool.query(
      `INSERT INTO users (username, password, role, full_name, age, parent_id)
       VALUES ($1,$2,'student',$3,$4,$5) RETURNING id`,
      ["sara", "sara", "Sara", 10, parent.id]
    )
  ).rows[0];

  // Seed 5 days of low mood / poor sleep check-ins for Sara (for the demo)
  const seed = [
    { mood: 2, energy: 2, sleep: 5.5, days: 5, score: 38, sum: "Sara has had a tough week with low energy and short sleep." },
    { mood: 2, energy: 3, sleep: 6.0, days: 4, score: 45, sum: "Still feeling low, though energy was a little better today." },
    { mood: 1, energy: 2, sleep: 5.0, days: 3, score: 32, sum: "A hard day with very little rest and low mood." },
    { mood: 2, energy: 2, sleep: 5.5, days: 2, score: 39, sum: "Mood remains low and sleep is still short." },
    { mood: 2, energy: 3, sleep: 6.0, days: 1, score: 44, sum: "Slightly more energy, but still not sleeping enough." },
  ];

  for (const s of seed) {
    await pool.query(
      `INSERT INTO checkins (student_id, mood, energy, sleep_hours, pain_areas, wellbeing_score, summary, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now() - ($8 || ' days')::interval)`,
      [student.id, s.mood, s.energy, s.sleep, "", s.score, s.sum, s.days]
    );
  }

  console.log("Seed complete.");
  console.log("Demo accounts (username / password):");
  console.log("  student    -> sara / sara");
  console.log("  parent     -> parent / parent");
  console.log("  counsellor -> counsellor / counsellor");

  await pool.end();
}

main().catch((err) => {
  console.error("DB init failed:", err.message);
  process.exit(1);
});
