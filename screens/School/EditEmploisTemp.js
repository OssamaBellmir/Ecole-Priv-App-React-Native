import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import { Dropdown } from "react-native-element-dropdown";
import Toast from "react-native-toast-message";

const daysOfWeek = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
const timeSlots = ["8H30-10H30", "10H30-12H30", "14H30-16H30", "16H30-18H30"];

function EditEmploisTemp() {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, schedule: existingSchedule } = route.params;

  const [matiereOptions, setMatiereOptions] = useState([]);
  const [schedule, setSchedule] = useState(existingSchedule);

  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const matieresRef = collection(firestore, "Matieres");
        const matieresSnapshot = await getDocs(matieresRef);
        const matieresData = matieresSnapshot.docs.map((doc) => ({
          label: doc.data().nom,
          value: doc.data().nom,
        }));

        setMatiereOptions(matieresData);
      } catch (error) {
        console.error("Erreur lors de la récupération des matières: ", error);
      }
    };

    fetchMatieres();
  }, []);

  const handleSaveSchedule = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("No authenticated user found.");
        return;
      }

      const scheduleRef = doc(
        firestore,
        "Classes",
        user.uid,
        "ClassesIds",
        classId,
        "EmploisTemps",
        "Emploi"
      );

      await setDoc(scheduleRef, schedule);
      Toast.show({
        type: "success",
        text1: "Emploi du temps modifié avec succès",
      });
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de la modification de l'emploi du temps: ", error);
      Toast.show({
        type: "error",
        text1: "Erreur lors de la modification de l'emploi du temps",
      });
    }
  };

  const handleSelectMatiere = (day, timeSlot, value) => {
    setSchedule((prevSchedule) => ({
      ...prevSchedule,
      [day]: {
        ...prevSchedule[day],
        [timeSlot]: value,
      },
    }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Modifier un Emploi du Temps</Text>
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          {daysOfWeek.map((day) => (
            <View key={day} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day}</Text>
              {timeSlots.map((timeSlot) => (
                <View key={timeSlot} style={styles.timeSlotContainer}>
                  <Text style={styles.timeSlotTitle}>{timeSlot}</Text>
                  <Dropdown
                    style={styles.dropdown}
                    data={matiereOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Sélectionner"
                    value={schedule[day][timeSlot]}
                    onChange={(item) => handleSelectMatiere(day, timeSlot, item.value)}
                  />
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveSchedule}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    marginBottom: 20,
  },
  dayContainer: {
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeSlotContainer: {
    marginBottom: 10,
  },
  timeSlotTitle: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdown: {
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 5,
    padding: 15,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EditEmploisTemp;
