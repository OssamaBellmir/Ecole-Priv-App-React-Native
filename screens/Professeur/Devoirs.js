import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import Icon from 'react-native-vector-icons/MaterialIcons';

function Devoirs({ route }) {
  const { profId } = route.params || {};
  const [classData, setClassData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [devoirs, setDevoirs] = useState({});
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchDevoirs(selectedClassId);
    }
  }, [selectedClassId]);

  const fetchData = async () => {
    try {
      const usersRef = collection(firestore, "users");
      const querySnapshot = await getDocs(usersRef);
      const userIds = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        if (user.role === "School") {
          userIds.push(doc.id);
        }
      });

      const classData = [];

      await Promise.all(userIds.map(async (userId) => {
        const classesRef = collection(firestore, `Classes/${userId}/ClassesIds`);
        const classQuerySnapshot = await getDocs(classesRef);

        const classPromises = classQuerySnapshot.docs.map(async (doc) => {
          const classId = doc.id;
          const classDoc = doc.data();
          const classTitle = classDoc.Title;

          const profsMatieresRef = collection(firestore, `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres`);
          const profsMatieresSnapshot = await getDocs(profsMatieresRef);

          profsMatieresSnapshot.forEach((profDoc) => {
            const data = profDoc.data();
            if (data.profId === profId) {
              classData.push({ userId, classId, classTitle, profMatiere: data });
            }
          });
        });

        await Promise.all(classPromises);
      }));

      setClassData(classData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDevoirs = async (classId) => {
    try {
      const devoirsRef = collection(firestore, "Devoirs");
      const querySnapshot = await getDocs(devoirsRef);
      const classDevoirs = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.classId === classId) {
          classDevoirs.push({ id: doc.id, ...data });
        }
      });

      setDevoirs((prevDevoirs) => ({ ...prevDevoirs, [classId]: classDevoirs }));
    } catch (error) {
      console.error("Error fetching devoirs:", error);
    }
  };

  const handleClassSelection = (classId) => {
    setSelectedClassId(classId === selectedClassId ? null : classId);
  };

  const navigateToAddExercise = (classInfo) => {
    navigation.navigate('DevoirDetails', { ...classInfo });
  };

  const navigateToEditExercise = (classInfo, devoirId) => {
    navigation.navigate('DevoirEdit', { ...classInfo, devoirId });
  };

  const handleDelete = async (devoirId) => {
    try {
      await deleteDoc(doc(firestore, "Devoirs", devoirId));
      fetchDevoirs(selectedClassId); // Refresh devoirs after deletion
    } catch (error) {
      console.error("Error deleting devoir:", error);
      Alert.alert("Erreur", "Erreur lors de la suppression du devoir");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Devoirs</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.classContainer}>
          {classData.map((classInfo, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.classButton,
                selectedClassId === classInfo.classId && styles.selectedClassButton,
              ]}
              onPress={() => handleClassSelection(classInfo.classId)}
            >
              <Text style={styles.classButtonText}>{classInfo.classTitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedClassId && (
          <View style={styles.devoirsContainer}>
            {devoirs[selectedClassId] && devoirs[selectedClassId].map((devoir) => (
              <View key={devoir.id} style={styles.devoirCard}>
                <View style={styles.devoirHeader}>
                  <Text style={styles.devoirText}>{devoir.devoirText}</Text>
                  <View style={styles.devoirActions}>
                    <TouchableOpacity onPress={() => navigateToEditExercise(classData.find(classInfo => classInfo.classId === selectedClassId), devoir.id)}>
                      <Icon name="edit" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(devoir.id)}>
                      <Icon name="delete" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.devoirDeadline}>Date limite: {new Date(devoir.deadline).toLocaleDateString()}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => navigateToAddExercise(classData.find(classInfo => classInfo.classId === selectedClassId))}
            >
              <Text style={styles.addExerciseButtonText}>Ajouter un nouveau exercice</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ebf3f3",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#000",
    marginBottom: 20,
  },
  scrollContainer: {
    alignItems: "center",
  },
  classContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  classButton: {
    padding: 15,
    backgroundColor: "#cccccc",
    borderRadius: 5,
    margin: 5,
    alignItems: 'center',
  },
  selectedClassButton: {
    backgroundColor: "#007AFF",
  },
  classButtonText: {
    color: "#000",
    fontSize: 18,
  },
  devoirsContainer: {
    width: '100%',
  },
  devoirCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  devoirHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  devoirText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  devoirDeadline: {
    fontSize: 16,
    color: "#555",
    marginTop: 5,
  },
  devoirActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  addExerciseButton: {
    marginTop: 10,
    padding: 15,
    backgroundColor: "#800080",
    borderRadius: 5,
    alignItems: 'center',
  },
  addExerciseButtonText: {
    color: "#fff",
    fontSize: 18,
  },
});

export default Devoirs;
