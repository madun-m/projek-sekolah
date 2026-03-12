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

// 2. Konfigurasi CORS (Satu untuk semua rute)
// 2. Konfigurasi CORS (Gunakan middleware ini di bagian atas)
app.use(cors({
  origin: true, 
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// TAMBAHKAN INI: Handler manual untuk OPTIONS tanpa menggunakan wildcard (*)
// Agar terhindar dari PathError di Node.js v24 namun tetap menjawab preflight
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.header('Origin') || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// 3. Endpoint Hapus Massal
app.post("/delete-users-bulk", async (req, res) => {
  const { uids } = req.body;
  console.log("Menerima permintaan hapus untuk UID:", uids);

  if (!uids || uids.length === 0) {
    return res.status(400).send({ error: "Daftar UID kosong" });
  }

  try {
    const result = await admin.auth().deleteUsers(uids);
    console.log("Berhasil menghapus:", result.successCount, "gagal:", result.failureCount);
    res.status(200).send({ 
      message: "Proses selesai", 
      successCount: result.successCount,
      failureCount: result.failureCount 
    });
  } catch (error) {
    console.error("Error Admin SDK:", error);
    res.status(500).send({ error: error.message });
  }
});

// Health Check (Halaman Utama)
app.get("/", (req, res) => {
  res.send("Backend SMPIT HQBS is Running ✅");
});

// 4. Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});