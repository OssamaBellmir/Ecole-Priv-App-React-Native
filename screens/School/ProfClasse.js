import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';  // Assurez-vous d'avoir installé @expo/vector-icons
import { FontAwesome } from "@expo/vector-icons";

function ProfClasse() {
  const route = useRoute();
  const { classId, className } = route.params; // Récupération de classId et className à partir des paramètres de la route
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const [assignments, setAssignments] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (!userId || !classId) {
      console.error("Aucun utilisateur ou classId trouvé.");
      return;
    }

    const fetchAssignments = async () => {
      const docPath = `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres`;
      const assignmentsRef = collection(firestore, docPath);
      const unsubscribe = onSnapshot(assignmentsRef, (snapshot) => {
        const assignmentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAssignments(assignmentsList);
      });
      return unsubscribe;
    };

    fetchAssignments();
  }, [userId, classId]);

  const handleDelete = async (assignmentId) => {
    try {
      const docPath = `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres/${assignmentId}`;
      await deleteDoc(doc(firestore, docPath));
      Alert.alert("Succès", "Assignation supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'assignation : ", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la suppression de l'assignation.");
    }
  };

  const renderAssignmentItem = ({ item }) => (
    <View style={styles.assignmentContainer}>
      <View style={styles.assignmentTextContainer}>
        <Text style={styles.assignmentText}>
          {item.profNom} {item.profPrenom}
        </Text>
        <Text style={styles.matiereText}>
          {item.matiereNom}
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => navigation.navigate("EditProfClass", { classId, className, assignmentId: item.id })}
        >
          <FontAwesome name="edit" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.iconButton} 
          onPress={() => handleDelete(item.id)}
        >
          <FontAwesome name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Assignations des Professeurs</Text>
      <FlatList
        data={assignments}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddProfClass", { classId, className })}
      >
        <Text style={styles.addButtonText}>Ajouter une assignation</Text>
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
  assignmentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  assignmentTextContainer: {
    flex: 1,
  },
  assignmentText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  matiereText: {
    fontSize: 16,
    color: "#555",
  },
  buttonContainer: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfClasse;
