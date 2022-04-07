const path = require("path");
require("dotenv").config({path: path.join(__dirname, "..", ".env")});

const {env} = process;

module.exports = {
    DB_URL: env.DB_URL,
    PORT: env.PORT,
    SECRET_WORD: env.SECRET_WORD,
}