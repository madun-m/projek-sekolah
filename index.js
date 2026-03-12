const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
// const serviceAccount = require("./serviceAccountKey.json");


// Ubah bagian ini agar membaca dari Environment Variable
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : require("./serviceAccountKey.json"); // Tetap bisa jalan di localhost jika file ada

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors()); // Agar aplikasi Vue Bapak bisa memanggil API ini
app.use(express.json());

// Endpoint Bulk Delete yang Bapak tanyakan
app.post("/delete-users-bulk", async (req, res) => {
  const { uids } = req.body;
  console.log("Menerima permintaan hapus untuk UID:", uids); // Cek apakah data sampai di sini

  if (!uids || uids.length === 0) {
    return res.status(400).send({ error: "Daftar UID kosong" });
  }

  try {
    const result = await admin.auth().deleteUsers(uids);
    console.log("Hasil hapus massal:", result);
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

const cors = require('cors');

// Izinkan domain Firebase Bapak dan localhost (untuk uji coba)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://smpit-hqbs.web.app',
  'https://smpit-hqbs.firebaseapp.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // izinkan request tanpa origin (seperti mobile apps atau curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'Kebijakan CORS backend ini tidak mengizinkan akses dari origin tersebut.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
