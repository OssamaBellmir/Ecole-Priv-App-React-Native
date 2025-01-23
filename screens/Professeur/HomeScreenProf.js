import React from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import WebEcole from "./WebEcole";
import Infos from "./Infos";
import ProfileTeacher from "./ProfileTeacher";

const Drawer = createDrawerNavigator();

function HeaderTitle() {
  return (
    <Text style={styles.headerTitle}>
      <Text style={styles.logoTextBold}>WEB</Text>EC<Text style={styles.logoTextRed}>OLE</Text>
    </Text>
  );
}

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          <Text style={styles.logoTextBold}>WEB</Text>EC<Text style={styles.logoTextRed}>OLE</Text>
        </Text>
      </View>
      <DrawerItem
        label={() => (
          <Text style={styles.drawerLabel}>
            <Text style={styles.logoTextBold}>WEB</Text>EC<Text style={styles.logoTextRed}>OLE</Text>
          </Text>
        )}
        onPress={() => props.navigation.navigate('WebEcole')}
        icon={() => <MaterialCommunityIcons name="home-outline" size={24} color="#fff" />}
      />
      <DrawerItem
        label="Infos"
        onPress={() => props.navigation.navigate('Infos')}
        icon={() => <FontAwesome5 name="info-circle" size={24} color="#fff" />}
        labelStyle={styles.drawerLabel}
      />
      <DrawerItem
        label="Profile"
        onPress={() => props.navigation.navigate('ProfileTeacher')}
        icon={() => <MaterialCommunityIcons name="account-outline" size={24} color="#fff" />}
        labelStyle={styles.drawerLabel}
      />
    </DrawerContentScrollView>
  );
}

function HomeScreenProf() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      drawerStyle={styles.drawer}
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTintColor: '#fff',
        headerTitle: () => <HeaderTitle />,
      }}
    >
      <Drawer.Screen name="WebEcole" component={WebEcole} />
      <Drawer.Screen name="Infos" component={Infos} />
      <Drawer.Screen name="ProfileTeacher" component={ProfileTeacher} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  drawerLabel: {
    color: '#fff',
  },
  drawer: {
    backgroundColor: '#1A1A1A',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoText: {
    fontSize: 24,
    color: '#fff',
  },
  logoTextBold: {
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  logoTextRed: {
    color: '#EF4444',
  },
  headerTitle: {
    fontSize: 18,
    color: '#fff',
  },
});

export default HomeScreenProf;
