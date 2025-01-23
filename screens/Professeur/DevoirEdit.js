import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { deleteDoc, doc, updateDoc } from "../../firebase/firebase";

const DevoirEdit = ({ devoir }) => {
  const { userId, classId, classTitle, profMatiere, id, devoirText, deadline } = devoir;
  const [editedText, setEditedText] = React.useState(devoirText);
  const [editedDeadline, setEditedDeadline] = React.useState(new Date(deadline));
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const navigation = useNavigation();

  const handleSaveChanges = async () => {
    if (!editedText.trim()) {
      Alert.alert("Erreur", "Le texte du devoir ne peut pas être vide");
      return;
    }

    try {
      await updateDoc(doc(firestore, "Devoirs", id), {
        devoirText: editedText,
        deadline: editedDeadline.toISOString(),
      });
      Alert.alert("Succès", "Les modifications ont été enregistrées avec succès");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la mise à jour du devoir:", error);
      Alert.alert("Erreur", "Erreur lors de la mise à jour du devoir");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, "Devoirs", id));
      Alert.alert("Succès", "Le devoir a été supprimé avec succès");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la suppression du devoir:", error);
      Alert.alert("Erreur", "Erreur lors de la suppression du devoir");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || editedDeadline;
    setShowDatePicker(false);
    setEditedDeadline(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier le devoir</Text>
      <Text style={styles.label}>Classe: {classTitle}</Text>
      <TextInput
        style={styles.textInput}
        placeholder="Entrez le texte du devoir"
        value={editedText}
        onChangeText={setEditedText}
      />
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>Modifier la date limite</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={editedDeadline}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.selectedDate}>Date limite actuelle: {new Date(deadline).toDateString()}</Text>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.buttonText}>Enregistrer les modifications</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.buttonText}>Supprimer le devoir</Text>
      </TouchableOpacity>
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
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DevoirEdit;
