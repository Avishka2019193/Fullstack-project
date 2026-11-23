const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");

const api = supertest(app);

describe("login", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    await new User({ username: "root", name: "Root", passwordHash }).save();
  });

  test("succeeds with correct credentials and returns a token", async () => {
    const response = await api
      .post("/api/login")
      .send({ username: "root", password: "sekret" })
      .expect(200);

    assert.ok(response.body.token);
    assert.strictEqual(response.body.username, "root");
  });

  test("fails with a wrong password", async () => {
    const response = await api
      .post("/api/login")
      .send({ username: "root", password: "wrong" })
      .expect(401);

    assert.strictEqual(response.body.error, "invalid username or password");
  });

  test("fails with an unknown username", async () => {
    await api
      .post("/api/login")
      .send({ username: "nobody", password: "sekret" })
      .expect(401);
  });

  test("fails when username or password is missing", async () => {
    await api.post("/api/login").send({ username: "root" }).expect(400);
  });
});

after(async () => {
  await mongoose.connection.close();
});
