import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Pass the connection string directly to drizzle()
export const db = drizzle(process.env.DATABASE_URL);