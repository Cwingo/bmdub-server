// imports
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Joi from "joi";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// joi schemas
const partValidationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  brand: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(50).required(),
  image: Joi.string().min(2).max(200).required(),
  price: Joi.number().min(0).required(),
});

const buildValidationSchema = Joi.object({
  car: Joi.string().min(2).max(100).required(),
  instagram: Joi.string().min(2).max(50).required(),
  mods: Joi.string().min(5).max(500).required(),
  image: Joi.string().allow("").min(0),
});

// mongoose schemas
const partDbSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  image: String,
  price: Number,
});

const buildDbSchema = new mongoose.Schema({
  car: String,
  instagram: String,
  mods: String,
  image: String,
  createdAt: { type: Date, default: Date.now },
});

// models
const Part = mongoose.model("Part", partDbSchema);
const Build = mongoose.model("Build", buildDbSchema);

// root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// parts
app.get("/parts", async (req, res) => {
  try {
    const items = await Part.find().sort({ _id: 1 });
    res.json({ items });
  } catch {
    res.status(500).json({ error: "Failed to fetch parts" });
  }
});

app.get("/parts/:id", async (req, res) => {
  try {
    const item = await Part.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

app.post("/parts", async (req, res) => {
  const { error, value } = partValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      errors: error.details.map((d) => ({
        field: d.path[0],
        message: d.message,
      })),
    });
  }

  try {
    const saved = await new Part(value).save();
    res.status(201).json({ ok: true, item: saved });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to create part" });
  }
});

app.put("/parts/:id", async (req, res) => {
  const { error, value } = partValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      errors: error.details.map((d) => ({
        field: d.path[0],
        message: d.message,
      })),
    });
  }

  try {
    const updated = await Part.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, item: updated });
  } catch {
    res.status(400).json({ ok: false, error: "Invalid ID or update error" });
  }
});

app.delete("/parts/:id", async (req, res) => {
  try {
    const deleted = await Part.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ ok: false, error: "Not found" });
    res.json({ ok: true, item: deleted });
  } catch {
    res.status(400).json({ ok: false, error: "Invalid ID" });
  }
});

// builds
app.get("/builds", async (req, res) => {
  let docs = [];
  try {
    docs = await Build.find().sort({ createdAt: -1 }).lean();
  } catch (err) {
    console.error("GET /builds mongo error:", err);
    docs = [];
  }

  const builds = (docs || []).map((doc) => ({
    id: doc._id.toString(),
    title: doc.car,
    user: doc.instagram,
    specs: [doc.car],
    images: doc.image ? [{ src: doc.image }] : [],
    whp: 0,
    sixty130: null,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt).getTime()
      : Date.now(),
    meta: doc.mods,
    chips: [],
    tags: [],
    bg: doc.image || "",
  }));

  return res.json(builds);
});

app.get("/builds/:id", async (req, res) => {
  try {
    const doc = await Build.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });

    const build = {
      id: doc._id.toString(),
      title: doc.car,
      user: doc.instagram,
      specs: [doc.car],
      images: doc.image ? [{ src: doc.image }] : [],
      whp: 0,
      sixty130: null,
      createdAt: doc.createdAt
        ? new Date(doc.createdAt).getTime()
        : Date.now(),
      meta: doc.mods,
      chips: [],
      tags: [],
      bg: doc.image || "",
    };

    res.json(build);
  } catch {
    res.status(400).json({ error: "Invalid ID" });
  }
});

app.post("/builds", async (req, res) => {
  const { error, value } = buildValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      errors: error.details.map((d) => ({
        field: d.path[0],
        message: d.message,
      })),
    });
  }

  try {
    const saved = await new Build({
      car: value.car,
      instagram: value.instagram,
      mods: value.mods,
      image: value.image || "",
    }).save();

    const build = {
      id: saved._id.toString(),
      title: saved.car,
      user: saved.instagram,
      specs: [saved.car],
      images: saved.image ? [{ src: saved.image }] : [],
      whp: 0,
      sixty130: null,
      createdAt: saved.createdAt.getTime(),
      meta: saved.mods,
      chips: [],
      tags: [],
      bg: saved.image || "",
    };

    res.status(201).json({ ok: true, item: build });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to create build" });
  }
});

app.delete("/builds/:id", async (req, res) => {
  try {
    const deleted = await Build.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ ok: false, error: "Not found" });

    const build = {
      id: deleted._id.toString(),
      title: deleted.car,
      user: deleted.instagram,
      specs: [deleted.car],
      images: deleted.image ? [{ src: deleted.image }] : [],
      whp: 0,
      sixty130: null,
      createdAt: deleted.createdAt.getTime(),
      meta: deleted.mods,
      chips: [],
      tags: [],
      bg: deleted.image || "",
    };

    res.json({ ok: true, item: build });
  } catch {
    res.status(400).json({ ok: false, error: "Invalid ID" });
  }
});
// debug
app.get("/debug-builds-test", (req, res) => {
  res.json({ route: "new builds route is running" });
});

// start
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`bmDub API running on ${port}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
