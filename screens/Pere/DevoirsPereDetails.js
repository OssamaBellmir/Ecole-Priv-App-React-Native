import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { FontAwesome } from "@expo/vector-icons";

function DevoirsPereDetails() {
  const route = useRoute();
  const { subjectId } = route.params;
  const [subject, setSubject] = useState(null);
  const [devoirs, setDevoirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [visibleDescriptions, setVisibleDescriptions] = useState({});

  // Fetch subject details based on subjectId
  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const subjectDoc = doc(firestore, `Matieres/${subjectId}`);
        const subjectSnapshot = await getDoc(subjectDoc);
        if (subjectSnapshot.exists()) {
          setSubject({ id: subjectSnapshot.id, ...subjectSnapshot.data() });
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching subject:", error);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  // Fetch devoirs related to the classId for the logged-in student
  useEffect(() => {
    const fetchDevoirs = async () => {
      if (!subject || !userData) return;
      try {
        const devoirsQuery = query(
          collection(firestore, "Devoirs"),
          where("matiereId", "==", subjectId),
          where("classId", "==", userData.classId)
        );
        const devoirsSnapshot = await getDocs(devoirsQuery);
        const devoirsData = devoirsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDevoirs(devoirsData);
      } catch (error) {
        console.error("Error fetching devoirs:", error);
      }
    };

    if (subjectId && userData) {
      fetchDevoirs();
    }
  }, [subject, subjectId, userData]);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          setUserData(docSnapshot.data());
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStudentData();
    }
  }, [user]); // Depend on user to ensure it runs when user changes

  // Function to determine if the deadline has passed
  const isPastDeadline = (deadline) => {
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);
    return currentDate > deadlineDate;
  };

  // Function to toggle the visibility of a description
  const toggleDescription = (devoirId) => {
    setVisibleDescriptions((prevState) => ({
      ...prevState,
      [devoirId]: !prevState[devoirId],
    }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>DEVOIRS</Text>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <FontAwesome name="book" size={24} color="black" />
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity style={styles.subjectContainer}>
        <Text style={styles.subjectText}>{subject ? subject.nom : 'Loading...'}</Text>
      </TouchableOpacity>

      {devoirs.length > 0 ? (
        devoirs.map((devoir) => (
          <View key={devoir.id} style={styles.devoirCard}>
            <View style={styles.devoirHeader}>
              <Text style={styles.devoirText}>{devoir.devoirText}</Text>
              <TouchableOpacity onPress={() => toggleDescription(devoir.id)}>
                <Text style={styles.toggleButton}>{visibleDescriptions[devoir.id] ? "-" : "+"}</Text>
              </TouchableOpacity>
            </View>
            {visibleDescriptions[devoir.id] && (
              <Text style={styles.devoirDescription}>{devoir.description}</Text>
            )}
            <Text
              style={[
                styles.devoirDeadline,
                isPastDeadline(devoir.deadline) ? styles.pastDeadline : styles.upcomingDeadline,
              ]}
            >
              <Text style={styles.boldText}>Jusqu'à:</Text> {new Date(devoir.deadline).toLocaleDateString()}
            </Text>
          </View>
        ))
      ) : (
        <Text>No devoirs available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#000000",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#000000',
  },
  subjectContainer: {
    backgroundColor: "#1d4ed8",
    width: "100%",
    padding: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderRadius: 8,
  },
  subjectText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  devoirCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginVertical: 8,
    width: "100%",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  devoirHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  devoirText: {
    fontSize: 18, // Increased font size
    marginBottom: 4,
    fontWeight: "bold",
  },
  toggleButton: {
    fontSize: 24, // Increased font size for the button
    fontWeight: "bold",
    color: "#1d4ed8",
    paddingHorizontal: 10, // Add some padding for better touch area
  },
  devoirDescription: {
    fontSize: 16,
    marginBottom: 4,
    color: "#555555",
  },
  devoirDeadline: {
    fontSize: 18, // Increased font size
    marginTop: 4,
    textAlign: 'left', // Align text to the left
  },
  pastDeadline: {
    color: "red",
  },
  upcomingDeadline: {
    color: "green",
  },
  boldText: {
    fontWeight: "bold",
  },
});

export default DevoirsPereDetails;
