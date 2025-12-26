const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");

require("dotenv").config({ quiet: true });

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const MockSchema = new mongoose.Schema({
  method: { type: String, required: true },
  path: { type: String, required: true },
  statusCode: { type: Number, default: 200 },
  response: { type: mongoose.Schema.Types.Mixed },
});
const Mock = mongoose.model("Mock", MockSchema);
const app = express();

// Middleware
app.use(express.json());
app.use(morgan("combined")); // Logs requests to console

// --- Health Check ---
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

// --- Endpoints to Manage Mocks ---
app.post("/api/mocks", async (req, res) => {
  try {
    // Strip query parameters from path to ensure dynamic matching
    if (req.body.path && req.body.path.includes("?")) {
      req.body.path = req.body.path.split("?")[0];
    }

    const existingMock = await Mock.findOne({
      method: req.body.method,
      path: req.body.path,
    });
    if (existingMock) {
      return res.status(409).json({ error: "Mock already exists" });
    }

    const mock = await Mock.create(req.body);
    res.status(201).json(mock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/mocks", async (req, res) => {
  const mocks = await Mock.find();
  res.json(mocks);
});

app.put("/api/mocks/:id", async (req, res) => {
  try {
    // Strip query parameters from path to ensure dynamic matching
    if (req.body.path && req.body.path.includes("?")) {
      req.body.path = req.body.path.split("?")[0];
    }
    const mock = await Mock.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!mock) return res.status(404).json({ error: "Mock not found" });
    res.json(mock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/mocks/:id", async (req, res) => {
  await Mock.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// --- Dynamic Mock Handler ---
// This catches any request not handled above and checks the DB
app.all("*", async (req, res, next) => {
  try {
    const mock = await Mock.findOne({
      method: req.method.toUpperCase(),
      path: req.path,
    });

    if (mock) {
      return res.status(mock.statusCode).json(mock.response);
    }
    next(); // Not found in mocks, proceed to 404
  } catch (err) {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Mock API server running on port ${PORT}`);
});
