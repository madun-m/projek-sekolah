const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// 1. Inisialisasi Firebase Admin
let serviceAccount;

// GANTILAH BAGIAN INI:
try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const jsonString = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
    serviceAccount = JSON.parse(jsonString);
    console.log("Service Account dimuat dari Environment Variable.");
  } else {
    // Gunakan require hanya jika sedang running di laptop (Localhost)
    serviceAccount = require("./serviceAccountKey.json");
    console.log("Service Account dimuat dari file lokal.");
  }
} catch (error) {
  console.error("EROR FATAL:");
  console.error("- Jika di Railway: Pastikan Variable FIREBASE_SERVICE_ACCOUNT sudah diisi JSON lengkap.");
  console.error("- Detail Eror:", error.message);
  process.exit(1); 
}

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

// Gunakan konfigurasi yang lebih sederhana tapi mencakup semuanya
app.use(cors({
  origin: function (origin, callback) {
    // Izinkan jika tanpa origin (untuk server-to-server) atau jika domain ada di daftar
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS Terblokir untuk domain:", origin); // Agar Bapak bisa pantau di Log Railway
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

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