import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { collection, doc, setDoc, onSnapshot, query, where, getDocs } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { useRoute, useNavigation } from "@react-navigation/native";

function AddProfClasse() {
  const route = useRoute();
  const { classId } = route.params;
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

  const handleSave = async () => {
    try {
      if (!userId || !classId || !selectedMatiere || !selectedProf) {
        Alert.alert("Erreur", "Tous les champs doivent être sélectionnés.");
        return;
      }

      const prof = profs.find((p) => p.id === selectedProf);
      const matiere = matieres.find((m) => m.id === selectedMatiere);

      if (!prof) {
        Alert.alert("Erreur", "Professeur non trouvé.");
        return;
      }

      if (!matiere) {
        Alert.alert("Erreur", "Matière non trouvée.");
        return;
      }

      // Vérifier si l'assignation existe déjà
      const docPath = `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres`;
      const assignmentsRef = collection(firestore, docPath);
      const q = query(assignmentsRef, where("matiereId", "==", selectedMatiere));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert("Erreur", "Cette matière est déjà assignée à cette classe.");
        return;
      }

      const assignmentData = {
        matiereId: selectedMatiere,
        profId: selectedProf,
        profNom: prof.nom || "",
        profPrenom: prof.prenom || "",
        matiereNom: matiere.nom || "",
        classId,
      };

      console.log("Assignment data: ", assignmentData);

      const newDocRef = doc(assignmentsRef);

      await setDoc(newDocRef, assignmentData);

      Alert.alert("Succès", "Assignation du professeur enregistrée avec succès !");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'assignation du professeur : ", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement de l'assignation du professeur.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter une Assignation</Text>
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

export default AddProfClasse;
