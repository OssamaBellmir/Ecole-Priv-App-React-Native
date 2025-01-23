import * as React from "react";
import { Text, TouchableOpacity, Image } from "react-native";

import { auth, firestore } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

// GoogleSignin.configure();

function OAuthButton({ role }) {
  // const handleSignInWithGoogle = async () => {
  //   try {
  //     await GoogleSignin.hasPlayServices();
  //     const userInfo = await GoogleSignin.signIn();
  //     const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
  //     const result = await auth().signInWithCredential(googleCredential);
  //     const user = result.user;
  //     const userDocRef = doc(firestore, "users", user.uid);
  //     await setDoc(userDocRef, {
  //       uid: user.uid,
  //       email: user.email,
  //       role: role,
  //       phoneNumber: user.phoneNumber,
  //       photoUrl: user.photoURL,
  //       displayName: user.displayName,
  //     });
  //   } catch (error) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       console.log('User cancelled the Google sign-in process');
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       console.log('Google sign-in is already in progress');
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       console.log('Play Services not available or outdated');
  //     } else {
  //       console.error('Error signing in with Google:', error);
  //     }
  //   }
  // };

  return (
    <>
      <TouchableOpacity
        className="w-full bg-white py-2 rounded-lg flex-row items-center justify-center mb-2"
        // onPress={() => handleSignInWithGoogle()}
      >
        <Image
          source={require("../assets/images/google.png")}
          className="w-8 h-8"
        />
        <Text className="text-text/60 text-center font-medium text-sm ml-7">
          Continuer avec Google
        </Text>
      </TouchableOpacity>
      {/* {error && <Text>{error.message}</Text>} */}
    </>
  );
}

export default OAuthButton;
