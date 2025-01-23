import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firestore } from "../../firebase/firebase";

function RemarquesPere() {
  const navigation = useNavigation();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsCollection = collection(firestore, "Matieres");
        const subjectsSnapshot = await getDocs(subjectsCollection);
        const subjectsList = subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        await fetchUnreadRemarksCounts(subjectsList);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  const fetchUnreadRemarksCounts = async (subjectsList) => {
    try {
      const updatedSubjects = await Promise.all(
        subjectsList.map(async (subject) => {
          const remarksQuery = query(
            collection(firestore, "Remarques"),
            where("matiereId", "==", subject.id),
            where("status", "==", "Non Lu")
          );
          const remarksSnapshot = await getDocs(remarksQuery);
          const unreadCount = remarksSnapshot.size;
          return { ...subject, notificationCount: unreadCount };
        })
      );
      setSubjects(updatedSubjects);
    } catch (error) {
      console.error("Error fetching unread remarks counts:", error);
    }
  };

  const handleSubjectPress = (subjectId) => {
    navigation.navigate("RemarquesPereDetails", { subjectId, updateUnreadCounts });
  };

  const updateUnreadCounts = useCallback(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsCollection = collection(firestore, "Matieres");
        const subjectsSnapshot = await getDocs(subjectsCollection);
        const subjectsList = subjectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        await fetchUnreadRemarksCounts(subjectsList);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  useFocusEffect(updateUnreadCounts);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Remarques</Text>
        <View style={styles.divider} />
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject.id}
            style={styles.button}
            onPress={() => handleSubjectPress(subject.id)}
          >
            <Text style={styles.buttonText}>
              {subject.nom}{" "}
              {subject.notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{subject.notificationCount}</Text>
                </View>
              )}
            </Text>
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
    position: "relative",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  notificationBadge: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default RemarquesPere;
