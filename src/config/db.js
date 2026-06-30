import { Sequelize } from "sequelize";
import { env } from "./env.js";

const isLocal = env.databaseUrl.includes("localhost") || env.databaseUrl.includes("127.0.0.1");

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  dialectOptions: isLocal
    ? {}
    : {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
  logging: false
});
