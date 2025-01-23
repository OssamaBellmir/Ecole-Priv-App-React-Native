import * as React from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreenPere from "../screens/Pere/HomeScreenPere";
import ProfilePere from "../screens/Pere/ProfilePere";

const Tab = createBottomTabNavigator();

const homeName = "Accueil";
const profileName = "Profil";

function DashBotNavigationEtu() {
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
      <Tab.Screen name={homeName} component={HomeScreenPere} />
      <Tab.Screen name={profileName} component={ProfilePere} />
    </Tab.Navigator>
  );
}

export default DashBotNavigationEtu;
