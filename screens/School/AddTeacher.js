import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import RNPickerSelect from "react-native-picker-select";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

function AddTeacher() {
  const navigation = useNavigation();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [dateBirth, setDateBirth] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [matiere, setMatiere] = useState("");
  const [matieres, setMatieres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const matieresRef = collection(firestore, "Matieres");
        const querySnapshot = await getDocs(matieresRef);
        const matieresList = querySnapshot.docs.map(doc => ({
          label: doc.data().nom,
          value: doc.data().nom,
        }));
        setMatieres(matieresList);
      } catch (error) {
        console.error("Erreur lors de la récupération des matières: ", error);
      }
    };

    fetchMatieres();
  }, []);

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      position: "bottom",
      text1: message,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const handleConfirm = (event, date) => {
    setDatePickerVisibility(false);
    if (date) {
      setDateBirth(date);
    }
  };

  const handleAddProf = async () => {
    if (!nom || !prenom || !dateBirth || !matiere) {
      showToast("error", "Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        setIsLoading(false);
        return;
      }

      console.log("Adding new prof:", { nom, prenom, dateBirth, matiere });

      const profsRef = collection(firestore, "Profs");

      const newProf = {
        nom,
        prenom,
        date_birth: dateBirth.toISOString(),
        matiere,
      };

      await addDoc(profsRef, newProf);
      showToast("success", "Professeur ajouté avec succès");
      navigation.navigate("HomeTeacher");
    } catch (error) {
      console.error("Erreur lors de l'ajout du professeur: ", error);
      showToast("error", "Erreur lors de l'ajout du professeur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un Professeur</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={nom}
          onChangeText={setNom}
        />
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          value={prenom}
          onChangeText={setPrenom}
        />
        <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>Date de naissance: {dateBirth.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {isDatePickerVisible && (
          <DateTimePicker
            value={dateBirth}
            mode="date"
            display="default"
            onChange={handleConfirm}
          />
        )}
        <RNPickerSelect
          onValueChange={(value) => setMatiere(value)}
          items={matieres}
          placeholder={{ label: "Sélectionner une Matière", value: null }}
          style={pickerSelectStyles}
          value={matiere}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddProf}
        >
          {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.addButtonText}>Ajouter Professeur</Text>}
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
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    color: "black",
  },
  datePickerButton: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 4,
  },
  datePickerText: {
    color: "#fff",
    textAlign: "center",
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

export default AddTeacher;
