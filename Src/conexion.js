import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'diederich',
  database: 'CHAMPIONS_data',
  password: 'Guate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;

