import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import onboarding from "./screens/onboarding";
import Login from "./screens/Login";
import Signup from "./screens/Signup";
import { auth, firestore } from "./firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { View } from "react-native";
import HomeScreenSchool from "./screens/School/HomeScreenSchool";
import HomeScreenPere from "./screens/Pere/HomeScreenPere";
import AddClasse from "./screens/School/AddClasse";
import ClasseDetails from "./screens/School/ClasseDetails";
import HomeStudent from "./screens/School/HomeStudent";
import HomeTeacher from "./screens/School/HomeTeacher";
import HomeEmploiTemp from "./screens/School/HomeEmploiTemp";
import HomeMatier from "./screens/School/HomeMatier";
import AddEmploisTemp from "./screens/School/AddEmploisTemp";
import AddMatiere from "./screens/School/AddMatiere";
import AddTeacher from "./screens/School/AddTeacher";
import AddStudent from "./screens/School/AddStudent";
import EditEmploisTemp from "./screens/School/EditEmploisTemp";
import EditTeacher from "./screens/School/EditTeacher";
import EditStudent from "./screens/School/EditStudent";
import HomeClasse from "./screens/School/HomeClasse";
import ProfClasse from "./screens/School/ProfClasse";
import TeacherAccount from "./screens/School/TeacherAccount";
import StudentAccount from "./screens/School/StudentAccount";
import ProfilePere from "./screens/Pere/ProfilePere";
import PersonalInfoPere from "./screens/Pere/Profile/PersonalInfoPere";
import PersonalInfoTeacher from "./screens/Professeur/Profile/PersonalInfoTeacher";
import ProfileTeacher from "./screens/Professeur/ProfileTeacher";
import PersonalInfoSchool from "./screens/School/Profile/PersonalInfoSchool";
import ProfileSchool from "./screens/School/ProfileSchool";
import Notes from "./screens/Professeur/Notes";
import Remarques from "./screens/Professeur/Remarques";
import MenuNavigator from "./screens/Professeur/MenuNavigator";
import Infos from "./screens/Professeur/Infos";
import HomeScreenProf from "./screens/Professeur/HomeScreenProf";
import WebEcole from "./screens/Professeur/WebEcole";
import Messages from "./screens/Professeur/Messages";
import EditProfClass from "./screens/School/EditProfClass";
import AddProfClass from "./screens/School/AddProfClass";
import ClassDetails from "./screens/School/ClasseDetails";
import NotesDetails from "./screens/Professeur/NotesDetails";
import RemarquesDetails from "./screens/Professeur/RemarquesDetails";
import MessagesDetails from "./screens/Professeur/MessagesDetails";
import MenuSchool from "./screens/School/MenuSchool";
import MenuPere from "./screens/Pere/MenuPere";
import InfosPere from "./screens/Pere/InfosPere";
import RemarquesPere from "./screens/Pere/RemarquesPere";
import ChatsPere from "./screens/Pere/ChatsPere";
import DevoirsPere from "./screens/Pere/DevoirsPere";
import EmploiTempsPere from "./screens/Pere/EmploiTempsPere";
import NotesPere from "./screens/Pere/NotesPere";
import DevoirsPereDetails from "./screens/Pere/DevoirsPereDetails";
import NotesPereDetails from "./screens/Pere/NotesPereDetails";
import ChatsPereDetails from "./screens/Pere/ChatsPereDetails";
import RemarquesPereDetails from "./screens/Pere/RemarquesPereDetails";
import Devoirs from "./screens/Professeur/Devoirs";
import DevoirDetails from "./screens/Professeur/DevoirDetails";
import DevoirEdit from "./screens/Professeur/DevoirEdit";


const Stack = createNativeStackNavigator();

function App() {
  const [user, setUser] = React.useState(null);
  const [userRole, setUserRole] = React.useState(null);

 React.useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    setUser(user);
  });
  return unsubscribe;
}, []);

