const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',     // Replace with your MySQL username
  password: '',     // Replace with your MySQL password
  database: 'fitfaat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convert pool to use promises
const promisePool = pool.promise();

// Export the pool for use in other files
module.exports = pool;