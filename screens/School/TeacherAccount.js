import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { firestore, auth, storage } from "../../firebase/firebase";
import { ref, deleteObject } from "firebase/storage";
import { FontAwesome } from "@expo/vector-icons";

function TeacherAccount() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center  bg-background">
      <Text className="text-2xl font-bold mt-12">Teacher Account</Text>
    </View>
  );
}

export default TeacherAccount;
