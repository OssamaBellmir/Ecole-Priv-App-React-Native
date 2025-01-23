import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Button, Alert, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"; // Import addDoc here
import { firestore } from "../../firebase/firebase";
import DateTimePicker from "@react-native-community/datetimepicker";

const DevoirDetails = ({ route }) => {
  const { userId, classId, classTitle, profMatiere, devoirId } = route.params; // Ajout de devoirId
  const [devoirText, setDevoirText] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (devoirId) {
      // Si devoirId est fourni, récupérer les détails du devoir existant
      fetchDevoirDetails();
    }
  }, [devoirId]);

  const fetchDevoirDetails = async () => {
    try {
      const devoirDoc = await getDoc(doc(firestore, "Devoirs", devoirId));
      if (devoirDoc.exists()) {
        const devoirData = devoirDoc.data();
        setDevoirText(devoirData.devoirText);
        setDescription(devoirData.description || "");
        setDeadline(new Date(devoirData.deadline));
      } else {
        Alert.alert("Erreur", "Le devoir spécifié n'existe pas");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails du devoir:", error);
      Alert.alert("Erreur", "Erreur lors de la récupération des détails du devoir");
    }
  };

  const handleSave = async () => {
    if (!devoirText.trim()) {
      Alert.alert("Erreur", "Le texte du devoir ne peut pas être vide");
      return;
    }

    try {
      if (devoirId) {
        // Si devoirId existe, mettre à jour le devoir existant
        await updateDoc(doc(firestore, "Devoirs", devoirId), {
          devoirText,
          description,
          deadline: deadline.toISOString(),
        });
        Alert.alert("Succès", "Devoir mis à jour avec succès");
      } else {
        // Sinon, ajouter un nouveau devoir
        const q = query(
          collection(firestore, "Devoirs"),
          where("classId", "==", classId),
          where("matiereId", "==", profMatiere.matiereId),
          where("devoirText", "==", devoirText)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          Alert.alert("Erreur", "Ce devoir existe déjà");
          return;
        }

        await addDoc(collection(firestore, "Devoirs"), {
          userId,
          classId,
          classTitle,
          matiereId: profMatiere.matiereId,
          matiereNom: profMatiere.matiereNom,
          profId: profMatiere.profId,
          profNom: profMatiere.profNom,
          devoirText,
          description,
          deadline: deadline.toISOString(),
          created_at: serverTimestamp(),
        });
        Alert.alert("Succès", "Devoir enregistré avec succès");
      }
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement/mise à jour du devoir:", error);
      Alert.alert("Erreur", "Erreur lors de l'enregistrement/mise à jour du devoir");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || deadline;
    setShowDatePicker(false);
    setDeadline(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{devoirId ? 'Modifier' : 'Ajouter'} un devoir</Text>
      <Text style={styles.label}>Classe: {classTitle}</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Entrez le texte du devoir"
        value={devoirText}
        onChangeText={setDevoirText}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Entrez la description du devoir"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Sélectionner la date limite</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={deadline}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.selectedDate}>Date limite: {deadline.toDateString()}</Text>
      <Button title={devoirId ? 'Mettre à jour' : 'Enregistrer'} onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ebf3f3",
  },
  title: {
    fontSize: 24,
    color: "#000",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: "#000",
    marginBottom: 10,
  },
  textInput: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 20,
  },
  textArea: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 20,
    height: 100,
  },
  dateButton: {
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 18,
  },
  selectedDate: {
    marginBottom: 20,
    fontSize: 16,
    color: "#000",
  },
});

export default DevoirDetails;
