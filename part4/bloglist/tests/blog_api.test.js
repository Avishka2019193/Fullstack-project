const { test, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const config = require("../utils/config");
const Blog = require("../models/blog");
const User = require("../models/user");

const api = supertest(app);

const initialBlogs = [
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
  },
  {
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
    likes: 5,
  },
];

const tokenFor = (user) =>
  jwt.sign({ username: user.username, id: user._id.toString() }, config.SECRET);

let rootUser;
let token;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const passwordHash = await bcrypt.hash("sekret", 10);
  rootUser = await new User({ username: "root", passwordHash }).save();
  token = tokenFor(rootUser);

  await Blog.insertMany(
    initialBlogs.map((blog) => ({ ...blog, user: rootUser._id })),
  );
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("all blogs are returned", async () => {
  const response = await api.get("/api/blogs");

  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("blogs have an id property and no _id", async () => {
  const response = await api.get("/api/blogs");
  const blog = response.body[0];

  assert.ok(blog.id);
  assert.strictEqual(blog._id, undefined);
});

test("blogs include their creator", async () => {
  const response = await api.get("/api/blogs").expect(200);
  const blog = response.body[0];

  assert.strictEqual(blog.user.username, "root");
  assert.strictEqual(blog.user.passwordHash, undefined);
});

test("a valid blog can be added", async () => {
  const newBlog = {
    title: "Async/await simplifies making async calls",
    author: "Test Author",
    url: "https://example.com/async-await",
    likes: 3,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const response = await api.get("/api/blogs");
  const titles = response.body.map((blog) => blog.title);

  assert.strictEqual(response.body.length, initialBlogs.length + 1);
  assert.ok(titles.includes(newBlog.title));
});

test("a new blog is linked to the user who created it", async () => {
  const newBlog = {
    title: "Linked blog",
    author: "Test Author",
    url: "https://example.com/linked",
  };

  const response = await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201);

  assert.strictEqual(response.body.user, rootUser._id.toString());

  const user = await User.findById(rootUser._id);
  assert.ok(user.blogs.map(String).includes(response.body.id));
});

test("adding a blog fails with 401 if a token is not provided", async () => {
  const newBlog = {
    title: "Blog without a token",
    author: "Test Author",
    url: "https://example.com/no-token",
  };

  await api.post("/api/blogs").send(newBlog).expect(401);

  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("adding a blog fails with 401 if the token is invalid", async () => {
  const newBlog = {
    title: "Blog with a bad token",
    author: "Test Author",
    url: "https://example.com/bad-token",
  };

  await api
    .post("/api/blogs")
    .set("Authorization", "Bearer not-a-real-token")
    .send(newBlog)
    .expect(401);

  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("likes defaults to 0 when missing", async () => {
  const newBlog = {
    title: "Blog without likes",
    author: "Test Author",
    url: "https://example.com/no-likes",
  };

  const response = await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(201);

  assert.strictEqual(response.body.likes, 0);
});

test("blog without title is not added", async () => {
  const newBlog = {
    author: "Test Author",
    url: "https://example.com/no-title",
    likes: 1,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("blog without url is not added", async () => {
  const newBlog = {
    title: "Blog without url",
    author: "Test Author",
    likes: 1,
  };

  await api
    .post("/api/blogs")
    .set("Authorization", `Bearer ${token}`)
    .send(newBlog)
    .expect(400);

  const response = await api.get("/api/blogs");
  assert.strictEqual(response.body.length, initialBlogs.length);
});

test("a blog can be deleted by its creator", async () => {
  const blogsAtStart = (await api.get("/api/blogs")).body;
  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(204);

  const blogsAtEnd = (await api.get("/api/blogs")).body;
  const ids = blogsAtEnd.map((blog) => blog.id);

  assert.ok(!ids.includes(blogToDelete.id));
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1);
});

test("a blog cannot be deleted by another user", async () => {
  const passwordHash = await bcrypt.hash("sekret", 10);
  const otherUser = await new User({ username: "other", passwordHash }).save();

  const blogsAtStart = (await api.get("/api/blogs")).body;
  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set("Authorization", `Bearer ${tokenFor(otherUser)}`)
    .expect(403);

  const blogsAtEnd = (await api.get("/api/blogs")).body;
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length);
});

test("deleting a blog without a token returns 401", async () => {
  const blogsAtStart = (await api.get("/api/blogs")).body;

  await api.delete(`/api/blogs/${blogsAtStart[0].id}`).expect(401);

  const blogsAtEnd = (await api.get("/api/blogs")).body;
  assert.strictEqual(blogsAtEnd.length, initialBlogs.length);
});

test("deleting with a malformed id returns 400", async () => {
  await api
    .delete("/api/blogs/not-a-valid-id")
    .set("Authorization", `Bearer ${token}`)
    .expect(400);
});

test("a blog can be updated", async () => {
  const blogsAtStart = (await api.get("/api/blogs")).body;
  const blogToUpdate = blogsAtStart[0];

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ likes: blogToUpdate.likes + 1 })
    .expect(200);

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 1);
  assert.strictEqual(response.body.title, blogToUpdate.title);

  const blogsAtEnd = (await api.get("/api/blogs")).body;
  const updated = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id);
  assert.strictEqual(updated.likes, blogToUpdate.likes + 1);
});

test("updating a blog that does not exist returns 404", async () => {
  const nonExistingId = new mongoose.Types.ObjectId().toString();

  await api.put(`/api/blogs/${nonExistingId}`).send({ likes: 1 }).expect(404);
});

test("updating with a malformed id returns 400", async () => {
  await api.put("/api/blogs/not-a-valid-id").send({ likes: 1 }).expect(400);
});

after(async () => {
  await mongoose.connection.close();
});
