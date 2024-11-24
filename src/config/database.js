require('ts-node/register');

module.exports = {
    development: {
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: 'sevenk',
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql'
    }
}; 