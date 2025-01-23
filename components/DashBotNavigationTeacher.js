import * as React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreenProf from "../screens/Professeur/HomeScreenProf";
import ProfileTeacher from "../screens/Professeur/ProfileTeacher";

const Tab = createBottomTabNavigator();

const homeName = "Accueil";
const profileName = "Profil";

function DashBotNavigationTeacher() {
  return (
    <Tab.Navigator
      initialRouteName={homeName}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === homeName) {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === profileName) {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name={homeName} component={HomeScreenProf} />
      <Tab.Screen name={profileName} component={ProfileTeacher} />
    </Tab.Navigator>
  );
}

export default DashBotNavigationTeacher;
