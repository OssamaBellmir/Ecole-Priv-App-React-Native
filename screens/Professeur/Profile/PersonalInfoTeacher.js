import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { auth, firestore, storage } from "../../../firebase/firebase";
import { Avatar, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  ref, uploadBytes, getDownloadURL
} from "firebase/storage";
import Toast from "react-native-toast-message";
import { updateProfile, updateEmail } from "firebase/auth";

function PersonalInfoTeacher({ navigation }) {
  const user = auth.currentUser;
  const [email, setEmail] = React.useState("");
  const [photoURL, setPhotoURL] = React.useState("");
  const [nom, setNom] = React.useState("");
  const [prenom, setPrenom] = React.useState("");
  const [emailDisabled, setEmailDisabled] = React.useState(true);
  const [nomDisabled, setNomDisabled] = React.useState(true);
  const [prenomDisabled, setPrenomDisabled] = React.useState(true);
  const [newPhotoURL, setNewPhotoURL] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setEmail(userData.email);
          setPhotoURL(userData.photoURL || "");
          setNewPhotoURL(userData.photoURL || "");
          setNom(userData.nom || "");
          setPrenom(userData.prenom || "");
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setNewPhotoURL(result.assets[0].uri);
    }
  };

  const showToast = () => {
    Toast.show({
      type: "success",
      position: "bottom",
      text1: "Profile updated successfully",
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const handleUpdate = async () => {
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDataToUpdate = {
        email,
        nom,
        prenom,
      };

      if (newPhotoURL) {
        const fileName = "profilePic.jpg";
        const storageRef = ref(
          storage,
          `images/${user.uid}/profilePicTeacher/${fileName}`
        );
        const blob = await fetch(newPhotoURL).then((response) =>
          response.blob()
        );
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        userDataToUpdate.photoURL = url;
        updateProfile(user, {
          photoURL: url,
        });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      await updateDoc(userDocRef, userDataToUpdate);
      console.log("Profile updated successfully");
      showToast();
      setPhotoURL(newPhotoURL);
      navigation.navigate("ProfileTeacher");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View className="flex-1 items-center bg-background mx-6">
      <Text className="text-2xl font-bold my-12">
        Informations Personnelles
      </Text>
      {!loading && (
        <TouchableOpacity onPress={pickImage}>
          {photoURL ? (
            <Avatar.Image size={100} source={{ uri: newPhotoURL }} />
          ) : (
            <Avatar.Icon size={100} icon="account" />
          )}
        </TouchableOpacity>
      )}
      <View className="w-full items-center mt-6">
        {!loading && (
          <>
            <TextInput
              label="Email"
              className="w-full bg-blue-100 my-2"
              value={email}
              onChangeText={(text) => setEmail(text)}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={emailDisabled ? "pencil" : "check-bold"}
                  onPress={() => setEmailDisabled(!emailDisabled)}
                />
              }
              disabled={emailDisabled}
            />
            <TextInput
              label="Nom"
              className="w-full bg-blue-100 my-2"
              value={nom}
              onChangeText={(text) => setNom(text)}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={nomDisabled ? "pencil" : "check-bold"}
                  onPress={() => setNomDisabled(!nomDisabled)}
                />
              }
              disabled={nomDisabled}
            />
            <TextInput
              label="Prénom"
              className="w-full bg-blue-100 my-2"
              value={prenom}
              onChangeText={(text) => setPrenom(text)}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={prenomDisabled ? "pencil" : "check-bold"}
                  onPress={() => setPrenomDisabled(!prenomDisabled)}
                />
              }
              disabled={prenomDisabled}
            />
            <TouchableOpacity
              className="w-full px-5 py-5 rounded-lg bg-text mb-2 flex-row items-center justify-center mt-6"
              onPress={handleUpdate}
            >
              <Text className="ml-2 text-white font-semibold">
                Confirmer Modifications
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

export default PersonalInfoTeacher;
