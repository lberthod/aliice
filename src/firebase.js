// Intégration Firebase — auth anonyme + synchro du profil dans Firestore.
// La config est lue via les variables d'environnement Vite (VITE_FIREBASE_*).
// Crée un fichier `.env.local` à la racine avec tes clés, par exemple :
//
//   VITE_FIREBASE_API_KEY=AIza...
//   VITE_FIREBASE_AUTH_DOMAIN=thaibabygame.firebaseapp.com
//   VITE_FIREBASE_PROJECT_ID=thaibabygame
//   VITE_FIREBASE_STORAGE_BUCKET=thaibabygame.appspot.com
//   VITE_FIREBASE_MESSAGING_SENDER_ID=...
//   VITE_FIREBASE_APP_ID=...
//
// Sans clé, l'app marche quand même (mode local uniquement).

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

export const firebaseEnabled = Boolean(config.apiKey && config.projectId)

let app = null
let auth = null
let db = null

if (firebaseEnabled) {
  try {
    app = initializeApp(config)
    auth = getAuth(app)
    db = getFirestore(app)
  } catch (e) {
    console.warn('[firebase] init failed:', e)
  }
}

/**
 * Connecte anonymement l'utilisateur et renvoie son UID.
 * Renvoie null si Firebase n'est pas configuré ou qu'il y a une erreur réseau.
 */
export async function signInAnon() {
  if (!auth) return null
  try {
    if (auth.currentUser) return auth.currentUser.uid
    const res = await signInAnonymously(auth)
    return res.user?.uid || null
  } catch (e) {
    console.warn('[firebase] anon sign-in failed:', e)
    return null
  }
}

/**
 * Observe les changements d'état d'auth. Renvoie une fonction de désinscription.
 */
export function watchAuth(cb) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, user => cb(user?.uid || null))
}

export async function loadProfile(uid) {
  if (!db || !uid) return null
  try {
    const snap = await getDoc(doc(db, 'users', uid))
    return snap.exists() ? snap.data() : null
  } catch (e) {
    console.warn('[firebase] loadProfile failed:', e)
    return null
  }
}

export async function saveProfile(uid, data) {
  if (!db || !uid) return
  try {
    await setDoc(
      doc(db, 'users', uid),
      { ...data, updatedAt: Date.now() },
      { merge: true }
    )
  } catch (e) {
    console.warn('[firebase] saveProfile failed:', e)
  }
}
