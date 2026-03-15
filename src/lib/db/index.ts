import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function buildConnectionString() {
  const {
    CONNECTION_STRING,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_DB,
  } = process.env;

  if (CONNECTION_STRING) return CONNECTION_STRING;

  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_HOST || !POSTGRES_DB) {
    return undefined;
  }

  const port = POSTGRES_PORT ?? '5432';
  return `postgresql://${POSTGRES_USER}:${encodeURIComponent(POSTGRES_PASSWORD)}@${POSTGRES_HOST}:${port}/${POSTGRES_DB}`;
}

const connectionString = buildConnectionString();

// Disable prefetch as it is not supported for "transaction" pool mode
export const client = connectionString ? postgres(connectionString, { prepare: false }) : undefined;
export const db = client ? drizzle(client as any, { schema }) : undefined;
