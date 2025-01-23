import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import Toast from "react-native-toast-message";
import DateTimePicker from "@react-native-community/datetimepicker";

function AddStudent({ initialClassName = "Classe par défaut" }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId } = route.params;

  const [massarCode, setMassarCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [className, setClassName] = useState(initialClassName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchClassName(classId);
  }, [classId]);

  const fetchClassName = async (classId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        setClassName("Classe par défaut");
        return;
      }

      const classDoc = doc(firestore, "Classes", user.uid, "ClassesIds", classId);
      const classSnapshot = await getDoc(classDoc);
      if (classSnapshot.exists()) {
        const classData = classSnapshot.data();
        if (classData && classData.Title) {
          setClassName(classData.Title);
        } else {
          console.error("Titre de classe non trouvé.");
          setClassName("Classe par défaut");
        }
      } else {
        console.error("Classe non trouvée.");
        setClassName("Classe par défaut");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du titre de la classe: ", error);
      setClassName("Classe par défaut");
    }
  };

  const showToast = (type = "success", message) => {
    Toast.show({
      type: type,
      position: "bottom",
      text1: message,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const handleConfirm = (event, date) => {
    setDatePickerVisibility(false);
    if (date) {
      setBirthdate(date);
    }
  };

  const handleAddStudent = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        setIsLoading(false);
        return;
      }

      console.log("Adding new student to classId:", classId);

      if (!className) {
        await fetchClassName(classId);
      }

      const studentsRef = collection(
        firestore,
        "Classes",
        user.uid,
        "ClassesIds",
        classId,
        "Students"
      );

      const newStudent = {
        massarCode: massarCode,
        name: studentName,
        lastName: studentLastName,
        birthdate: birthdate.toISOString(),
        className: className,
      };

      await addDoc(studentsRef, newStudent);
      showToast("success", "Étudiant ajouté avec succès");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'étudiant: ", error);
      showToast("error", "Erreur lors de l'ajout de l'étudiant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un Étudiant</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Code Massar</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrer Code Massar"
          value={massarCode}
          onChangeText={(text) => setMassarCode(text)}
        />
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrer Prénom"
          value={studentName}
          onChangeText={(text) => setStudentName(text)}
        />
        <Text style={styles.label}>Nom de famille</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrer Nom de famille"
          value={studentLastName}
          onChangeText={(text) => setStudentLastName(text)}
        />
        <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>Date de naissance: {birthdate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {isDatePickerVisible && (
          <DateTimePicker
            value={birthdate}
            mode="date"
            display="default"
            onChange={handleConfirm}
          />
        )}
      </View>
      <TouchableOpacity onPress={handleAddStudent} style={styles.addButton}>
        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.addButtonText}>Ajouter</Text>}
      </TouchableOpacity>
      <Toast />
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  datePickerButton: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 4,
  },
  datePickerText: {
    color: "#fff",
    textAlign: "center",
  },
  addButton: {
    padding: 12,
    backgroundColor: "#28a745",
    borderRadius: 4,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddStudent;
