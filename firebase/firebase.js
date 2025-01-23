import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";

// Configuration Firebase

const firebaseConfig = {
  apiKey: "AIzaSyAySG29kq43AxyGyJdzWl8_QZUBqq3lvIE",
  authDomain: "house-rental-cc663.firebaseapp.com",
  projectId: "house-rental-cc663",
  storageBucket: "house-rental-cc663.appspot.com",
  messagingSenderId: "367529687510",
  appId: "1:367529687510:web:c32ca38b4bbd3202634c77",
  measurementId: "G-LF2ZFBC2KW"
};
// Initialisation de Firebase
const initializeFirebase = () => {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
};

// Initialisation de l'application Firebase
const app = initializeFirebase();

// Initialisation de Firestore
const firestore = getFirestore(app);

// Initialisation de l'authentification avec persistance
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
  console.log("Firebase Auth initialized with persistence");
} catch (error) {
  console.error("Error initializing Firebase Auth:", error);
  auth = getAuth(app);
}

// Initialisation du stockage
const storage = getStorage(app);

// Export des modules
export { app, firestore, auth, storage };
