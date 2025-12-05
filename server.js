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

// Static files
app.use(express.static(path.join(__dirname, "public")));

//  JOI SCHEMAS 
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
image: Joi.string().uri().min(5).max(300).optional().allow(""),
});

//  MONGOOSE SCHEMAS / MODELS 
const partDbSchema = new mongoose.Schema({
name: { type: String, required: true },
brand: { type: String, required: true },
category: { type: String, required: true },
image: { type: String, required: true }, // image URL (required)
price: { type: Number, required: true, min: 0 },
});

const Part = mongoose.model("Part", partDbSchema);

const buildDbSchema = new mongoose.Schema({
car: { type: String, required: true },
instagram: { type: String, required: true },
mods: { type: String, required: true },
image: { type: String, default: "" },
createdAt: { type: Date, default: Date.now },
});

const Build = mongoose.model("Build", buildDbSchema);

//  STATIC BUILDS (DEMO) 
const staticBuilds = [
{
id: "g30-540i",
title: "G30 540i • E50 • Stage 2+",
user: "@stealthyg30",
specs: ["B58", "xDrive", "Pure800", "XHP", "E50"],
images: [{ src: "/images/540.png" }],
whp: 585,
sixty130: 8.9,
createdAt: 1730515200000,
meta: "B58 • xDrive • Pure800 • XHP",
chips: ["E50", "Daily"],
tags: ["B58", "E50", "Daily"],
bg: "/images/540.png",
},
{
id: "f90-m5",
title: "F90 M5 • E30 • Custom",
user: "f90_king on instaram",
specs: ["S63", "AWD", "Intakes", "Downpipes", "E30"],
images: [{ src: "/images/m5.png" }],
whp: 710,
sixty130: 7.2,
createdAt: 1730957200000,
meta: "S63 • AWD • Intakes • Downpipes",
chips: ["Drag", "E30"],
tags: ["S63", "E30", "Track"],
bg: "/images/m5.png",
},
{
id: "g80-m3",
title: "G80 M3 • E50 • Custom",
user: "@g80lennin",
specs: ["S58", "xDrive", "Intakes", "E50"],
images: [{ src: "/images/g80.png" }],
whp: 590,
sixty130: 7.8,
createdAt: 1730179200000,
meta: "S58 • xDrive • Intakes • OTS Map",
chips: ["E50", "Street"],
tags: ["S58", "E50", "Daily"],
bg: "/images/g80.png",
},
{
id: "g82-m4",
title: "G82 M4 • E50 • Street",
user: "@g82.sejfo",
specs: ["S58", "RWD", "Downpipes", "E50"],
images: [{ src: "/images/g82.png" }],
whp: 610,
sixty130: 7.4,
createdAt: 1731280000000,
meta: "S58 • RWD • Downpipes • E50",
chips: ["E50", "Street"],
tags: ["S58", "E50", "Daily"],
bg: "/images/g82.png",
},
{
id: "f95-x5m",
title: "F95 X5M • 93 • Stage 1",
user: "@mr__x5m",
specs: ["S63", "AWD", "Stage 1 Tune", "93"],
images: [{ src: "/images/x5m.png" }],
whp: 630,
sixty130: 8.2,
createdAt: 1731366400000,
meta: "S63 • AWD • 93 • Stage 1",
chips: ["93", "Daily"],
tags: ["S63", "93", "Daily"],
bg: "/images/x5m.png",
},
{
id: "g80-m3-green",
title: "G80 M3 • E30 • Track",
user: "@g80green",
specs: ["S58", "xDrive", "E30", "Tune"],
images: [{ src: "/images/g801.png" }],
whp: 600,
sixty130: 7.6,
createdAt: 1731452800000,
meta: "S58 • xDrive • Track Setup",
chips: ["E30", "Track"],
tags: ["S58", "E30", "Track"],
bg: "/images/g801.png",
},
];

//  ROOT ROUTE 
app.get("/", (req, res) =>
res.sendFile(path.join(__dirname, "public", "index.html"))
);

//  PARTS ROUTES (Mongo) 
app.get("/parts", async (req, res) => {
try {
const items = await Part.find().sort({ _id: 1 });
res.json({ items });
} catch (err) {
console.error("GET /parts error:", err);
res.status(500).json({ error: "Failed to fetch parts" });
}
});

app.get("/parts/:id", async (req, res) => {
try {
const item = await Part.findById(req.params.id);
if (!item) {
return res.status(404).json({ error: "Not found" });
}
res.json(item);
} catch (err) {
console.error("GET /parts/:id error:", err);
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
const newPart = new Part(value);
const saved = await newPart.save();
res.status(201).json({
ok: true,
item: saved,
});
} catch (err) {
console.error("POST /parts error:", err);
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

```
if (!updated) {
  return res.status(404).json({ ok: false, error: "Not found" });
}

res.status(200).json({
  ok: true,
  item: updated,
});
```

} catch (err) {
console.error("PUT /parts/:id error:", err);
res.status(400).json({ ok: false, error: "Invalid ID or update error" });
}
});

