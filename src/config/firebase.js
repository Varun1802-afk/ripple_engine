import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";

// Production Firebase configuration for ripple-engine
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firebase Auth Helper Methods
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    let msg = error.message;
    if (error.code === 'auth/popup-closed-by-user') {
      msg = 'Google popup was closed before completing sign in';
    } else if (error.code === 'auth/cancelled-popup-request') {
      msg = 'Sign in process was cancelled';
    } else if (error.code === 'auth/operation-not-allowed') {
      msg = 'Google Sign-In is not enabled in Firebase Console (Build > Auth > Sign-in method)';
    }
    return { success: false, error: msg };
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    console.warn("SignIn failed, trying CreateAccount:", error.code);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const newResult = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: newResult.user };
      } catch (createErr) {
        let createMsg = createErr.message;
        if (createErr.code === 'auth/email-already-in-use') {
          createMsg = 'Incorrect password for existing account';
        } else if (createErr.code === 'auth/weak-password') {
          createMsg = 'Password should be at least 6 characters';
        }
        return { success: false, error: createMsg };
      }
    }
    return { success: false, error: error.message };
  }
};
