const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// 1. Inisialisasi Firebase Admin
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

// 2. MIDDLEWARE PRIORITAS UTAMA
// Letakkan ini sebelum app.use(cors) untuk memotong jalur 502
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.header('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Tetap gunakan middleware cors sebagai cadangan
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// 3. Endpoint Hapus Massal
app.post("/delete-users-bulk", async (req, res) => {
  const { uids } = req.body;
  if (!uids || uids.length === 0) return res.status(400).send({ error: "UID kosong" });

  try {
    const result = await admin.auth().deleteUsers(uids);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.get("/", (req, res) => res.send("Backend SMPIT HQBS is Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});