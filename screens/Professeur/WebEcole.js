import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { useNavigation } from '@react-navigation/native';

function WebEcole() {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const profId = userData.profId;
            const profDocRef = doc(firestore, "Profs", profId);
            const profDocSnap = await getDoc(profDocRef);
            if (profDocSnap.exists()) {
              const profData = profDocSnap.data();
              setTeacherData({ ...profData, profId });
            } else {
              console.log("No document found for the teacher!");
            }
          } else {
            console.log("No document found for the user!");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  const handleNavigation = (screen) => {
    try {
      navigation.navigate(screen, { profId: teacherData?.profId });
    } catch (error) {
      console.error(`Error navigating to ${screen}:`, error);
      Alert.alert("Navigation Error", `Unable to navigate to ${screen}.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>PROFESSEUR</Text>
        <View style={styles.divider} />
        <MaterialCommunityIcons name="account-circle" size={100} color="#000" style={styles.avatar} />
        <Text style={styles.teacherName}>{teacherData?.nom} {teacherData?.prenom}</Text>
        <Text style={styles.teacherMatiere}>{teacherData?.matiere}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("Notes")}>
            <Text style={styles.buttonText}>📋 Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("Remarques")}>
            <Text style={styles.buttonText}>📅 Remarques</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("Messages")}>
            <Text style={styles.buttonText}>💬 Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("Devoirs")}>
            <Text style={styles.buttonText}>📋 Devoirs</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  content: {
    alignItems: "center",
    padding: 16,
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
  avatar: {
    marginVertical: 16,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  teacherMatiere: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#3498DB",
    borderRadius: 25,
    padding: 10,
    margin: 8,
    minWidth: 100,
    alignItems: "center",
    position: "relative",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WebEcole;
