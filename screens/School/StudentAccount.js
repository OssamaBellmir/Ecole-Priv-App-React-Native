import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native"; // Import des hooks de navigation
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";

function StudentAccount() { // Supprimez les props
  const navigation = useNavigation();
  const route = useRoute(); // Utilisez useRoute pour accéder aux paramètres de l'itinéraire
  const { student, classId, className } = route.params; // Obtenez les paramètres de l'itinéraire

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountCreated, setAccountCreated] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;

      const studentDoc = {
        email: user.email,
        name: student.name,
        lastName: student.lastName,
        birthdate: student.birthdate,
        className: student.className,
        photoURL: student.photoURL,
        classId: classId,
        studentId: student.id,
        role: "Student",
      };

      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, studentDoc);

      Alert.alert("Étudiant créé avec succès");
      setAccountCreated(true);
    } catch (error) {
      console.error("Error creating student account:", error);
      Alert.alert("Erreur lors de la création du compte étudiant", error.message);
    }
  };

  const navigateToHomeStudent = () => {
    navigation.navigate("HomeStudent", { classId, className });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte étudiant</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Créer un compte</Text>
      </TouchableOpacity>
      {accountCreated && (
        <TouchableOpacity style={styles.button} onPress={navigateToHomeStudent}>
          <Text style={styles.buttonText}>Aller à HomeStudent</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#28a745",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StudentAccount;
