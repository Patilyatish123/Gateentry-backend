const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: false,
        rejectUnauthorized: false, // important for self-signed certs
      },
    },
    define: {
      // Fixes the 'undefined define' error
      timestamps: true, // or false, depending on your preference
    },
  }
);

module.exports = sequelize;
