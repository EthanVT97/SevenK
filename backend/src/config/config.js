require('dotenv').config();

module.exports = {
    development: {
        username: 'root',
        password: '',
        database: 'sevenk',
        host: '127.0.0.1',
        dialect: 'mysql',
        port: 3306,
        logging: false
    },
    test: {
        username: 'root',
        password: '',
        database: 'sevenk_test',
        host: '127.0.0.1',
        dialect: 'mysql'
    },
    production: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: 'mysql'
    }
}; 