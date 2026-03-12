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

// 2. Konfigurasi CORS (Hanya perlu ditulis SATU KALI)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://smpit-hqbs.web.app',
  'https://smpit-hqbs.firebaseapp.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Izinkan jika tanpa origin atau jika ada di daftar allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  }
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

// 4. Jalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});