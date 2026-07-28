import admin from "firebase-admin";
import fs from "node:fs";

const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT ||
  "./serviceAccountKey.json";

console.log("Firebase service-account path:", serviceAccountPath);

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;