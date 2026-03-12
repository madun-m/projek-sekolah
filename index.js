const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Fungsi Inisialisasi Aman
function initializeFirebase() {
  try {
    let serviceAccount;
    
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      console.log("Mencoba memuat Service Account dari Environment Variable...");
      const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      serviceAccount = JSON.parse(rawJson);
    } else {
      console.log("Environment Variable kosong, mencari file lokal...");
      serviceAccount = require("./serviceAccountKey.json");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin Berhasil Diinisialisasi");
  } catch (error) {
    console.error("❌ GAGAL INITIALIZE FIREBASE:");
    console.error(error.message);
    // Kita tidak gunakan process.exit agar server tetap 'up' untuk menunjukkan log
  }
}

initializeFirebase();

// 2. Middleware
app.use(cors()); // Gunakan cors simpel dulu untuk memastikan tidak ada error syntax
app.options('*', cors());
app.use(express.json());

// 3. Endpoint
app.post("/delete-users-bulk", async (req, res) => {
  try {
    const { uids } = req.body;
    if (!uids || uids.length === 0) return res.status(400).send({ error: "UID kosong" });

    const result = await admin.auth().deleteUsers(uids);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Health Check agar Railway tahu aplikasi hidup
app.get("/", (req, res) => res.send("Server Is Running ✅"));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server ready on port ${PORT}`);
});