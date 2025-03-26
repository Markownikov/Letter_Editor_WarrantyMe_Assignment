import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { auth } from '../utils/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [googleAccessToken, setGoogleAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  function googleSignIn() {
    const provider = new GoogleAuthProvider();
    // Add scopes for Google Drive API
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    return signInWithPopup(auth, provider)
      .then((result) => {
        // Get Google Access Token for Drive API
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        setGoogleAccessToken(accessToken);
        
        // Store the access token in localStorage for persistence
        localStorage.setItem('googleAccessToken', accessToken);
        
        return result;
      });
  }

  function logOut() {
    setGoogleAccessToken(null);
    localStorage.removeItem('googleAccessToken');
    localStorage.removeItem('authToken');
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const token = await user.getIdToken();
        setUserToken(token);
        localStorage.setItem('authToken', token);
        
        // Recover the Google access token from localStorage if available
        const savedAccessToken = localStorage.getItem('googleAccessToken');
        if (savedAccessToken && !googleAccessToken) {
          setGoogleAccessToken(savedAccessToken);
        }
      } else {
        setUserToken(null);
        setGoogleAccessToken(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('googleAccessToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [googleAccessToken]);

  const value = {
    currentUser,
    userToken,
    googleAccessToken,
    googleSignIn,
    logOut,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
