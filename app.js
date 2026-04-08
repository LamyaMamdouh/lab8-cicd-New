const express = require('express');
const os = require('os');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 3000;

let db;

async function connectDB() {
  const url = process.env.DATABASE_URL;
  const match = url.match(/mysql:\/\/(\w+):(\w+)@([\w.-]+):(\d+)\/(\w+)/);
  db = await mysql.createConnection({
    host: match[3],
    user: match[1],
    password: match[2],
    port: match[4],
    database: match[5],
  });
  console.log('Connected to MySQL');
}

app.get('/', (req, res) => {
  res.json({
    app: 'CISC 886 Lab 8',
    mode: process.env.MODE || 'local',
    node: process.version,
    host: os.hostname(),
  });
});

app.get('/tasks', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM tasks');
  const grouped = rows.reduce((acc, task) => {
    acc[task.status] = acc[task.status] || [];
    acc[task.status].push(task);
    return acc;
  }, {});
  res.json(grouped);
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('--------------------------------------------------');
    console.log(`  CISC 886 Lab 8 — App started`);
    console.log(`  Port:  ${PORT}`);
    console.log(`  Host:  ${os.hostname()}`);
    console.log('--------------------------------------------------');
  });
});
