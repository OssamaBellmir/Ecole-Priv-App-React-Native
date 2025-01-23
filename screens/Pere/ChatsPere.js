import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { firestore, auth } from "../../firebase/firebase";
import { Card, Avatar } from 'react-native-paper';

function ChatsPere() {
  const navigation = useNavigation();
  const [schoolUserIds, setSchoolUserIds] = useState([]);
  const [classId, setClassId] = useState(null);
  const [profClasseProfsMatieres, setProfClasseProfsMatieres] = useState([]);
  const [professorEmails, setProfessorEmails] = useState([]);
  const [userEmail, setUserEmail] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});

  const fetchData = useCallback(async () => {
    const fetchSchoolUserIds = async () => {
      try {
        const q = query(collection(firestore, "users"), where("role", "==", "School"));
        const querySnapshot = await getDocs(q);
        const userIds = querySnapshot.docs.map(doc => doc.id);
        setSchoolUserIds(userIds);
      } catch (error) {
        console.error("Error fetching school userIds: ", error);
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
            setUserEmail(userData.email);
          } else {
            console.log("No such document!");
          }
        }
      } catch (error) {
        console.error("Error fetching current user data: ", error);
      }
    };

    const fetchProfEmails = async () => {
      try {
        const q = query(collection(firestore, "users"), where("role", "==", "Professeur"));
        const querySnapshot = await getDocs(q);
        const profEmails = querySnapshot.docs.map(doc => doc.data().email);
        setProfessorEmails(profEmails);
      } catch (error) {
        console.error("Error fetching professeur emails: ", error);
      }
    };

    await fetchSchoolUserIds();
    await fetchCurrentUserData();
    await fetchProfEmails();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  useEffect(() => {
    const fetchProfClasseProfsMatieres = async () => {
      if (classId && schoolUserIds.length > 0) {
        try {
          const profData = await Promise.all(
            schoolUserIds.map(async (userId) => {
              const profClasseProfsMatieresRef = collection(firestore, `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres`);
              const profClasseProfsMatieresSnapshot = await getDocs(profClasseProfsMatieresRef);
              const profClasseProfsMatieresData = profClasseProfsMatieresSnapshot.docs.map(doc => ({ userId, ...doc.data() }));
              return profClasseProfsMatieresData;
            })
          );
          setProfClasseProfsMatieres(profData.flat());
        } catch (error) {
          console.error("Error fetching ProfClasseProfsMatieres data: ", error);
        }
      }
    };

    if (classId && schoolUserIds.length > 0) {
      fetchProfClasseProfsMatieres();
    }
  }, [classId, schoolUserIds]);

  useEffect(() => {
    const fetchAndCountUnreadChats = async () => {
      try {
        const unreadCounts = {};
        for (const emailProf of professorEmails) {
          const chatDocPath = `chats/${emailProf}_${userEmail}`;
          const chatDocRef = doc(firestore, chatDocPath);
          const chatDocSnapshot = await getDoc(chatDocRef);
          if (chatDocSnapshot.exists()) {
            const chatData = chatDocSnapshot.data();
            chatData.messages.forEach(message => {
              if (message.status === "Non Lu") {
                const profId = message.profId;
                if (!unreadCounts[profId]) {
                  unreadCounts[profId] = 0;
                }
                unreadCounts[profId]++;
              }
            });
          }
        }
        console.log("Unread messages count: ", unreadCounts); // Debugging
        setUnreadMessages(unreadCounts);
      } catch (error) {
        console.error("Error fetching chat data:", error);
      }
    };

    if (professorEmails.length > 0 && userEmail) {
      fetchAndCountUnreadChats();
    }
  }, [professorEmails, userEmail]);

  const getProfName = (profPrenom, profNom) => {
    return `${profPrenom || 'Unknown'} ${profNom || ''}`.trim();
  };

  const getProfInitials = (profPrenom, profNom) => {
    return `${profPrenom?.charAt(0) || ''}${profNom?.charAt(0) || ''}`.toUpperCase();
  };

  const handleCardPress = (profId) => {
    navigation.navigate("ChatsPereDetails", { profId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Chats</Text>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Professeurs:</Text>
        {profClasseProfsMatieres.map(({ userId, profId, profPrenom, profNom, matiereNom }, index) => {
          const profName = getProfName(profPrenom, profNom);
          const profInitials = getProfInitials(profPrenom, profNom);
          const unreadCount = unreadMessages[profId] || 0;
          console.log(`Prof: ${profName}, Unread Count: ${unreadCount}`); // Debugging
          return (
            <TouchableOpacity key={index} onPress={() => handleCardPress(profId)}>
              <Card style={styles.card}>
                <Card.Title
                  title={profName}
                  subtitle={`Matière: ${matiereNom}`}
                  left={(props) => <Avatar.Text {...props} label={profInitials} />}
                  right={(props) =>
                    unreadCount > 0 && (
                      <View style={styles.notificationBadge}>
                        <Text style={styles.notificationText}>{unreadCount}</Text>
                      </View>
                    )
                  }
                />
              </Card>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
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
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  card: {
    marginVertical: 10,
    marginHorizontal: 20,
  },
  notificationBadge: {
    backgroundColor: 'red',
    borderRadius: 10,
    padding: 4,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default ChatsPere;
