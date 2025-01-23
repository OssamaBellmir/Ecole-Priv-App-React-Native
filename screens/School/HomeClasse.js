import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";

function HomeClasse() {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, className } = route.params; // Récupération de className en plus de classId

  const navigateToScreen = (screen, additionalParams = {}) => {
    navigation.navigate(screen, { classId, className, ...additionalParams });
  };

  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: "#f5f5f5", padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginVertical: 24 }}>{className}</Text>
      <View style={{ flexDirection: "column", justifyContent: "space-between", flex: 1, width: "100%" }}>
        <TouchableOpacity
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            marginVertical: 8,
            backgroundColor: "#ffffff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            borderRadius: 10,
            flex: 1,
          }}
          onPress={() => navigateToScreen("HomeStudent")}
        >
          <FontAwesome5 name="user" size={24} color="#6200ee" />
          <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            marginVertical: 8,
            backgroundColor: "#ffffff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            borderRadius: 10,
            flex: 1,
          }}
          onPress={() => navigateToScreen("HomeEmploiTemp")}
        >
          <FontAwesome5 name="calendar" size={24} color="#6200ee" />
          <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>Emplois du temps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            marginVertical: 8,
            backgroundColor: "#ffffff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            borderRadius: 10,
            flex: 1,
          }}
          onPress={() => navigateToScreen("ProfClasse")}
        >
          <FontAwesome5 name="chalkboard-teacher" size={24} color="#6200ee" />
          <Text style={{ fontSize: 20, fontWeight: "bold", marginTop: 8 }}>Teacher</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default HomeClasse;
