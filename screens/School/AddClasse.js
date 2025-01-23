import * as React from "react";
import { View, TouchableOpacity, Text, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import { firestore, auth } from "../../firebase/firebase";
import { addDoc, collection, query, where, getDocs } from "firebase/firestore";
import Toast from "react-native-toast-message";

function AddClasse({ navigation }) {
  const user = auth.currentUser;
  const [Titles, setTitles] = React.useState("");

  const titles = [
    { label: "1ere Année A", value: "1ere Année A" },
    { label: "1ere Année B", value: "1ere Année B" },
    { label: "2eme Année A", value: "2eme Année A" },
    { label: "2eme Année B", value: "2eme Année B" },
    { label: "3eme Année A", value: "3eme Année A" },
    { label: "3eme Année B", value: "3eme Année B" },
    { label: "4eme Année A", value: "4eme Année A" },
    { label: "4eme Année B", value: "4eme Année B" },
    { label: "5eme Année A", value: "5eme Année A" },
    { label: "5eme Année B", value: "5eme Année B" },
    { label: "6eme Année A", value: "6eme Année A" },
    { label: "6eme Année B", value: "6eme Année B" },
  ];

  const showToast = (type, message) => {
    Toast.show({
      type: type,
      position: "bottom",
      text1: message,
      visibilityTime: 2000,
      autoHide: true,
    });
  };

  const handleSubmit = async () => {
    if (!Titles) {
      showToast("error", "Please select a class title");
      return;
    }

    try {
      const classesRef = collection(firestore, "Classes", user.uid, "ClassesIds");
      const querySnapshot = await getDocs(query(classesRef, where("Title", "==", Titles)));

      if (!querySnapshot.empty) {
        showToast("error", "Class already exists");
        return;
      }

      const classData = {
        Title: Titles,
      };

      const docRef = await addDoc(classesRef, classData);

      showToast("success", "Class added successfully");
      navigation.navigate("ClasseDetails");
    } catch (error) {
      console.error("Error adding class: ", error);
      showToast("error", "Error adding class");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Ajouter une classe</Text>
          <View style={styles.pickerContainer}>
            <RNPickerSelect
              onValueChange={(value) => setTitles(value)}
              items={titles}
              placeholder={{ label: "Select Title", value: null }}
              style={pickerSelectStyles}
              value={Titles}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleSubmit}
            >
              <Text style={styles.addButtonText}>Ajouter Classe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    width: "100%",
    height: "100%",
  },
  innerContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },
  pickerContainer: {
    width: "90%",
  },
  addButton: {
    backgroundColor: "#007BFF",
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    color: "black",
  },
  inputAndroid: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#E8E8E8",
    borderRadius: 10,
    color: "black",
  },
});

export default AddClasse;
