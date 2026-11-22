const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const config = require("./utils/config");
const express = require("express");
const mongoose = require("mongoose");
const blogsRouter = require("./controllers/blogs");
const middleware = require("./utils/middleware");
const logger = require("./utils/logger");

const app = express();

mongoose
  .connect(config.MONGODB_URI, { family: 4 })
  .then(() => logger.info("connected to MongoDB"))
  .catch((error) =>
    logger.error("error connecting to MongoDB:", error.message),
  );

app.use(express.json());
app.use(middleware.requestLogger);

app.use("/api/blogs", blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
