import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons, FontAwesome, Entypo } from "@expo/vector-icons";

function HomeScreenSchool() {
  const navigation = useNavigation();

  const handlePress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginTop: 30 }]}>WebEcole</Text>

      <View style={styles.dashboardContainer}>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => handlePress("HomeTeacher")}
        >
          <MaterialIcons name="person-outline" size={50} color="black" />
          <Text style={styles.dashboardText}>Teacher</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => handlePress("HomeMatier")}
        >
          <FontAwesome name="book" size={50} color="black" />
          <Text style={styles.dashboardText}>Matière</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => handlePress("ClasseDetails")}
        >
          <Entypo name="graduation-cap" size={50} color="black" />
          <Text style={styles.dashboardText}>Classe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 1,
  },
  dashboardContainer: {
    flex: 1,
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 25,
    paddingVertical: 60,
  },
  dashboardButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    height: 120,
  },
  dashboardText: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default HomeScreenSchool;