React.useEffect(() => {
  setUserRole(null);
  const fetchUserRole = async () => {
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      try {
        const userDocSnapshot = await getDoc(userDocRef);
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setUserRole(userData.role);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }
  };

  fetchUserRole();
}, [user]);


  const LoadingScreen = () => {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator animating={true} color={MD2Colors.red500} />
      </View>
    );
  
  };

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            userRole === null ? (
              <Stack.Screen name="Loading" component={LoadingScreen} />
            ) : userRole === "School" ? (
              <>
              <Stack.Screen name="MenuSchool" component={MenuSchool} />
              <Stack.Screen name="HomeScreenSchool" component={HomeScreenSchool} />
              <Stack.Screen name="AddClasse" component={AddClasse} />
              <Stack.Screen name="ClasseDetails" component={ClasseDetails} />
              <Stack.Screen name="HomeStudent" component={HomeStudent} />
              <Stack.Screen name="HomeTeacher" component={HomeTeacher} />
              <Stack.Screen name="HomeEmploiTemp" component={HomeEmploiTemp} />
              <Stack.Screen name="HomeMatier" component={HomeMatier} />
              <Stack.Screen name="AddEmploisTemp" component={AddEmploisTemp} />
              <Stack.Screen name="AddMatiere" component={AddMatiere} />
              <Stack.Screen name="AddTeacher" component={AddTeacher} />
              <Stack.Screen name="AddStudent" component={AddStudent} />
              <Stack.Screen name="EditEmploisTemp" component={EditEmploisTemp} />
              <Stack.Screen name="EditTeacher" component={EditTeacher} />
              <Stack.Screen name="EditStudent" component={EditStudent} />
              <Stack.Screen name="HomeClasse" component={HomeClasse} />
              <Stack.Screen name="ProfClasse" component={ProfClasse} />
              <Stack.Screen name="TeacherAccount" component={TeacherAccount} />
              <Stack.Screen name="StudentAccount" component={StudentAccount} />
              <Stack.Screen name="ProfileSchool" component={ProfileSchool} />
              <Stack.Screen name="PersonalInfoSchool" component={PersonalInfoSchool} />
              <Stack.Screen name="AddProfClass" component={AddProfClass} />
              <Stack.Screen name="EditProfClass" component={EditProfClass} />
              </>
            ) : userRole === "Professeur" ? (
              <>
              <Stack.Screen name="HomeScreenProf" component={HomeScreenProf} />
              <Stack.Screen name="NotesDetails" component={NotesDetails} />
              <Stack.Screen name="RemarquesDetails" component={RemarquesDetails} />
              <Stack.Screen name="MessagesDetails" component={MessagesDetails} />
              <Stack.Screen name="ProfileTeacher" component={ProfileTeacher} />
              <Stack.Screen name="PersonalInfoTeacher" component={PersonalInfoTeacher} />
              <Stack.Screen name="Notes" component={Notes} />
              <Stack.Screen name="Messages" component={Messages} />
              <Stack.Screen name="Remarques" component={Remarques} />
              <Stack.Screen name="MenuNavigator" component={MenuNavigator} />
              <Stack.Screen name="Infos" component={Infos} />
              <Stack.Screen name="WebEcole" component={WebEcole} />
              <Stack.Screen name="Devoirs" component={Devoirs} />
              <Stack.Screen name="DevoirDetails" component={DevoirDetails} />
              <Stack.Screen name="DevoirEdit" component={DevoirEdit} />
              </>
            ) : (
              <>
              <Stack.Screen name="MenuPere" component={MenuPere} />
              <Stack.Screen name="HomeScreenPere" component={HomeScreenPere} />
              <Stack.Screen name="ProfilePere" component={ProfilePere} />
              <Stack.Screen name="PersonalInfoPere" component={PersonalInfoPere} />
              <Stack.Screen name="InfosPere" component={InfosPere} />
              <Stack.Screen name="RemarquesPere" component={RemarquesPere} />
              <Stack.Screen name="ChatsPere" component={ChatsPere} />
              <Stack.Screen name="NotesPere" component={NotesPere} />
              <Stack.Screen name="EmploiTempsPere" component={EmploiTempsPere} />
              <Stack.Screen name="DevoirsPere" component={DevoirsPere} />
              <Stack.Screen name="NotesPereDetails" component={NotesPereDetails} />
              <Stack.Screen name="ChatsPereDetails" component={ChatsPereDetails} />
              <Stack.Screen name="RemarquesPereDetails" component={RemarquesPereDetails} />
              <Stack.Screen name="DevoirsPereDetails" component={DevoirsPereDetails} />
              </>
            )
          ) : (
            <>
              <Stack.Screen name="onboarding" component={onboarding} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Signup" component={Signup} />
            </>
          )}
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </>
  );
}

export default App;
