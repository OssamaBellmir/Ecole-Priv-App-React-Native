import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, onSnapshot, doc, deleteDoc, setDoc, query, where, getDocs } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { firestore, auth, storage } from "../../firebase/firebase";
import { FontAwesome } from "@expo/vector-icons";
import * as ExpoFileSystem from 'expo-file-system';
import XLSX from 'xlsx';
import * as Sharing from 'expo-sharing';
import { createUserWithEmailAndPassword } from "firebase/auth";
import Toast from "react-native-toast-message"; // Ajout de l'importation de Toast

function HomeStudent({ route }) {
  const navigation = useNavigation();
  const { classId, initialClassName: className } = route.params;

  const [students, setStudents] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.error("Aucun utilisateur authentifié trouvé.");
      return;
    }

    const studentsRef = collection(
      firestore,
      "Classes",
      user.uid,
      "ClassesIds",
      classId,
      "Students"
    );

    const unsubscribe = onSnapshot(studentsRef, snapshot => {
      const studentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);
    }, error => {
      console.error("Erreur lors de la récupération des étudiants: ", error);
    });

    return () => unsubscribe();
  }, [classId]);

  const handleDeleteStudent = async (studentId, photoURL) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("Aucun utilisateur authentifié trouvé.");
        return;
      }

      const studentRef = doc(
        firestore,
        "Classes",
        user.uid,
        "ClassesIds",
        classId,
        "Students",
        studentId
      );

      if (photoURL) {
        const imageRef = ref(storage, photoURL);
        await deleteObject(imageRef);
      }

      await deleteDoc(studentRef);

      setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
      console.log("Étudiant supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'étudiant:", error);
    }
  };

  const confirmDeleteStudent = (studentId, photoURL) => {
    Alert.alert(
      "Supprimer l'étudiant",
      "Êtes-vous sûr de vouloir supprimer cet étudiant ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: () => handleDeleteStudent(studentId, photoURL),
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };

  const navigateToStudentAccount = (student) => {
    const studentData = {
      id: student.id,
      name: student.name || "",
      lastName: student.lastName || "",
      birthdate: student.birthdate || "",
      className: student.className || "",
      photoURL: student.photoURL || "",
    };
    navigation.navigate("StudentAccount", { student: studentData, classId, className });
  };

  const renderStudentItem = ({ item }) => {
    if (item.empty) {
      return <View style={[styles.studentItem, styles.studentItemInvisible]} />;
    }

    return (
      <View style={styles.studentItem}>
        <Image
          source={{ uri: item.photoURL }}
          style={styles.studentImage}
        />
        <Text style={styles.studentName}>{item.name} {item.lastName}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => console.log("Modifier", item.id)} style={styles.iconButton}>
            <FontAwesome name="edit" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDeleteStudent(item.id, item.photoURL)} style={styles.iconButton}>
            <FontAwesome name="trash" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToStudentAccount(item)} style={styles.iconButton}>
            <FontAwesome name="user-plus" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const formatData = (data, numColumns) => {
    const numberOfFullRows = Math.floor(data.length / numColumns);
    let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
    while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
      data.push({ id: `blank-${numberOfElementsLastRow}`, empty: true });
      numberOfElementsLastRow++;
    }
    return data;
  };

  const exportToExcel = async () => {
    try {
      const wb = XLSX.utils.book_new();
      const wsData = students.map((student, index) => [
        index + 1,
        student.name,
        student.lastName,
      ]);
      wsData.unshift(["Numéro", "Prénom", "Nom"]);
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Étudiants");

      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      const path = `${ExpoFileSystem.documentDirectory}students.xlsx`;

      await ExpoFileSystem.writeAsStringAsync(path, wbout, { encoding: ExpoFileSystem.EncodingType.Base64 });

      const fileUri = ExpoFileSystem.documentDirectory + "students.xlsx";

      await Sharing.shareAsync(fileUri, { dialogTitle: "Exporter vers Excel" });
    } catch (error) {
      console.error("Erreur lors de l'exportation de la liste des étudiants vers Excel:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'exportation.");
    }
  };

  const createStudentAccounts = async () => {
    try {
      const usersRef = collection(firestore, "users");

      for (const student of students) {
        if (!student.name || !student.lastName) {
          console.log("Nom ou prénom est manquant pour l'étudiant ID:", student.id);
          continue;
        }

        // Check if user already exists
        const studentQuery = query(usersRef, where("studentId", "==", student.id));
        const studentSnapshot = await getDocs(studentQuery);
        if (!studentSnapshot.empty) {
          console.log(`Compte déjà existant pour ${student.name} ${student.lastName}`);
          continue;
        }

        const email = `${student.name}${student.lastName}@example.com`.replace(/\s+/g, ''); // Email sans espace et avec domaine factice
        const password = `${student.name}${student.lastName}`.replace(/\s+/g, ''); // Mot de passe sans espace

        const response = await createUserWithEmailAndPassword(auth, email, password);
        const user = response.user;

        const studentDoc = {
          email: user.email,
          name: student.name,
          lastName: student.lastName,
          birthdate: student.birthdate || "",
          className: student.className || "",
          photoURL: student.photoURL || null,
          classId: classId,
          studentId: student.id,
          role: "Student",
        };

        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, studentDoc);

        console.log(`Compte créé pour ${student.name} ${student.lastName}`);
      }
      Alert.alert("Comptes créés avec succès");
    } catch (error) {
      console.error("Erreur lors de la création des comptes étudiants:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la création des comptes.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{className}</Text>
      <FlatList
        data={formatData(students, 2)}
        renderItem={renderStudentItem}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        onPress={() => navigation.navigate("AddStudent", { classId, className })}
        style={styles.addButton}
      >
        <Text style={styles.addButtonText}>Ajouter un Étudiant</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={exportToExcel}
        style={styles.exportButton}
      >
        <Text style={styles.exportButtonText}>Exporter vers Excel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={createStudentAccounts}
        style={styles.createAccountsButton}
      >
        <Text style={styles.createAccountsButtonText}>Créer Comptes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 16,
  },
  studentItem: {
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    padding: 12,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    width: '45%',
    aspectRatio: 1,
  },
  studentItemInvisible: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  studentImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  studentName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  iconButton: {
    marginHorizontal: 8,
  },
  addButton: {
    padding: 12,
    backgroundColor: "#28a745",
    borderRadius: 4,
    alignItems: "center",
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  exportButton: {
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 4,
    alignItems: "center",
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  createAccountsButton: {
    padding: 12,
    backgroundColor: "#ff5733",
    borderRadius: 4,
    alignItems: "center",
    position: "absolute",
    bottom: 144,
    left: 16,
    right: 16,
  },
  createAccountsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeStudent;
