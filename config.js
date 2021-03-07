const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'development';

const config = {
    development: {
        databaseUrl: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.r0av3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
        appUrl: `http://localhost:${port}`,
        port
    }
}

module.exports = config[env];