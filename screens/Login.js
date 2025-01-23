import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth } from "../firebase/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showErrors, setShowErrors] = React.useState(false);
  const [errors, setErrors] = React.useState({});

  const getErrors = (email, password) => {
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
    return errors;
  };

  const handleLogin = () => {
    const errors = getErrors(email, password);
    if (Object.keys(errors).length > 0) {
      setErrors(showErrors && errors);
      setShowErrors(true);
      return;
    } else {
      signIn();
      setErrors({});
      setShowErrors(false);
      console.log("Registered");
    }
  };

  const signIn = async () => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log('Sign in error: ', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Se Connecter</Text>
        <Text style={styles.subtitle}>Bienvenue, vous nous avez manqué !</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        {showErrors && errors.email && (
          <Text style={styles.error}>{errors.email}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        {showErrors && errors.password && (
          <Text style={styles.error}>{errors.password}</Text>
        )}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
          <Text style={styles.buttonText}>Se Connecter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupButtonText}>Créer un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2F4F4", // Example background color
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: "#000",
    fontSize: 14,
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
};

export default Login;
