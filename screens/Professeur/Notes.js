import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/firebase";
import { Avatar } from "react-native-paper";

function Notes({ route }) {
  const { profId } = route.params || {};
  const [classData, setClassData] = useState([]);
  const [profsMatieresData, setProfsMatieresData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

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
      const profsMatieresData = [];
      const studentsData = [];
      const filteredClassIds = new Set();

      await Promise.all(userIds.map(async (userId) => {
        const classesRef = collection(firestore, `Classes/${userId}/ClassesIds`);
        const classQuerySnapshot = await getDocs(classesRef);
        const classPromises = [];

        classQuerySnapshot.forEach((doc) => {
          const classId = doc.id;
          const classDoc = doc.data();
          const classTitle = classDoc.Title;

          classPromises.push((async () => {
            const profsMatieresRef = collection(firestore, `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres`);
            const profsMatieresSnapshot = await getDocs(profsMatieresRef);
            let isFilteredClass = false;

            profsMatieresSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.profId === profId) {
                profsMatieresData.push({ classId, ...data });
                filteredClassIds.add(classId);
                isFilteredClass = true;
              }
            });

            if (isFilteredClass) {
              classData.push({ userId, classId, classTitle });

              const studentsRef = collection(firestore, `Classes/${userId}/ClassesIds/${classId}/Students`);
              const studentsSnapshot = await getDocs(studentsRef);
              const students = [];
              studentsSnapshot.forEach((doc) => {
                const studentData = { id: doc.id, ...doc.data() }; // Include student ID here
                students.push(studentData);
              });
              studentsData.push({ classId, students, userId });
            }
          })());
        });

        await Promise.all(classPromises);
      }));

      setClassData(classData);
      setProfsMatieresData(profsMatieresData);
      setStudentsData(studentsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClassSelection = (classId) => {
    setSelectedClassId(classId);
  };

  const navigateToNotesDetails = (userId, classId, profId, matiereId, student) => {
    navigation.navigate('NotesDetails', { userId, classId, profId, matiereId, student });
  };

  const StudentCard = ({ student, userId, classId, profId, matiereId }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => navigateToNotesDetails(userId, classId, profId, matiereId, student)}
    >
      {student.photoURL ? (
        <Avatar.Image size={80} source={{ uri: student.photoURL }} style={styles.avatar} />
      ) : (
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
      )}
      <Text style={styles.studentName}>{`${student.name} ${student.lastName}`}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notes</Text>
      <View style={styles.buttonContainer}>
        {classData.map(({ classId, classTitle }, index) => (
          <Button
            key={index}
            title={String(classTitle)}
            onPress={() => handleClassSelection(classId)}
            color={selectedClassId === classId ? "#007AFF" : "#CCCCCC"}
          />
        ))}
      </View>
      {selectedClassId && (
        <ScrollView style={styles.scrollContainer}>
          <View style={styles.studentsContainer}>
            {studentsData
              .filter((data) => data.classId === selectedClassId)
              .map((data, index) => (
                <View key={index} style={styles.classDataItem}>
                  <View style={styles.studentGrid}>
                    {data.students.map((student, studentIndex) => {
                      const profMatiere = profsMatieresData.find((item) => item.classId === selectedClassId);
                      return (
                        <StudentCard
                          key={studentIndex}
                          student={student}
                          userId={data.userId}
                          classId={selectedClassId}
                          profId={profId}
                          matiereId={profMatiere ? profMatiere.matiereId : null}
                        />
                      );
                    })}
                  </View>
                </View>
              ))}
          </View>
        </ScrollView>
      )}
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
    flex: 1,
  },
  studentsContainer: {
    alignItems: "center",
  },
  classDataItem: {
    marginBottom: 20,
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  studentCard: {
    width: 120,
    alignItems: "center",
    margin: 10,
    padding: 12,
    backgroundColor: "#ebf3f3",
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#800080",
  },
  avatar: {
    marginBottom: 5,
  },
  studentName: {
    color: "#000",
    textAlign: "center",
  },
  fullName: {
    color: "#333",
    textAlign: "center",
  },
  studentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
});

export default Notes;
