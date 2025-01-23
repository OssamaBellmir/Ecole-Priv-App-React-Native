import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Button, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { Avatar } from "react-native-paper";

function Messages({ route }) {
  const { profId } = route.params || {};
  const [classData, setClassData] = useState([]);
  const [profsMatieresData, setProfsMatieresData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUserEmail(user.email);
        console.log("Current user email:", user.email);
      } else {
        console.log("No current user found.");
      }
    };

    fetchCurrentUser();
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
                const studentData = { id: doc.id, ...doc.data() };
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
    navigation.navigate('MessagesDetails', { userId, classId, profId, matiereId, student });
  };

  const StudentCard = ({ student, userId, classId, profId, matiereId }) => {
    return (
      <TouchableOpacity
        style={styles.studentCard}
        onPress={() => navigateToNotesDetails(userId, classId, profId, matiereId, student)}
      >
        {student.photoURL ? (
          <Avatar.Image size={60} source={{ uri: student.photoURL }} style={styles.avatar} />
        ) : (
          <Avatar.Icon size={60} icon="account" style={styles.avatar} />
        )}
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
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
      <ScrollView>
        {studentsData
          .filter(({ classId }) => classId === selectedClassId)
          .flatMap(({ students, userId }) =>
            students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                userId={userId}
                classId={selectedClassId}
                profId={profId}
                matiereId={student.matiereId}
              />
            ))
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 10,
  },
  avatar: {
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Messages;
