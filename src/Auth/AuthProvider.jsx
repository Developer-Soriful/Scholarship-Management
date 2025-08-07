import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { GoogleAuthProvider } from "firebase/auth";
import { attachAuthInterceptor } from "../Axios/axiosSecure";
import { Auth } from "../firebase/Firebase";

export const AuthContext = createContext(null);
const AuthProvider = ({ children }) => {
  // all state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // create user state and authentication logic here
  const createUser = (photoURL, displayName, email, password) => {
    return createUserWithEmailAndPassword(Auth, email, password)
      .then((userCradiential) => {
        const user = userCradiential.user;
        return updateProfile(user, {
          photoURL: photoURL,
          displayName: displayName,
        })
      })
  };

  //   this function for user login
  const loginUser = (email, password) => {
    return signInWithEmailAndPassword(Auth, email, password);
  };
  // this is for google login
  const googleLogin = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(Auth, provider);
  };
  //   this function for user logout
  const logoutUser = () => {
    return signOut(Auth).then(() => setUser(null));
  };
  //   this function for observing user state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(Auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Attach interceptor when user is available
      if (currentUser) {
        console.log('AuthProvider: Attaching interceptor for user:', currentUser.email);
        attachAuthInterceptor(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  //   user information state
  const userInfo = {
    googleLogin,
    createUser,
    loginUser,
    logoutUser,
    user,
    loading,
  };
  return (
    <AuthContext.Provider value={userInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
