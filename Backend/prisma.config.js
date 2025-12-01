const { defineConfig } = require("@prisma/config");

module.exports = {
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
};
