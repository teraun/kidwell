import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _kidwellPool: Pool | undefined;
}

export const pool =
  global._kidwellPool ||
  new Pool({
    host: process.env.PGHOST || "localhost",
    port: Number(process.env.PGPORT) || 5433,
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "root",
    database: process.env.PGDATABASE || "kidwell",
  });

if (process.env.NODE_ENV !== "production") {
  global._kidwellPool = pool;
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
