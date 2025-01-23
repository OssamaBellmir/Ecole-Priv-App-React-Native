import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { firestore } from "../../firebase/firebase";
import { FontAwesome } from "@expo/vector-icons";

function NotesPere() {
  const navigation = useNavigation();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsCollection = collection(firestore, "Matieres");
        const subjectsSnapshot = await getDocs(subjectsCollection);
        const subjectsList = subjectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSubjects(subjectsList);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const handleSubjectPress = (subjectId) => {
    navigation.navigate("NotesPereDetails", { subjectId });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Notes</Text>
        <View style={styles.divider} />
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject.id}
            style={styles.button}
            onPress={() => handleSubjectPress(subject.id)}
          >
            <Text style={styles.buttonText}>{subject.nom}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f0f0f0",
    padding: 16,
  },
  content: {
    alignItems: "center",
    marginTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#000",
    marginVertical: 16,
  },
  button: {
    backgroundColor: "#3498DB",
    borderRadius: 25,
    padding: 10,
    margin: 8,
    minWidth: 200,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default NotesPere;
