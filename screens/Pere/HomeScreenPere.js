import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Avatar } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { auth, firestore } from "../../firebase/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

function StudentInfoPere() {
  const navigation = useNavigation();
  const user = auth.currentUser;
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [loading, setLoading] = useState(true);
  const [unreadRemarksCount, setUnreadRemarksCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [professorEmails, setProfessorEmails] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  const fetchStudentData = useCallback(async () => {
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setStudentName(`${userData.name} ${userData.lastName}`);
        setClassName(userData.className);
        setPhotoURL(userData.photoURL || "");
        setUserEmail(user.email);
        await fetchUnreadRemarksCount(userData.studentId);
        await fetchUnreadChatCount(userData.studentId, user.email);
      } else {
        console.log("User document does not exist");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadRemarksCount = useCallback(async (studentId) => {
    try {
      const remarksQuery = query(
        collection(firestore, "Remarques"),
        where("studentId", "==", studentId),
        where("status", "==", "Non Lu")
      );
      const remarksSnapshot = await getDocs(remarksQuery);
      setUnreadRemarksCount(remarksSnapshot.size);
    } catch (error) {
      console.error("Error fetching unread remarks count:", error);
    }
  }, []);

  const fetchUnreadChatCount = useCallback(async (studentId, userEmail) => {
    try {
      const chatQuery = query(
        collection(firestore, "chats"),
        where("studentId", "==", studentId)
      );
      const chatSnapshot = await getDocs(chatQuery);
      let count = 0;
      chatSnapshot.forEach(doc => {
        const chatData = doc.data();
        chatData.messages.forEach(message => {
          if (message.status === "Non Lu" && message.user.email !== userEmail) {
            count++;
          }
        });
      });
      setUnreadChatCount(count);
      console.log("Unread messages from professors:", count);
    } catch (error) {
      console.error("Error fetching unread chat count:", error);
    }
  }, []);

  const fetchProfessorEmails = useCallback(async () => {
    try {
      const professorsQuery = query(
        collection(firestore, "users"),
        where("role", "==", "Professeur")
      );
      const professorsSnapshot = await getDocs(professorsQuery);
      const emails = professorsSnapshot.docs.map(doc => doc.data().email);
      setProfessorEmails(emails);
    } catch (error) {
      console.error("Error fetching professor emails:", error);
    }
  }, []);

  const fetchAndCountUnreadChats = useCallback(async () => {
    try {
      let unreadCount = 0;
      for (const emailProf of professorEmails) {
        const chatDocPath = `chats/${emailProf}_${userEmail}`;
        const chatDocRef = doc(firestore, chatDocPath);
        const chatDocSnapshot = await getDoc(chatDocRef);
        if (chatDocSnapshot.exists()) {
          const chatData = chatDocSnapshot.data();
          chatData.messages.forEach(message => {
            if (message.status === "Non Lu" && message.user.email === emailProf) {
              unreadCount++;
            }
          });
        }
      }
      setUnreadChatCount(unreadCount);
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  }, [professorEmails, userEmail]);

  useFocusEffect(
    useCallback(() => {
      fetchStudentData();
      fetchProfessorEmails();
    }, [fetchStudentData, fetchProfessorEmails])
  );

  useEffect(() => {
    if (professorEmails.length > 0 && userEmail) {
      fetchAndCountUnreadChats();
    }
  }, [professorEmails, userEmail, fetchAndCountUnreadChats]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleNavigation = (screen) => {
    try {
      navigation.navigate(screen);
    } catch (error) {
      console.error(`Error navigating to ${screen}:`, error);
      Alert.alert("Navigation Error", `Unable to navigate to ${screen}.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.content}>
        <Text style={styles.title}>VOS ENFANTS</Text>
        <View style={styles.divider} />
        <Avatar.Icon size={100} icon="account" style={styles.avatar} />
        <Text style={styles.studentName}>{studentName}</Text>
        <Text style={styles.className}>{className}</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("DevoirsPere")}>
            <Text style={styles.buttonText}>📋 Devoirs</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("EmploiTempsPere")}>
            <Text style={styles.buttonText}>📅 Emploi de Temps</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("RemarquesPere")}>
            <Text style={styles.buttonText}>
              📋 Remarques
              {unreadRemarksCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{unreadRemarksCount}</Text>
                </View>
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("ChatsPere")}>
            <Text style={styles.buttonText}>
              💬 Chat
              {unreadChatCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{unreadChatCount}</Text>
                </View>
              )}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleNavigation("NotesPere")}>
            <Text style={styles.buttonText}>📊 Moyennes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    alignItems: 'center',
    paddingBottom: 16, // Added padding to ensure scrollability
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#000",
  },
  headerTitle: {
    color: "#E74C3C",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#000",
    marginVertical: 16,
  },
  avatar: {
    marginVertical: 16,
  },
  studentName: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 8,
  },
  className: {
    fontSize: 16,
    color: "gray",
    marginBottom: 24,
  },
  userEmail: {
    fontSize: 16,
    color: "gray",
marginBottom: 24,
},
buttonsContainer: {
flexDirection: "row",
flexWrap: "wrap",
justifyContent: "center",
},
button: {
backgroundColor: "#3498DB",
borderRadius: 25,
padding: 10,
margin: 8,
minWidth: 100,
alignItems: "center",
position: "relative",
},
buttonText: {
color: "white",
fontWeight: "bold",
},
notificationBadge: {
position: "absolute",
top: -5,
right: -5,
backgroundColor: "red",
borderRadius: 10,
padding: 2,
minWidth: 20,
minHeight: 20,
justifyContent: "center",
alignItems: "center",
},
notificationText: {
color: "white",
fontSize: 12,
fontWeight: "bold",
},
emailContainer: {
marginTop: 20,
},
emailTitle: {
fontSize: 16,
fontWeight: "bold",
},
emailText: {
fontSize: 14,
},
loadingContainer: {
flex: 1,
justifyContent: "center",
alignItems: "center",
},
});

export default StudentInfoPere;
