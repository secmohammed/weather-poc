import { Client } from 'pg';
import config from '../config';

export const createDatabaseIfDoesntExist = async () => {
  try {
    const client = new Client({
      user: config.database.username,
      password: config.database.password,
      host: config.database.host,
    });
    await client.connect();
    const res = await client.query(`SELECT COUNT(*) FROM pg_database WHERE datname ='${config.database.database}'`);
    if (res.rows[0].count == 0) {
      await client.query(`CREATE DATABASE ${config.database.database}`);
    }
    await client.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
export const dropDatabaseIfExists = async () => {
  try {
    const client = new Client({
      user: config.database.username,
      password: config.database.password,
      host: config.database.host,
    });
    await client.connect();
    const res = await client.query(`SELECT COUNT(*) FROM pg_database WHERE datname ='${config.database.database}'`);
    if (res.rows[0].count == 1) {
      await client.query(`DROP DATABASE ${config.database.database}`);
    }
    await client.end();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
