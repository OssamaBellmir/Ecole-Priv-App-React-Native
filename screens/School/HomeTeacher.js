import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collection, onSnapshot, doc, deleteDoc, query, where, getDocs, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { firestore, auth, functions } from "../../firebase/firebase";
import { Avatar } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import { httpsCallable } from "firebase/functions";

function HomeTeacher() {
  const navigation = useNavigation();
  const [profs, setProfs] = useState([]);

  useEffect(() => {
    const fetchProfs = async () => {
      const profsRef = collection(firestore, "Profs");
      const unsubscribe = onSnapshot(profsRef, async (snapshot) => {
        const profsList = await Promise.all(snapshot.docs.map(async (doc) => {
          const profData = doc.data();
          const usersRef = collection(firestore, "users");
          const userQuery = query(usersRef, where("profId", "==", doc.id));
          const userSnapshot = await getDocs(userQuery);
          let userId = null;

          if (!userSnapshot.empty) {
            userId = userSnapshot.docs[0].id;
          }

          return {
            id: doc.id,
            userId,
            ...profData,
          };
        }));
        setProfs(profsList);
      }, (error) => {
        console.error("Erreur lors de la récupération des professeurs: ", error);
      });
      return unsubscribe;
    };

    fetchProfs();
  }, []);

  const handleDeleteProf = async (profId) => {
    try {
      const profRef = doc(firestore, "Profs", profId);
      await deleteDoc(profRef);
      setProfs(prevProfs => prevProfs.filter(prof => prof.id !== profId));
      console.log("Professeur supprimé avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression du professeur:", error);
    }
  };

  const confirmDeleteProf = (profId) => {
    Alert.alert(
      "Supprimer le professeur",
      "Êtes-vous sûr de vouloir supprimer ce professeur ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: () => handleDeleteProf(profId),
          style: "destructive"
        }
      ],
      { cancelable: false }
    );
  };

  const navigateToEditTeacher = (prof) => {
    navigation.navigate("EditTeacher", { prof });
  };

  const navigateToTeacherAccount = (prof) => {
    navigation.navigate("TeacherAccount", { prof });
  };

  const formatData = (data, numColumns) => {
    const numberOfFullRows = Math.floor(data.length / numColumns);
    let numberOfElementsLastRow = data.length - (numberOfFullRows * numColumns);
    while (numberOfElementsLastRow !== numColumns && numberOfElementsLastRow !== 0) {
      data.push({ id: `blank-${numberOfElementsLastRow}`, empty: true });
      numberOfElementsLastRow++;
    }
    return data;
  };

  const renderItem = ({ item }) => {
    if (item.empty) {
      return <View style={[styles.profItem, styles.profItemInvisible]} />;
    }

    return (
      <View style={styles.profItem}>
        {item.photoURL ? (
          <Avatar.Image size={80} source={{ uri: item.photoURL }} style={styles.profImage} />
        ) : (
          <Avatar.Icon size={80} icon="account" style={styles.profImage} />
        )}
        <Text style={styles.profName}>{item.nom} {item.prenom}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => navigateToEditTeacher(item)} style={styles.iconButton}>
            <FontAwesome name="edit" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmDeleteProf(item.id)} style={styles.iconButton}>
            <FontAwesome name="trash" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateToTeacherAccount(item)} style={styles.iconButton}>
            <FontAwesome name="user-plus" size={28} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleCreateAllAccounts = async () => {
    try {
      for (const prof of profs) {
        // Ensure that necessary fields are defined
        if (!prof.nom || !prof.prenom) {
          console.log("Nom or prénom is undefined for prof ID:", prof.id);
          continue; // Skip if nom or prénom is not defined
        }

        // Check if user already exists
        if (prof.userId) {
          console.log(`Compte déjà existant pour ${prof.nom} ${prof.prenom}`);
          continue; // Skip this iteration if userId is not null
        }
  
        const email = `${prof.nom}.${prof.prenom}@example.com`.replace(/\s+/g, '').toLowerCase();
        const password = `${prof.nom}${prof.prenom}`.replace(/\s+/g, '').toLowerCase();
  
        const response = await createUserWithEmailAndPassword(auth, email, password);
        const user = response.user;
  
        const profDoc = {
          email: user.email,
          nom: prof.nom,
          prenom: prof.prenom,
          date_birth: prof.date_birth || "",
          photoURL: prof.photoURL || null,
          role: "Professeur",
          uid: user.uid,
          profId: prof.id // Add the profId to the Firestore document
        };
  
        const userDocRef = doc(firestore, "users", user.uid);
        await setDoc(userDocRef, profDoc);
  
        // Update the professor document with the new userId
        const profRef = doc(firestore, "Profs", prof.id);
        await setDoc(profRef, { userId: user.uid }, { merge: true });
  
        console.log(`Compte créé pour ${prof.nom} ${prof.prenom}`);
      }
      Alert.alert("Comptes créés avec succès");
    } catch (error) {
      console.error("Erreur lors de la création des comptes enseignants:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la création des comptes.");
    }
  };
  

  const handleDeleteAllAccounts = async () => {
    try {
      const usersRef = collection(firestore, "users");
      const profsQuery = query(usersRef, where("role", "==", "Professeur"));
      const querySnapshot = await getDocs(profsQuery);

      const deleteUserPromises = querySnapshot.docs.map(async (doc) => {
        const user = doc.data();
        const deleteUserFunction = httpsCallable(functions, 'deleteUser');
        await deleteUserFunction({ uid: user.uid });
        await deleteDoc(doc.ref);
        console.log(`Compte supprimé pour ${user.nom} ${user.prenom}`);
      });

      await Promise.all(deleteUserPromises);

      Alert.alert("Comptes supprimés avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression des comptes enseignants:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la suppression des comptes.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Liste des Professeurs</Text>
      <FlatList
        data={formatData(profs, 2)}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        style={styles.list}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddTeacher')}
      >
        <Text style={styles.buttonText}>Ajouter un Professeur</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { marginTop: 10 }]}
        onPress={handleCreateAllAccounts}
      >
        <Text style={styles.buttonText}>Créer tous les comptes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { marginTop: 10 }]}
        onPress={handleDeleteAllAccounts}
      >
        <Text style={styles.buttonText}>Supprimer tous les comptes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  list: {
    flex: 1,
  },
  profItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  profItemInvisible: {
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  profImage: {
    marginBottom: 8,
  },
  profName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  profId: {
    fontSize: 16,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  iconButton: {
    marginHorizontal: 8,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#6200ee",
    borderRadius: 5,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default HomeTeacher;
