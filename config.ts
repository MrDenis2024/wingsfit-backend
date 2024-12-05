import path from "path";
import { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();

const rootPath = __dirname;

const corsWhitelist = process.env.CORS_WHITELIST?.split(",") || [];

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || corsWhitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const config = {
  rootPath,
  publicPath: path.join(rootPath, "public"),
  corsOptions,
  database: process.env.DATABASE_URL,
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
};

export default config;
