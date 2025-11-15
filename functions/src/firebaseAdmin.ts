import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp(); // Uses the default service account of the project

export const adminDb = getFirestore(app);