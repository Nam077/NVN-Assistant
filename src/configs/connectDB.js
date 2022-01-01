import mysql from 'mysql2/promise';

const pool = mysql.createPool({ host: 'sql6.freesqldatabase.com', user: 'sql6462418', password: '41HImTSnVF', database: 'sql6462418' });

export default pool;