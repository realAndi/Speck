import { app } from "@/utils/firebase/firebase-config";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFunctions, httpsCallable } from "firebase/functions";

const auth = getAuth(app);
const storage = getStorage(app);
const functions = getFunctions(app);

export default async function signUp(email, password, firstName, lastName, base64ProfilePicture) {
    let result = null,
      error = null;
    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Pass the user data and base64 profile picture to the Cloud Function
      const onUserCreated = httpsCallable(functions, 'onUserCreated');
      await onUserCreated({
        uid: user.uid,
        email,
        firstName,
        lastName,
        base64ProfilePicture,
      });
  
      result = userCredential;
    } catch (e) {
      error = e;
    }
  
    return { result, error };
  }