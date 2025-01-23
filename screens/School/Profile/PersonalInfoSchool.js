import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { auth, firestore, storage } from "../../../firebase/firebase";
import { Avatar, TextInput, IconButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Toast from "react-native-toast-message";
import { updateProfile, updateEmail } from "firebase/auth";

function PersonalInfoSchool({ navigation }) {
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
    try {
      // Demande de permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== "granted") {
        alert("Permission to access the gallery is required!");
        return;
      }
  
      // Lancement de la galerie d'images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.PHOTO], // Utilisation de la nouvelle API
        aspect: [4, 3],
        quality: 1,
        allowsEditing: true,
      });
  
      if (!result.canceled) {
        setNewPhotoURL(result.assets[0].uri); // Mise à jour de l'URL
      }
    } catch (error) {
      console.error("Error picking image:", error);
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
          `images/${user.uid}/profilePicSchool/${fileName}`
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
      navigation.navigate("Profile");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informations Personnelles</Text>
      {!loading && (
        <TouchableOpacity onPress={pickImage}>
          {newPhotoURL ? (
            <Avatar.Image size={100} source={{ uri: newPhotoURL }} />
          ) : (
            <Avatar.Icon size={100} icon="account" />
          )}
        </TouchableOpacity>
      )}
      <View style={styles.formContainer}>
        {!loading && (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                style={styles.input}
                value={email}
                onChangeText={(text) => setEmail(text)}
                mode="outlined"
                disabled={emailDisabled}
              />
              <IconButton
                icon={emailDisabled ? "pencil" : "check-bold"}
                size={24}
                onPress={() => setEmailDisabled(!emailDisabled)}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Nom"
                style={styles.input}
                value={nom}
                onChangeText={(text) => setNom(text)}
                mode="outlined"
                disabled={nomDisabled}
              />
              <IconButton
                icon={nomDisabled ? "pencil" : "check-bold"}
                size={24}
                onPress={() => setNomDisabled(!nomDisabled)}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Prénom"
                style={styles.input}
                value={prenom}
                onChangeText={(text) => setPrenom(text)}
                mode="outlined"
                disabled={prenomDisabled}
              />
              <IconButton
                icon={prenomDisabled ? "pencil" : "check-bold"}
                size={24}
                onPress={() => setPrenomDisabled(!prenomDisabled)}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleUpdate}
            >
              <Text style={styles.buttonText}>
                Confirmer Modifications
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    marginHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 24,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#e0f7fa",
  },
  button: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#007BFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
  },
  buttonText: {
    marginLeft: 8,
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default PersonalInfoSchool;
