import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import { FontAwesome } from "@expo/vector-icons";

function HomeEmploiTemp() {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId } = route.params;
  const [schedule, setSchedule] = useState(null);

  const fetchSchedule = async () => {
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

      const scheduleDoc = await getDoc(scheduleRef);

      if (scheduleDoc.exists()) {
        setSchedule(scheduleDoc.data());
      } else {
        console.error("No schedule found for this class.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'emploi du temps: ", error);
    }
  };

  const handleDelete = async () => {
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

      await deleteDoc(scheduleRef);
      setSchedule(null);
      Alert.alert("Succès", "Emploi du temps supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'emploi du temps: ", error);
      Alert.alert("Erreur", "Erreur lors de la suppression de l'emploi du temps");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchSchedule();
    }, [classId])
  );

  if (!schedule) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.title}>Aucun emploi du temps trouvé pour cette classe.</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEmploisTemp', { classId })}
        >
          <Text style={styles.addButtonText}>Ajouter un Emploi du Temps</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const daysOrder = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const timeSlotsOrder = [
    "8H30-10H30", "10H30-12H30", "14H30-16H30", "16H30-18H30"
  ];

  const sortedSchedule = daysOrder.reduce((acc, day) => {
    if (schedule[day]) {
      acc[day] = Object.keys(schedule[day])
        .sort((a, b) => timeSlotsOrder.indexOf(a) - timeSlotsOrder.indexOf(b))
        .reduce((sortedAcc, timeSlot) => {
          sortedAcc[timeSlot] = schedule[day][timeSlot];
          return sortedAcc;
        }, {});
    }
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Emploi du Temps</Text>
      <ScrollView style={styles.scrollView}>
        {Object.keys(sortedSchedule).map((day) => (
          <View key={day} style={styles.dayContainer}>
            <View style={styles.dayHeader}>
              <FontAwesome name="circle" size={24} color="black" style={styles.dayIcon} />
              <Text style={styles.dayTitle}>{day.toUpperCase()}</Text>
            </View>
            {Object.keys(sortedSchedule[day]).map((timeSlot) => (
              <View key={timeSlot} style={styles.timeSlot}>
                <Text style={styles.timeText}>{timeSlot}</Text>
                <Text style={styles.subjectText}>{sortedSchedule[day][timeSlot]}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditEmploisTemp', { classId, schedule })}
        >
          <Text style={styles.buttonText}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  dayContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dayIcon: {
    marginRight: 10,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000080',
  },
  timeSlot: {
    backgroundColor: '#4682B4',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  subjectText: {
    fontSize: 16,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#d3d3d3',
    backgroundColor: '#fff',
  },
  editButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 5,
    padding: 15,
    flex: 1,
    marginHorizontal: 10,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    padding: 15,
    flex: 1,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeEmploiTemp;
