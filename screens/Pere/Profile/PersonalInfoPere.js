import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { auth, firestore, storage } from "../../../firebase/firebase";
import { Avatar, TextInput } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import Toast from "react-native-toast-message";
import {
  updateProfile,
  updateEmail,
} from "firebase/auth";

function PersonalInfoPere({ navigation }) {
  const user = auth.currentUser;
  const [name, setName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [birthdate, setBirthdate] = React.useState("");
  const [classId, setClassId] = React.useState("");
  const [className, setClassName] = React.useState("");
  const [photoURL, setPhotoURL] = React.useState("");
  const [disabled, setDisabled] = React.useState(true);
  const [newPhotoURL, setNewPhotoURL] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setName(userData.name);
          setLastName(userData.lastName);
          setEmail(userData.email);
          setBirthdate(userData.birthdate);
          setClassId(userData.classId);
          setClassName(userData.className);
          setPhotoURL(userData.photoURL || "");
          setNewPhotoURL(userData.photoURL || "");
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
        name,
        lastName,
        email,
      };

      if (newPhotoURL) {
        const fileName = "profilePic.jpg";
        const storageRef = ref(
          storage,
          `images/${user.uid}/profilePic/${fileName}`
        );
        const blob = await fetch(newPhotoURL).then((response) =>
          response.blob()
        );
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);

        userDataToUpdate.photoURL = url;
        updateProfile(user, {
          photoUrl: url,
          displayName: `${name} ${lastName}`,
        });
      }
      if (email !== user.email) {
        await updateEmail(user, email);
      }
      await updateDoc(userDocRef, userDataToUpdate);
      console.log("Profile updated successfully");
      showToast();
      setPhotoURL(newPhotoURL);
      navigation.navigate("ProfilePere");
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
              label="Prénom"
              className="w-full bg-blue-100 my-2"
              value={name}
              onChangeText={(text) => setName(text)}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={disabled ? "pencil" : "check-bold"}
                  onPress={() => setDisabled(!disabled)}
                />
              }
              disabled={disabled}
            />
            <TextInput
              label="Nom de famille"
              className="w-full bg-blue-100 my-2"
              value={lastName}
              onChangeText={(text) => setLastName(text)}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={disabled ? "pencil" : "check-bold"}
                  onPress={() => setDisabled(!disabled)}
                />
              }
              disabled={disabled}
            />
            <TextInput
              label="Email"
              className="w-full bg-blue-100 my-2"
              value={email}
              onChangeText={(text) => setEmail(text)}
              mode="outlined"
              right={
                <TextInput.Icon
                  icon={disabled ? "pencil" : "check-bold"}
                  onPress={() => setDisabled(!disabled)}
                />
              }
              disabled={disabled}
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

export default PersonalInfoPere;
