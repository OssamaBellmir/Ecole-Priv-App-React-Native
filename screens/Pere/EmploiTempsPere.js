import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { collection, getDocs, query, where, doc, getDoc, deleteDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import { FontAwesome } from "@expo/vector-icons";

function EmploiTempsPere() {
  const navigation = useNavigation();
  const [schoolUserIds, setSchoolUserIds] = useState([]);
  const [classId, setClassId] = useState(null);
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    const fetchSchoolUserIds = async () => {
      try {
        const q = query(collection(firestore, "users"), where("role", "==", "School"));
        const querySnapshot = await getDocs(q);
        const userIds = querySnapshot.docs.map(doc => doc.id);
        setSchoolUserIds(userIds);
      } catch (error) {
        console.error("Error fetching userIds: ", error);
      }
    };

    const fetchCurrentUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const docRef = doc(firestore, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setClassId(userData.classId); // Assuming classId exists in userData
          } else {
            console.log("No such document!");
          }
        }
      } catch (error) {
        console.error("Error fetching current user data: ", error);
      }
    };

    fetchSchoolUserIds();
    fetchCurrentUserData();
  }, []);

  useEffect(() => {
    const fetchTimetable = async () => {
      if (classId && schoolUserIds.length > 0) {
        try {
          const timetables = await Promise.all(
            schoolUserIds.map(async (userId) => {
              const docRef = doc(firestore, `Classes/${userId}/ClassesIds/${classId}/EmploisTemps/Emploi`);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                return { userId, data: docSnap.data() };
              } else {
                return { userId, data: null };
              }
            })
          );
          setTimetable(timetables);
        } catch (error) {
          console.error("Error fetching timetable: ", error);
        }
      }
    };

    fetchTimetable();
  }, [classId, schoolUserIds]);

  

  const daysOrder = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const timeSlotsOrder = [
    "8H30-10H30", "10H30-12H30", "14H30-16H30", "16H30-18H30"
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Emploi du Temps</Text>
      <ScrollView style={styles.scrollView}>
        {timetable.map(({ userId, data }, index) => (
          <View key={index} style={styles.timetableContainer}>
            {data ? (
              daysOrder.map((day) => (
                <View key={day} style={styles.dayContainer}>
                  <View style={styles.dayHeader}>
                    <FontAwesome name="circle" size={24} color="black" style={styles.dayIcon} />
                    <Text style={styles.dayTitle}>{day.toUpperCase()}</Text>
                  </View>
                  {timeSlotsOrder.map((timeSlot) => (
                    <View key={timeSlot} style={styles.timeSlot}>
                      <Text style={styles.timeText}>{timeSlot}</Text>
                      <Text style={styles.subjectText}>{data[day] ? data[day][timeSlot] : "No class"}</Text>
                    </View>
                  ))}
                </View>
              ))
            ) : (
              <Text>No timetable available</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  timetableContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  userTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000080',
    marginBottom: 10,
  },
  dayContainer: {
    marginVertical: 10,
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
  deleteButton: {
    backgroundColor: '#FF6347',
    borderRadius: 5,
    padding: 15,
    flex: 1,
    marginHorizontal: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EmploiTempsPere;
