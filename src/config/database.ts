import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: "mysql",
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection established");
  })
  .catch((err) => {
    console.log("Connection failed", err);
  });

const db = { Sequelize, sequelize };

db.sequelize
  .sync({ alter: true })
  .then(() => {
    const models = sequelize.models;
    const modelNames = Object.keys(models);
    modelNames.forEach((modelName) => {
      const model = models[modelName];
      model.describe().then(() => {
        console.log(`Model "${modelName}" has been migrated.`);
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });

export default db;
