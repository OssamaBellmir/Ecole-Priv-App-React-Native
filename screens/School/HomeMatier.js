import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firestore } from "../../firebase/firebase";
import { FAB } from "react-native-paper";

function HomeMatier() {
  const navigation = useNavigation();
  const [matieres, setMatieres] = useState([]);

  const fetchMatieres = async () => {
    try {

      const matieresRef = collection(firestore, "Matieres");
      const matieresSnapshot = await getDocs(matieresRef);

      const matieresData = matieresSnapshot.docs.map((doc) => ({
        id: doc.id,
        nom: doc.data().nom,
      }));

      setMatieres(matieresData);
    } catch (error) {
      console.error("Erreur lors de la récupération des matières: ", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMatieres();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails des Matières</Text>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {matieres.map((matiere) => (
          <View key={matiere.id} style={styles.matiereContainer}>
            <Text style={styles.matiereTitle}>{matiere.nom}</Text>
          </View>
        ))}
      </ScrollView>
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate("AddMatiere")}
      />
    </View>
  );
}

const styles = {
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
  matiereContainer: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  matiereTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#6200ee",
  },
};

export default HomeMatier;
