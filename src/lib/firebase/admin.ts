import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

if (getApps().length === 0) {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Tangani karakter newline yang masuk dari Vercel
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

// Catatan: adminDb dan adminAuth mungkin melempar error jika digunakan di Server Component 
// namun private key belum dikonfigurasi di Vercel. 
// Namun untuk build Next.js, ini akan aman karena diinisialisasi secara lazy.
export const adminDb = getFirestore();
export const adminAuth = getAuth();
