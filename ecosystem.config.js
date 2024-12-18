require("dotenv").config();

module.exports = {
  apps: [
    {
      name: "backend",
      script: "/var/www/backend/index.ts",
      instances: 1,
      env: {
        DATABASE_URL: "mongodb://localhost/wingsfit",
        CORS_WHITELIST: "http://209.38.96.160",
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        NODE_ENV: "production",
      },
    },
  ],
};
