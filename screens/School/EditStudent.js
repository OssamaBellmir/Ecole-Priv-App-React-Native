import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import Toast from "react-native-toast-message";
import DateTimePickerModal from "react-native-modal-datetime-picker";

function EditStudent() {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, studentId } = route.params;

  const [studentName, setStudentName] = useState("");
  const [studentLastName, setStudentLastName] = useState("");
  const [birthdate, setBirthdate] = useState(new Date());
  const [massarCode, setMassarCode] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchStudentDetails(studentId);
  }, [studentId]);

  const fetchStudentDetails = async (studentId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
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

      const studentSnapshot = await getDoc(studentRef);
      if (studentSnapshot.exists()) {
        const studentData = studentSnapshot.data();
        setStudentName(studentData.name);
        setStudentLastName(studentData.lastName);
        setBirthdate(new Date(studentData.birthdate));
        setMassarCode(studentData.massarCode);
      } else {
        console.error("Étudiant non trouvé.");
      }
   
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de l'étudiant: ", error);
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

  const handleConfirm = (date) => {
    setBirthdate(date);
    setDatePickerVisibility(false);
  };

  const handleUpdateStudent = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        setIsLoading(false);
        return;
      }

      console.log("Updating student with ID:", studentId);

      const studentRef = doc(
        firestore,
        "Classes",
        user.uid,
        "ClassesIds",
        classId,
        "Students",
        studentId
      );

      const updatedStudentData = {
        name: studentName,
        lastName: studentLastName,
        birthdate: birthdate.toISOString(),
        massarCode: massarCode,
      };

      await updateDoc(studentRef, updatedStudentData);
      showToast("success", "Étudiant mis à jour avec succès");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'étudiant: ", error);
      showToast("error", "Erreur lors de la mise à jour de l'étudiant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modifier un Étudiant</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Prénom de l'étudiant"
          value={studentName}
          onChangeText={(text) => setStudentName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom de famille de l'étudiant"
          value={studentLastName}
          onChangeText={(text) => setStudentLastName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Code Massar"
          value={massarCode}
          onChangeText={(text) => setMassarCode(text)}
        />
        <TouchableOpacity onPress={() => setDatePickerVisibility(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>Date de naissance: {birthdate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={() => setDatePickerVisibility(false)}
        />
      </View>
      <TouchableOpacity onPress={handleUpdateStudent} style={styles.updateButton}>
        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.updateButtonText}>Mettre à Jour</Text>}
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
  updateButton: {
    padding: 12,
    backgroundColor: "#007BFF",
    borderRadius: 4,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default EditStudent;
