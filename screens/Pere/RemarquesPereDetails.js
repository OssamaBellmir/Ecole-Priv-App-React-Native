import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { FontAwesome } from '@expo/vector-icons';

function RemarquesPereDetails() {
  const route = useRoute();
  const { subjectId } = route.params;
  const [subject, setSubject] = useState(null);
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const subjectDoc = doc(firestore, `Matieres/${subjectId}`);
        const subjectSnapshot = await getDoc(subjectDoc);
        if (subjectSnapshot.exists()) {
          setSubject({ id: subjectSnapshot.id, ...subjectSnapshot.data() });
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching subject:", error);
      }
    };

    if (subjectId) {
      fetchSubject();
    }
  }, [subjectId]);

  useEffect(() => {
    const fetchRemarks = async () => {
      if (!subject || !userData) return;
      try {
        const remarksQuery = query(
          collection(firestore, "Remarques"),
          where("matiereId", "==", subjectId),
          where("studentId", "==", userData.studentId)
        );
        const remarksSnapshot = await getDocs(remarksQuery);
        const remarksData = remarksSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => b.created_at.seconds - a.created_at.seconds); // Sort by created_at timestamp

        setRemarks(remarksData);
      } catch (error) {
        console.error("Error fetching remarks:", error);
      }
    };

    if (subjectId && userData) {
      fetchRemarks();
    }
  }, [subject, subjectId, userData]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const userDocRef = doc(firestore, "users", user.uid);
        const docSnapshot = await getDoc(userDocRef);
        if (docSnapshot.exists()) {
          setUserData(docSnapshot.data());
        } else {
          console.log("User document does not exist");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStudentData();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      const updateStatus = async () => {
        try {
          const updatePromises = remarks.map(async (remark) => {
            if (remark.status === "Non Lu") {
              const remarkDoc = doc(firestore, "Remarques", remark.id);
              await updateDoc(remarkDoc, { status: "Lu" });
            }
          });

          await Promise.all(updatePromises); // Wait for all updates to complete
        } catch (error) {
          console.error("Error updating remark status:", error);
        }
      };

      if (remarks.length > 0) {
        updateStatus();
      }
    };
  }, [remarks]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>REMARKS</Text>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <FontAwesome name="book" size={24} color="black" />
        <View style={styles.dividerLine} />
      </View>

      {subject ? (
        <View style={styles.content}>
          <Text style={styles.subjectName}>{subject.nom}</Text>
        </View>
      ) : (
        <Text>Loading subject...</Text>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {remarks.length > 0 ? (
            remarks.map((remark) => (
              <View
                key={remark.id}
                style={[
                  styles.remarkCard,
                  remark.status === "Non Lu" ? styles.nonLuRemarkCard : styles.luRemarkCard
                ]}
              >
                <Text style={styles.remarkText}>{remark.remark}</Text>
                <Text style={styles.remarkStatus}>Status: {remark.status}</Text>
              </View>
            ))
          ) : (
            <Text>No remarks available.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginVertical: 16,
    color: "#000000",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#000000',
  },
  content: {
    alignItems: "center",
    marginVertical: 16,
  },
  subjectName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#555",
  },
  remarkCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginVertical: 8,
    width: "100%",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  luRemarkCard: {
    backgroundColor: "#ADD8E6", // Blue for "Lu"
  },
  nonLuRemarkCard: {
    backgroundColor: "#D3D3D3", // Gray for "Non Lu"
  },
  remarkText: {
    fontSize: 16,
    color: "#555",
  },
  remarkStatus: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#777",
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default RemarquesPereDetails;
