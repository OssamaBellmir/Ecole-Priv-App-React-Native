import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from "@react-navigation/native";
import { auth, firestore } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";

function Signup() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({});

  const roles = [
    { label: "School", value: "School" },
  ];

  const getErrors = (email, password, confirmPassword, role) => {
    const errors = {};
    if (!email) {
      errors.email = "Veuillez saisir un email";
    } else if (!email.includes("@") || !email.includes(".com")) {
      errors.email = "Veuillez saisir un email valide";
    }
    if (!password) {
      errors.password = "Veuillez saisir un mot de passe";
    } else if (password.length < 8) {
      errors.password = "Le mot de passe doit contenir au moins 8 caractères";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer votre mot de passe";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    if (!role) {
      errors.role = "Veuillez sélectionner un rôle";
    }
    return errors;
  };

  const handleRegister = () => {
    const errors = getErrors(email, password, confirmPassword, role);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setShowErrors(true);
      return;
    }
    register();
    setErrors({});
    setShowErrors(false);
  };

  const register = async () => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const user = response.user;
      const userDoc = {
        email: user.email,
        role: role,
        phoneNumber: user.phoneNumber,
        photoUrl: user.photoURL,
        displayName: user.displayName,
      };
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, userDoc);
      console.log("Registered");
    } catch (error) {
      console.log("Sign up error: ", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>
        Inscrivez-vous pour explorer toutes les activités proposées et découvrir de nouvelles opportunités !
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        {showErrors && errors.email && (
          <Text style={styles.error}>{errors.email}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        {showErrors && errors.password && (
          <Text style={styles.error}>{errors.password}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Confirmez le mot de passe"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {showErrors && errors.confirmPassword && (
          <Text style={styles.error}>{errors.confirmPassword}</Text>
        )}
        <RNPickerSelect
          onValueChange={(value) => setRole(value)}
          items={roles}
          placeholder={{ label: "Sélectionnez un rôle", value: null }}
          style={pickerSelectStyles}
          value={role}
        />
        {showErrors && errors.role && (
          <Text style={styles.error}>{errors.role}</Text>
        )}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.signupButtonText}>Vous avez déjà un compte ?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F4",
  },
  formContainer: {
    width: "80%",
    alignItems: "center",
  },
  title: {
    color: "#000",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    color: "#000",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    width: "100%",
    backgroundColor: "#000",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  signupButton: {
    width: "100%",
    backgroundColor: "#2A82BB",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  inputAndroid: {
    width: "100%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
});

export default Signup;
