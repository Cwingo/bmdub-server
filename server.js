import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Joi from "joi";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// JOI VALIDATION
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
  image: Joi.string().min(2).max(300).optional().allow(""),
  whp: Joi.number().min(0).optional(),
  sixty130: Joi.number().min(0).optional(),
});

// MONGOOSE SCHEMAS
const partDbSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  image: String,
  price: Number,
});

const Part = mongoose.model("Part", partDbSchema);

const buildDbSchema = new mongoose.Schema({
  title: String,
  car: String,
  instagram: String,
  user: String,
  mods: String,
  meta: String,
  image: String,
  bg: String,
  whp: { type: Number, default: 0 },
  sixty130: { type: Number, default: null },
  chips: [String],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
});

const Build = mongoose.model("Build", buildDbSchema);

// HOME ROUTE
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// PARTS ROUTES
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

// BUILDS ROUTES
app.get("/builds", async (req, res) => {
  try {
    const docs = await Build.find().sort({ createdAt: -1 });

    const builds = docs.map((doc) => ({
      id: doc._id.toString(),
      title: doc.title || doc.car || "",
      user: doc.user || doc.instagram || "",
      specs: [doc.car || doc.title || ""],
      image: doc.image || "",
      images: doc.image ? [{ src: doc.image }] : [],
      whp: typeof doc.whp === "number" ? doc.whp : 0,
      sixty130:
        typeof doc.sixty130 === "number" ? doc.sixty130 : null,
      createdAt: doc.createdAt ? doc.createdAt.getTime() : Date.now(),
      meta: doc.meta || doc.mods || "",
      chips: Array.isArray(doc.chips) ? doc.chips : [],
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      bg: doc.bg || doc.image || "",
    }));

    res.json(builds);
  } catch {
    res.status(500).json({ error: "Failed to fetch builds" });
  }
});

app.get("/builds/:id", async (req, res) => {
  try {
    const doc = await Build.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json({
      id: doc._id.toString(),
      title: doc.title || doc.car || "",
      user: doc.user || doc.instagram || "",
      specs: [doc.car || doc.title || ""],
      image: doc.image || "",
      images: doc.image ? [{ src: doc.image }] : [],
      whp: typeof doc.whp === "number" ? doc.whp : 0,
      sixty130:
        typeof doc.sixty130 === "number" ? doc.sixty130 : null,
      createdAt: doc.createdAt ? doc.createdAt.getTime() : Date.now(),
      meta: doc.meta || doc.mods || "",
      chips: Array.isArray(doc.chips) ? doc.chips : [],
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      bg: doc.bg || doc.image || "",
    });
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
    const saved = await new Build(value).save();

    res.status(201).json({
      ok: true,
      item: {
        id: saved._id.toString(),
        title: saved.title || saved.car || "",
        user: saved.user || saved.instagram || "",
        specs: [saved.car || saved.title || ""],
        image: saved.image || "",
        images: saved.image ? [{ src: saved.image }] : [],
        whp: typeof saved.whp === "number" ? saved.whp : 0,
        sixty130:
          typeof saved.sixty130 === "number" ? saved.sixty130 : null,
        createdAt: saved.createdAt ? saved.createdAt.getTime() : Date.now(),
        meta: saved.meta || saved.mods || "",
        chips: Array.isArray(saved.chips) ? saved.chips : [],
        tags: Array.isArray(saved.tags) ? saved.tags : [],
        bg: saved.bg || saved.image || "",
      },
    });
  } catch {
    res.status(500).json({ ok: false, error: "Failed to create build" });
  }
});

app.put("/builds/:id", async (req, res) => {
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
    const updated = await Build.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });

    if (!updated) return res.status(404).json({ ok: false, error: "Not found" });

    res.json({
      ok: true,
      item: {
        id: updated._id.toString(),
        title: updated.title || updated.car || "",
        user: updated.user || updated.instagram || "",
        specs: [updated.car || updated.title || ""],
        image: updated.image || "",
        images: updated.image ? [{ src: updated.image }] : [],
        whp: typeof updated.whp === "number" ? updated.whp : 0,
        sixty130:
          typeof updated.sixty130 === "number"
            ? updated.sixty130
            : null,
        createdAt: updated.createdAt
          ? updated.createdAt.getTime()
          : Date.now(),
        meta: updated.meta || updated.mods || "",
        chips: Array.isArray(updated.chips) ? updated.chips : [],
        tags: Array.isArray(updated.tags) ? updated.tags : [],
        bg: updated.bg || updated.image || "",
      },
    });
  } catch {
    res.status(400).json({ ok: false, error: "Invalid ID or update error" });
  }
});

app.delete("/builds/:id", async (req, res) => {
  try {
    const deleted = await Build.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ ok: false, error: "Not found" });

    res.json({
      ok: true,
      item: {
        id: deleted._id.toString(),
        title: deleted.title || deleted.car || "",
        user: deleted.user || deleted.instagram || "",
        specs: [deleted.car || deleted.title || ""],
        image: deleted.image || "",
        images: deleted.image ? [{ src: deleted.image }] : [],
        whp: typeof deleted.whp === "number" ? deleted.whp : 0,
        sixty130:
          typeof deleted.sixty130 === "number"
            ? deleted.sixty130
            : null,
        createdAt: deleted.createdAt
          ? deleted.createdAt.getTime()
          : Date.now(),
        meta: deleted.meta || deleted.mods || "",
        chips: Array.isArray(deleted.chips) ? deleted.chips : [],
        tags: Array.isArray(deleted.tags) ? deleted.tags : [],
        bg: deleted.bg || deleted.image || "",
      },
    });
  } catch {
    res.status(400).json({ ok: false, error: "Invalid ID" });
  }
});

// SERVER + MONGO CONNECTION
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => console.log(`bmDub API running on ${port}`));
  })
  .catch((err) => console.error("MongoDB connection error:", err));
