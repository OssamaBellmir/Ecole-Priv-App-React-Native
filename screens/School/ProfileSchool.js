import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Avatar, List, Divider } from "react-native-paper";
import { auth, firestore, storage } from "../../firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { ref, deleteObject, getDownloadURL, listAll } from "firebase/storage";

function ProfileSchool({ navigation }) {
  const user = auth.currentUser;
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [photoURL, setPhotoURL] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [properties, setProperties] = React.useState([]);

  const menuItems = [
    {
      title: "Informations Personnelles",
      icon: "account",
      navigateTo: "PersonalInfoSchool",
    },
    
  ];

  const fetchUserData = async () => {
    try {
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setFullName(userData.fullName);
        setEmail(userData.email);
        setPhotoURL(userData.photoURL);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const userPropertiesRef = doc(
        firestore,
        "Properties",
        auth.currentUser.uid
      );
      const propertiesIdsCollection = collection(
        userPropertiesRef,
        "PropertiesIds"
      );
      const propertiesSnapshot = await getDocs(propertiesIdsCollection);

      const propertiesData = [];

      for (const docRef of propertiesSnapshot.docs) {
        const propertyRef = doc(
          firestore,
          "Properties",
          auth.currentUser.uid,
          "PropertiesIds",
          docRef.id
        );
        const propertyDoc = await getDoc(propertyRef);
        if (propertyDoc.exists()) {
          const property = {
            id: propertyDoc.id,
            title: propertyDoc.data().title,
            price: propertyDoc.data().Price,
            images: propertyDoc.data().images,
          };
          propertiesData.push(property);
        }
      }

      setProperties(propertiesData);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  React.useEffect(() => {
    fetchUserData();
    fetchProperties();
  }, []);

  const handleMenuItemPress = (item) => {
    navigation.navigate(item.navigateTo);
  };

  const handleDeleteProperty = async (propertyId, images) => {
    try {
      const propertyRef = doc(
        firestore,
        `Properties/${auth.currentUser.uid}/PropertiesIds`,
        propertyId
      );
      const deleteImagePromises = images.map(async (imageUrl) => {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
      });
      await Promise.all(deleteImagePromises);
      await deleteDoc(propertyRef);

      setProperties((prevProperties) =>
        prevProperties.filter((property) => property.id !== propertyId)
      );

      // Appel de fetchProperties pour actualiser les annonces après la suppression
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handleDeleteAllProperties = async () => {
    try {
      for (const property of properties) {
        await handleDeleteProperty(property.id, property.images);
      }

      setProperties([]);

      // Appel de fetchProperties pour actualiser les annonces après la suppression de toutes les annonces
      fetchProperties();
    } catch (error) {
      console.error("Erreur lors de la suppression des annonces :", error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      // Supprimer toutes les annonces
      await handleDeleteAllProperties();

      // Supprimer la photo de profil de l'utilisateur du stockage
      const profilePicRef = ref(
        storage,
        `images/${auth.currentUser.uid}/profilePic/profilePic.jpg`
      );
      await deleteObject(profilePicRef);

      // Supprimer le compte utilisateur
      const userDocRef = doc(firestore, "users", auth.currentUser.uid);
      await deleteDoc(userDocRef);

      // Déconnecter l'utilisateur
      await auth.signOut();
    } catch (error) {
      console.error("Error deleting user and properties:", error);
    }
  };

  if (loading) {
    // Render a loading indicator or placeholder while data is being fetched
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator
          animating={true}
          color={MD2Colors.blue200}
          size={"large"}
        />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <ScrollView>
        <View className="p-3 mt-20 mb-4 items-center">
          {photoURL ? (
            <Avatar.Image size={100} source={{ uri: photoURL }} />
          ) : (
            <Avatar.Icon size={100} icon="account" />
          )}
          <Text className="text-2xl font-bold mt-4">{fullName}</Text>
          <Text className="text-gray-400 text-base font-semibold mt-2">
            {email}
          </Text>
        </View>
        <Divider bold />
        <View className="mt-4">
          {menuItems.map((item, i) => (
            <TouchableOpacity key={i} onPress={() => handleMenuItemPress(item)}>
              <List.Item
                title={item.title}
                left={(props) => (
                  <List.Icon {...props} icon={item.icon} type="font-awesome" />
                )}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
              />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            className="bg-text p-3 rounded-lg mt-12"
            onPress={() => auth.signOut()}
          >
            <Text className="text-white text-center text-semibold py-1">
              Déconnexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-white p-3 rounded-lg mt-2 border-2 border-red-500"
            onPress={() => handleDeleteUser()}
          >
            <Text className="text-red-500 text-center text-bold py-1">
              Supprimer le compte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default ProfileSchool;
