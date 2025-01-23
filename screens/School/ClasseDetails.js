import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import { FAB } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialIcons';

const windowWidth = Dimensions.get('window').width;

function ClasseDetails() {
  const navigation = useNavigation();
  const [classes, setClasses] = useState([]);
  const user = auth.currentUser;

  const fetchClasses = async () => {
    try {
      const classesRef = collection(firestore, "Classes", user.uid, "ClassesIds");
      const querySnapshot = await getDocs(classesRef);
      const classesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedClasses = classesData.sort((a, b) => a.Title.localeCompare(b.Title));
      setClasses(sortedClasses);
    } catch (error) {
      console.error("Error fetching classes: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchClasses();
    }, [])
  );

  const getClassIcon = (classTitle) => {
    switch (classTitle) {
      case "1ere Année A":
        return "school";
      case "1ere Année B":
        return "book";
      case "2eme Année A":
        return "library-books";
      case "2eme Année B":
        return "local-library";
      default:
        return "class";
    }
  };

  const handleClassPress = (classId) => {
    navigation.navigate("HomeClasse", { classId });
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 30 }]}>Détails de Classes</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {classes.map((classItem, index) => (
            <TouchableOpacity key={index} style={styles.card} onPress={() => handleClassPress(classItem.id)}>
              <Icon name={getClassIcon(classItem.Title)} size={40} color="#6200ee" />
              <Text style={styles.cardText}>{classItem.Title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddClasse")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  scrollView: {
    width: "100%",
    marginTop: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    width: (windowWidth - 40) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#6200ee",
  },
});

export default ClasseDetails;
