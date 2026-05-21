import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load service account safely
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../serviceAccountKey.json"),
    "utf-8"
  )
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;