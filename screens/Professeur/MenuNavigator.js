import React, { useState, useEffect } from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import ProfileTeacher from './ProfileTeacher';
import WebEcoleComponent from './WebEcole';
import Infos from './Infos';
import { doc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../../firebase/firebase';

const Drawer = createDrawerNavigator();

function CustomDrawerContent({ navigation, profId }) {
  return (
    <DrawerContentScrollView contentContainerStyle={styles.drawerContent}>
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
        onPress={() => navigation.navigate('WebEcole', { profId })}
        icon={() => <MaterialCommunityIcons name="home-outline" size={24} color="#fff" />}
      />
      <DrawerItem
        label="Infos"
        onPress={() => navigation.navigate('Infos', { profId })}
        icon={() => <FontAwesome5 name="info-circle" size={24} color="#fff" />}
        labelStyle={styles.drawerLabel}
      />
      <DrawerItem
        label="Profile Teacher"
        onPress={() => navigation.navigate('ProfileTeacher')}
        icon={() => <MaterialCommunityIcons name="account-outline" size={24} color="#fff" />}
        labelStyle={styles.drawerLabel}
      />
    </DrawerContentScrollView>
  );
}

function MenuNavigator({ route }) {
  const [loading, setLoading] = useState(true);
  const [profId, setProfId] = useState(null);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const profId = userData.profId;
            setProfId(profId);
          } else {
            console.log('No document found for the user!');
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#3B82F6" />;
  }

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} profId={profId} />}
      screenOptions={{
        drawerStyle: styles.drawer,
        headerStyle: {
          backgroundColor: '#1A1A1A',
        },
        headerTintColor: '#fff',
        headerTitle: () => <HeaderTitle />,
      }}
      initialRouteName="WebEcole"
    >
      <Drawer.Screen name="WebEcole" component={WebEcoleComponent} initialParams={{ profId }} />
      <Drawer.Screen name="Infos" component={Infos} initialParams={{ profId }} />
      <Drawer.Screen name="ProfileTeacher" component={ProfileTeacher} initialParams={{ profId }} />
    </Drawer.Navigator>
  );
}

function HeaderTitle() {
  return (
    <Text style={styles.headerTitle}>
      <Text style={styles.logoTextBold}>WEB</Text>EC<Text style={styles.logoTextRed}>OLE</Text>
    </Text>
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

export default MenuNavigator;
