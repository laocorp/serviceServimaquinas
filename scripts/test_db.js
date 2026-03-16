const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    const connectionString = process.env.DATABASE_URL;
    console.log('Testing connection to:', connectionString.split('@')[1]); // Log host only for safety

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('Successfully connected to the database.');
        const res = await client.query('SELECT NOW()');
        console.log('Current Time:', res.rows[0].now);
        await client.end();
    } catch (err) {
        console.error('Connection error:', err.stack);
        process.exit(1);
    }
}

testConnection();
