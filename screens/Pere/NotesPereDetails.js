import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { FontAwesome } from '@expo/vector-icons';

function NotesPereDetails() {
  const route = useRoute();
  const { subjectId } = route.params;
  const [subject, setSubject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [allStudentsNotes, setAllStudentsNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;
  const [userData, setUserData] = useState(null);
  const [noteType, setNoteType] = useState('note1'); // 'note1' or 'note2'
  const [isExpanded, setIsExpanded] = useState(false);

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
    const fetchStudentDataAndNotes = async () => {
      try {
        if (user) {
          const userDocRef = doc(firestore, "users", user.uid);
          const docSnapshot = await getDoc(userDocRef);
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data();
            setUserData(userData);

            const notesQuery = query(
              collection(firestore, "Notes"),
              where("matiereId", "==", subjectId),
              where("classId", "==", userData.classId),
              where("studentId", "==", userData.studentId)
            );
            const notesSnapshot = await getDocs(notesQuery);
            const notesData = notesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setNotes(notesData);

            const allNotesQuery = query(
              collection(firestore, "Notes"),
              where("matiereId", "==", subjectId),
              where("classId", "==", userData.classId)
            );
            const allNotesSnapshot = await getDocs(allNotesQuery);
            const allNotesData = allNotesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setAllStudentsNotes(allNotesData);
          } else {
            console.log("User document does not exist");
          }
        }
      } catch (error) {
        console.error("Error fetching user data or notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDataAndNotes();
  }, [user, subjectId]);

  const calculateAverage = (notes, noteType) => {
    const validNotes = notes.filter(note => note[noteType] !== undefined && !isNaN(note[noteType]));
    const total = validNotes.reduce((sum, note) => sum + note[noteType], 0);
    return validNotes.length ? (total / validNotes.length).toFixed(2) : 0;
  };

  const calculateGeneralAverage = (notes, moyenneKey) => {
    const validNotes = notes.filter(note => note[moyenneKey] !== undefined && !isNaN(note[moyenneKey]));
    const totalMoyennes = validNotes.reduce((sum, note) => sum + Number(note[moyenneKey] || 0), 0);
    const numberOfMoyennes = validNotes.length;

    return numberOfMoyennes ? (totalMoyennes / numberOfMoyennes).toFixed(2) : 0;
  };

  const renderNotesTable = (notes, noteType) => {
    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Notes du {noteType === 'note1' ? 'Semestre 1' : 'Semestre 2'}</Text>
        {notes.map((note, index) => (
          <View key={index} style={styles.tableRow}>
            <View style={styles.tableColumn}>
              <Text style={styles.tableHeaderCell}>Contrôle 1</Text>
              <Text style={styles.tableCell}>{noteType === 'note1' ? note.note1Controle1 : note.note2Controle1}</Text>
            </View>
            <View style={styles.tableColumn}>
              <Text style={styles.tableHeaderCell}>Contrôle 2</Text>
              <Text style={styles.tableCell}>{noteType === 'note1' ? note.note1Controle2 : note.note2Controle2}</Text>
            </View>
            <View style={styles.tableColumn}>
              <Text style={styles.tableHeaderCell}>Moyenne</Text>
              <Text style={styles.tableCell}>{noteType === 'note1' ? note.moyenSemestre1 : note.moyenSemestre2}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAllStudentsNotesTable = (notes, noteType) => {
    const generalAverage = calculateGeneralAverage(notes, noteType === 'note1' ? 'moyenSemestre1' : 'moyenSemestre2');
    return (
      <View style={styles.generalAverageContainer}>
        <View style={styles.generalAverageRow}>
          <Text style={styles.generalAverageHeader}>Moyenne de Classe</Text>
        </View>
        <View style={styles.generalAverageRow}>
          <Text style={styles.generalAverageValue}>{generalAverage}</Text>
        </View>
      </View>
    );
  };

  const semester1Notes = notes.filter(note => note.note1Controle1 !== undefined && note.note1Controle2 !== undefined);
  const semester2Notes = notes.filter(note => note.note2Controle1 !== undefined && note.note2Controle2 !== undefined);
  const allSemester1Notes = allStudentsNotes.filter(note => note.note1Controle1 !== undefined && note.note1Controle2 !== undefined);
  const allSemester2Notes = allStudentsNotes.filter(note => note.note2Controle1 !== undefined && note.note2Controle2 !== undefined);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>INTERROGATIONS</Text>
      <Text style={styles.subjectName}>{subject ? subject.name : 'Loading...'}</Text>
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <FontAwesome name="book" size={24} color="black" />
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.trimestreContainer}>
        <TouchableOpacity style={[styles.trimestreButton, noteType === 'note1' && styles.activeButton]} onPress={() => setNoteType('note1')}>
          <Text style={styles.trimestreButtonText}>1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.trimestreButton, noteType === 'note2' && styles.activeButton]} onPress={() => setNoteType('note2')}>
          <Text style={styles.trimestreButtonText}>2</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.subjectContainer} onPress={() => setIsExpanded(!isExpanded)}>
        <Text style={styles.subjectText}>{subject ? subject.name : 'Notes et Moyennes'}</Text>
        <FontAwesome name={isExpanded ? "minus" : "plus"} size={24} color="white" />
      </TouchableOpacity>
      {isExpanded && (
        <>
          {noteType === 'note1' && renderNotesTable(semester1Notes, 'note1')}
          {noteType === 'note2' && renderNotesTable(semester2Notes, 'note2')}
          {noteType === 'note1' && renderAllStudentsNotesTable(allSemester1Notes, 'note1')}
          {noteType === 'note2' && renderAllStudentsNotesTable(allSemester2Notes, 'note2')}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5, // Adjusted margin
  },
  subjectName: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 5, // Adjusted margin
    color: "#4682B4",
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Adjusted margin
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'black',
  },
  trimestreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  trimestreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#D3D3D3",
    marginHorizontal: 5,
    borderRadius: 5,
  },
  activeButton: {
    backgroundColor: "#4682B4",
  },
  trimestreButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  subjectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#4682B4",
    borderRadius: 5,
    marginBottom: 15,
  },
  subjectText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  tableContainer: {
    marginBottom: 25,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  tableRow: {
    marginBottom: 10,
  },
  tableColumn: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f1f1f1",
    marginVertical: 3,
    borderRadius: 5,
  },
  tableHeaderCell: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tableCell: {
    textAlign: "right",
    fontSize: 16,
  },
  generalAverageContainer: {
    backgroundColor: "#f1f1f1",
    borderRadius: 5,
    paddingVertical: 15,
    marginBottom: 20,
  },
  generalAverageRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 10,
  },
  generalAverageHeader: {
    fontSize: 18,
    fontWeight: "bold",
  },
  generalAverageValue: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default NotesPereDetails;
