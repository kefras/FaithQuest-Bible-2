import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, query, collection, orderBy, limit, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, GameHistoryEntry } from '../types';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user already exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const newUser: UserProfile = {
        userId: user.uid,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || undefined,
        avatarSeed: user.uid,
        totalScore: 0,
        highScore: 0,
        gameHistory: [],
        categoryStats: {},
        progress: {
          beginner: 0,
          medium: 0,
          advance: 0
        },
        lastPlayed: new Date().toISOString()
      };
      await setDoc(userDocRef, newUser);
      return newUser;
    }
    
    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, { ...data, lastPlayed: new Date().toISOString() }, { merge: true });
};

export const recordGameHistory = async (userId: string, entry: GameHistoryEntry) => {
  const userDocRef = doc(db, 'users', userId);
  await updateDoc(userDocRef, {
    gameHistory: arrayUnion(entry),
    lastPlayed: new Date().toISOString()
  });
};

export const getLeaderboard = async () => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('highScore', 'desc'), limit(10));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as UserProfile);
};
