const { Client } = require('pg');
require('dotenv').config();

async function listTables() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('---START_TABLE_LIST---');
        res.rows.forEach(row => console.log(row.table_name));
        console.log('---END_TABLE_LIST---');
    } catch (err) {
        console.error('Failed to list tables:', err.message);
    } finally {
        await client.end();
    }
}

listTables();
