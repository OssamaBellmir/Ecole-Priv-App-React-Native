import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import RNPickerSelect from "react-native-picker-select";
import Toast from "react-native-toast-message";

function AddMatiere() {
  const navigation = useNavigation();
  const [matiere, setMatiere] = useState("");
  const matieres = [
    { label: "Arabe", value: "Arabe" },
    { label: "Francais", value: "Francais" },
    { label: "English", value: "English" },
    { label: "Math", value: "Math" },
    { label: "Eveil scientifique", value: "Eveil scientifique" },
    { label: "Sport", value: "Sport" },
    { label: "Art Education", value: "Art Education" },
    { label: "Géographie", value: "Géographie" },
    { label: "Éducation islamique", value: "Éducation islamique" },
  ];

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      position: "bottom",
      text1: message,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const handleAddMatiere = async () => {
    if (!matiere) {
      showToast("error", "Veuillez sélectionner une matière");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        return;
      }

      console.log("Checking if matiere already exists:", matiere);

      const matieresRef = collection(firestore, "Matieres");

      const q = query(matieresRef, where("nom", "==", matiere));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        showToast("error", "La matière existe déjà");
        return;
      }

      console.log("Adding new matiere:", matiere);

      const newMatiere = {
        nom: matiere,
      };

      await addDoc(matieresRef, newMatiere);
      showToast("success", "Matière ajoutée avec succès");
      navigation.navigate("HomeMatier");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la matière: ", error);
      showToast("error", "Erreur lors de l'ajout de la matière");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter une Matière</Text>
      <View style={styles.formContainer}>
        <RNPickerSelect
          onValueChange={(value) => setMatiere(value)}
          items={matieres}
          placeholder={{ label: "Sélectionner une Matière", value: null }}
          style={pickerSelectStyles}
          value={matiere}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddMatiere}
        >
          <Text style={styles.addButtonText}>Ajouter Matière</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  addButton: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#6200ee",
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    color: "black",
  },
  inputAndroid: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    color: "black",
  },
});

export default AddMatiere;
