const { test, describe, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/user");
const helper = require("./test_helper");

const api = supertest(app);

describe("when there is initially one user in the database", () => {
  beforeEach(async () => {
    await User.deleteMany({});

    const passwordHash = await bcrypt.hash("sekret", 10);
    const user = new User({ username: "root", passwordHash });
    await user.save();
  });

  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "avishka",
      name: "Avishka",
      password: "salainen",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((user) => user.username);
    assert.ok(usernames.includes(newUser.username));
  });

  test("users are returned without the password hash", async () => {
    const response = await api.get("/api/users").expect(200);

    assert.strictEqual(response.body.length, 1);
    assert.strictEqual(response.body[0].passwordHash, undefined);
  });
  const expectInvalidUser = async (newUser, messagePart) => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);

    assert.ok(result.body.error.includes(messagePart));

    const usersAtEnd = await helper.usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  };

  test("creation fails when username is missing", async () => {
    await expectInvalidUser(
      { name: "No Username", password: "salainen" },
      "required",
    );
  });

  test("creation fails when password is missing", async () => {
    await expectInvalidUser(
      { username: "newuser", name: "No Password" },
      "required",
    );
  });

  test("creation fails when username is shorter than 3 characters", async () => {
    await expectInvalidUser(
      { username: "ab", password: "salainen" },
      "at least 3",
    );
  });

  test("creation fails when password is shorter than 3 characters", async () => {
    await expectInvalidUser(
      { username: "newuser", password: "ab" },
      "at least 3",
    );
  });

  test("creation fails when username is already taken", async () => {
    await expectInvalidUser(
      { username: "root", password: "salainen" },
      "unique",
    );
  });
});

after(async () => {
  await mongoose.connection.close();
});