app.delete("/parts/:id", async (req, res) => {
try {
const deleted = await Part.findByIdAndDelete(req.params.id);

```
if (!deleted) {
  return res.status(404).json({ ok: false, error: "Not found" });
}

res.status(200).json({
  ok: true,
  item: deleted,
});
```

} catch (err) {
console.error("DELETE /parts/:id error:", err);
res.status(400).json({ ok: false, error: "Invalid ID" });
}
});

//  BUILDS ROUTES
app.get("/builds", async (req, res) => {
try {
const userBuildDocs = await Build.find().sort({ createdAt: 1 });

```
const userBuilds = userBuildDocs.map((doc) => ({
  id: doc._id.toString(),
  title: doc.car,
  user: doc.instagram,
  specs: [doc.car],
  images: doc.image ? [{ src: doc.image }] : [],
  whp: 0,
  sixty130: null,
  createdAt: doc.createdAt.getTime(),
  meta: doc.mods,
  chips: [],
  tags: [],
  bg: doc.image || "",
}));

res.json([...staticBuilds, ...userBuilds]);
```

} catch (err) {
console.error("GET /builds error:", err);
res.status(500).json({ error: "Failed to fetch builds" });
}
});

app.get("/builds/:id", async (req, res) => {
try {
// Check static builds first
const staticBuild = staticBuilds.find((b) => b.id === req.params.id);
if (staticBuild) {
return res.json(staticBuild);
}

```
// Then user builds in Mongo
const doc = await Build.findById(req.params.id);
if (!doc) {
  return res.status(404).json({ error: "Not found" });
}

const build = {
  id: doc._id.toString(),
  title: doc.car,
  user: doc.instagram,
  specs: [doc.car],
  images: doc.image ? [{ src: doc.image }] : [],
  whp: 0,
  sixty130: null,
  createdAt: doc.createdAt.getTime(),
  meta: doc.mods,
  chips: [],
  tags: [],
  bg: doc.image || "",
};

res.json(build);
```

} catch (err) {
console.error("GET /builds/:id error:", err);
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

const img =
value.image && value.image.trim() !== "" ? value.image.trim() : "";

try {
const newBuildDoc = new Build({
car: value.car,
instagram: value.instagram,
mods: value.mods,
image: img,
});

```
const saved = await newBuildDoc.save();

const newBuild = {
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

res.status(201).json({
  ok: true,
  item: newBuild,
});
```

} catch (err) {
console.error("POST /builds error:", err);
res.status(500).json({ ok: false, error: "Failed to create build" });
}
});

app.put("/builds/:id", async (req, res) => {
// Don't allow editing static builds by id
const staticBuild = staticBuilds.find((b) => b.id === req.params.id);
if (staticBuild) {
return res
.status(400)
.json({ ok: false, error: "Static demo builds cannot be edited" });
}

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

const img =
value.image && value.image.trim() !== "" ? value.image.trim() : "";

try {
const updatedDoc = await Build.findByIdAndUpdate(
req.params.id,
{
car: value.car,
instagram: value.instagram,
mods: value.mods,
image: img,
},
{ new: true, runValidators: true }
);

```
if (!updatedDoc) {
  return res.status(404).json({ ok: false, error: "Not found" });
}

const updatedBuild = {
  id: updatedDoc._id.toString(),
  title: updatedDoc.car,
  user: updatedDoc.instagram,
  specs: [updatedDoc.car],
  images: updatedDoc.image ? [{ src: updatedDoc.image }] : [],
  whp: 0,
  sixty130: null,
  createdAt: updatedDoc.createdAt.getTime(),
  meta: updatedDoc.mods,
  chips: [],
  tags: [],
  bg: updatedDoc.image || "",
};

res.status(200).json({
  ok: true,
  item: updatedBuild,
});
```

} catch (err) {
console.error("PUT /builds/:id error:", err);
res.status(400).json({ ok: false, error: "Invalid ID or update error" });
}
});

app.delete("/builds/:id", async (req, res) => {
// Don't allow deleting static builds
const staticBuild = staticBuilds.find((b) => b.id === req.params.id);
if (staticBuild) {
return res
.status(400)
.json({ ok: false, error: "Static demo builds cannot be deleted" });
}

try {
const deletedDoc = await Build.findByIdAndDelete(req.params.id);

```
if (!deletedDoc) {
  return res.status(404).json({ ok: false, error: "Not found" });
}

const deleted = {
  id: deletedDoc._id.toString(),
  title: deletedDoc.car,
  user: deletedDoc.instagram,
  specs: [deletedDoc.car],
  images: deletedDoc.image ? [{ src: deletedDoc.image }] : [],
  whp: 0,
  sixty130: null,
  createdAt: deletedDoc.createdAt.getTime(),
  meta: deletedDoc.mods,
  chips: [],
  tags: [],
  bg: deletedDoc.image || "",
};

res.status(200).json({
  ok: true,
  item: deleted,
});
```

} catch (err) {
console.error("DELETE /builds/:id error:", err);
res.status(400).json({ ok: false, error: "Invalid ID" });
}
});

app.get("/dev/reset-builds", async (req, res) => {
try {
await Build.deleteMany({});
res.json({
ok: true,
remaining: staticBuilds.length,
});
} catch (err) {
console.error("GET /dev/reset-builds error:", err);
res.status(500).json({ ok: false, error: "Failed to reset builds" });
}
});

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
