const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

let users = [];
let exercises = [];
let userIdCounter = 1;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/api/users", (req, res) => {
  const username = req.body.username;
  if (!username) return res.json({ error: "Username is required" });

  const newUser = {
    username,
    _id: userIdCounter.toString()
  };
  users.push(newUser);
  userIdCounter++;
  res.json(newUser);
});

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: "User not found" });

  const { description, duration, date } = req.body;
  if (!description || !duration) return res.json({ error: "Description and duration required" });

  const exerciseDate = date ? new Date(date) : new Date();

  const newExercise = {
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate.toDateString(),
    _id: user._id
  };
  exercises.push(newExercise);
  res.json(newExercise);
});

app.get("/api/users/:_id/logs", (req, res) => {
  const user = users.find(u => u._id === req.params._id);
  if (!user) return res.json({ error: "User not found" });

  let userLogs = exercises.filter(e => e._id === user._id);

  const from = req.query.from ? new Date(req.query.from) : null;
  const to = req.query.to ? new Date(req.query.to) : null;
  const limit = req.query.limit ? parseInt(req.query.limit) : null;

  if (from) userLogs = userLogs.filter(e => new Date(e.date) >= from);
  if (to) userLogs = userLogs.filter(e => new Date(e.date) <= to);
  if (limit) userLogs = userLogs.slice(0, limit);

  res.json({
    username: user.username,
    count: userLogs.length,
    _id: user._id,
    log: userLogs.map(e => ({
      description: e.description,
      duration: e.duration,
      date: e.date
    }))
  });
});

const PORT = 3300;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
