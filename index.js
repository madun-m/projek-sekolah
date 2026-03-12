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

// 2. Konfigurasi CORS - Letakkan PALING ATAS
app.use(cors({
  origin: true, // Mengizinkan semua origin (aman untuk Railway)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

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
    console.log("Berhasil:", result.successCount, "Gagal:", result.failureCount);
    res.status(200).send({ 
      successCount: result.successCount,
      failureCount: result.failureCount 
    });
  } catch (error) {
    console.error("Error Admin SDK:", error);
    res.status(500).send({ error: error.message });
  }
});

// Root handler untuk cek status (Health Check)
app.get("/", (req, res) => {
  res.status(200).send("Backend SMPIT HQBS is Running");
});

// 4. Jalankan Server - Pastikan 0.0.0.0 agar bisa diakses luar
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});