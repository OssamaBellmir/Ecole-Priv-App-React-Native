import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, doc, getDoc, setDoc, onSnapshot, query, where } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { useRoute, useNavigation } from "@react-navigation/native";

function EditProfClass() {
  const route = useRoute();
  const { classId, assignmentId } = route.params;
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const [matieres, setMatieres] = useState([]);
  const [profs, setProfs] = useState([]);
  const [filteredProfs, setFilteredProfs] = useState([]);
  const [selectedMatiere, setSelectedMatiere] = useState("");
  const [selectedProf, setSelectedProf] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMatieres = async () => {
      const matieresRef = collection(firestore, "Matieres");
      const unsubscribe = onSnapshot(matieresRef, (snapshot) => {
        const matieresList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMatieres(matieresList);
        console.log("Matieres fetched: ", matieresList);
      });
      return unsubscribe;
    };

    const fetchProfs = async () => {
      const profsRef = collection(firestore, "Profs");
      const unsubscribe = onSnapshot(profsRef, (snapshot) => {
        const profsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProfs(profsList);
        console.log("Profs fetched: ", profsList);
      });
      return unsubscribe;
    };

    fetchMatieres();
    fetchProfs();
  }, []);

  useEffect(() => {
    if (selectedMatiere) {
      const selectedMatiereNom = matieres.find((m) => m.id === selectedMatiere)?.nom;
      const filtered = profs.filter((prof) => prof.matiere === selectedMatiereNom);
      setFilteredProfs(filtered);
      console.log("Filtered Profs: ", filtered);
    } else {
      setFilteredProfs([]);
    }
  }, [selectedMatiere, profs, matieres]);

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        const docPath = `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres/${assignmentId}`;
        const assignmentDoc = doc(firestore, docPath);
        const docSnap = await getDoc(assignmentDoc);
        if (docSnap.exists()) {
          const assignmentData = docSnap.data();
          setSelectedMatiere(assignmentData.matiereId);
          setSelectedProf(assignmentData.profId);
        } else {
          Alert.alert("Erreur", "L'assignation sélectionnée n'existe pas.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données de l'assignation : ", error);
        Alert.alert("Erreur", "Une erreur est survenue lors de la récupération des données de l'assignation.");
        navigation.goBack();
      }
    };

    fetchAssignmentData();
  }, [userId, classId, assignmentId, navigation]);

  const handleSave = async () => {
    // Implémentez la fonctionnalité de sauvegarde ici
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier une Assignation</Text>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Sélectionnez une matière :</Text>
        <Picker
          selectedValue={selectedMatiere}
          style={styles.picker}
          onValueChange={(value) => {
            setSelectedMatiere(value);
            console.log("Selected Matiere: ", value);
          }}
        >
          <Picker.Item label="Sélectionnez une matière" value="" />
          {matieres.map((matiere) => (
            <Picker.Item key={matiere.id} label={matiere.nom} value={matiere.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Sélectionnez un professeur :</Text>
        <Picker
          selectedValue={selectedProf}
          style={styles.picker}
          onValueChange={(value) => {
            setSelectedProf(value);
            console.log("Selected Prof: ", value);
          }}
        >
          <Picker.Item label="Sélectionnez un professeur" value="" />
          {filteredProfs.map((prof) => (
            <Picker.Item key={prof.id} label={`${prof.nom} ${prof.prenom}`} value={prof.id} />
          ))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Sauvegarder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditProfClass;
