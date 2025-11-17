import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Joi from "joi";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ------------------ PARTS ------------------
const parts = {
  items: [
    { _id: 1,  name: "Intercooler",       brand: "Wagner Tuning",      category: "Engine",     image: "/images/intercooler.png",  price: 749 },
    { _id: 2,  name: "Downpipe",          brand: "VRSF",               category: "Engine",     image: "/images/downpipe.png",      price: 489 },
    { _id: 3,  name: "Intake",            brand: "Eventuri",           category: "Engine",     image: "/images/intake.png",        price: 1195 },
    { _id: 4,  name: "Chargepipe",        brand: "FTP",                category: "Engine",     image: "/images/chargepipe.png",    price: 249 },
    { _id: 5,  name: "Coilovers",         brand: "KW V3",              category: "Suspension", image: "/images/coilover.png",      price: 2599 },
    { _id: 6,  name: "Brake Pads",        brand: "Hawk HPS",           category: "Suspension", image: "/images/brakepads.png",     price: 189 },
    { _id: 7,  name: "Lowering Springs",  brand: "H&R Sport",          category: "Suspension", image: "/images/Lowering.png",      price: 329 },
    { _id: 8,  name: "Camber Arms",       brand: "SPC",                category: "Suspension", image: "/images/arms.png",          price: 259 },
    { _id: 9,  name: "Shift Knob",        brand: "BMW M Performance",  category: "Interior",   image: "/images/shiftknob.png",     price: 199 },
    { _id: 10, name: "Floor Mats",        brand: "BMW OEM",            category: "Interior",   image: "/images/floormats.png",     price: 129 }
  ]
};

// ------------------ BUILDS ------------------
const builds = [
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
    bg: "/images/540.png"
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
    bg: "/images/m5.png"
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
    bg: "/images/g80.png"
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
    bg: "/images/g82.png"
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
    bg: "/images/x5m.png"
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
    bg: "/images/g801.png"
  }
];

// ------------------ JOI SCHEMAS ------------------
const partSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  brand: Joi.string().min(2).max(100).required(),
  category: Joi.string().min(2).max(50).required(),
  image: Joi.string().min(2).max(200).required(),
  price: Joi.number().min(0).required(),
});

const buildSchema = Joi.object({
  car: Joi.string().min(2).max(100).required(),
  instagram: Joi.string().min(2).max(50).required(),
  mods: Joi.string().min(5).max(500).required(),
  image: Joi.string().uri().min(5).max(300).required(),
});

// ---------- ROUTES ----------
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

// PARTS
app.get("/parts", (req, res) => res.json(parts));

app.get("/parts/:id", (req, res) => {
  const item = parts.items.find((p) => String(p._id) === req.params.id);
  return item ? res.json(item) : res.status(404).json({ error: "Not found" });
});

app.post("/parts", (req, res) => {
  const { error, value } = partSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      ok: false,
      errors: error.details.map((d) => ({
        field: d.path[0],
        message: d.message,
      })),
    });
  }

  const nextId =
    parts.items.length > 0
      ? parts.items[parts.items.length - 1]._id + 1
      : 1;

  const newPart = { _id: nextId, ...value };
  parts.items.push(newPart);

  res.status(201).json({
    ok: true,
    item: newPart,
  });
});

// BUILDS
app.get("/builds", (req, res) => res.json(builds));

app.get("/builds/:id", (req, res) => {
  const item = builds.find((b) => b.id === req.params.id);
  return item ? res.json(item) : res.status(404).json({ error: "Not found" });
});

app.post("/builds", (req, res) => {
  const { error, value } = buildSchema.validate(req.body, { abortEarly: false });

  if (error) {
    return res.status(400).json({
      ok: false,
      errors: error.details.map((d) => ({
        field: d.path[0],
        message: d.message,
      })),
    });
  }

  const nextNum = builds.length + 1;
  const newId = `user-${nextNum}`;

  const newBuild = {
    id: newId,
    title: value.car,
    user: value.instagram,
    specs: [value.car],
    images: [{ src: value.image }],
    whp: 0,
    sixty130: null,
    createdAt: Date.now(),
    meta: value.mods,
    chips: [],
    tags: [],
    bg: value.image,
  };

  builds.push(newBuild);

  res.status(201).json({
    ok: true,
    item: newBuild,
  });
});

//  reset 
app.get("/dev/reset-builds", (req, res) => {
  const keep = builds.filter((b) => !String(b.id).startsWith("user-"));

  builds.length = 0;
  builds.push(...keep);

  res.json({
    ok: true,
    remaining: builds.length,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`bmDub API running on ${port}`));
