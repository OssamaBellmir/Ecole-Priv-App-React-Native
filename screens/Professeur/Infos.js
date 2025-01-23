import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Divider, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

function Infos() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.content}>
          <Text style={styles.title}>INFORMATIONS ( 1 )</Text>
          <Divider style={styles.titleDivider} />
          <Text style={styles.subtitle}>Bonne et Heureuse Année 2024</Text>
          <View style={styles.messageContainer}>
            <Text style={styles.messageQuote}>
              <Text style={styles.quoteMark}>"</Text>
              Une bonne éducation est le plus grand bien que vous puissiez
              laisser à vos enfants
              <Text style={styles.quoteMark}>"</Text>
            </Text>
            <Text style={styles.message}>
              C'est avec cette citation de Laurent Bordelon que toute l'équipe
              de Webecole vous remercie pour votre collaboration à travers
              l'utilisation de l'application Webecole pour un meilleur suivi de
              vos enfants. En ces premières heures de la nouvelle année,
              recevez tous nos vœux de bonheur, de santé et de prospérité pour
              cette année 2024 qui commence. Qu’elle soit synonyme d’une
              collaboration toujours aussi agréable entre nous. Et qu’elle vous
              apporte à titre personnel plein de joie à votre famille et vous.
              Très bonne année.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0", // Adjust the background color as needed
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#000", // Adjust the header background color as needed
  },
  headerTitle: {
    color: "#E74C3C", // Adjust the header title color as needed
    fontSize: 20,
    fontWeight: "bold",
  },
  menuIcon: {
    color: "#fff",
  },
  profileIcon: {
    color: "#fff",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  titleDivider: {
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  messageContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderColor: "#E74C3C", // Adjust the border color as needed
    borderWidth: 4,
  },
  messageQuote: {
    fontSize: 18,
    fontStyle: "italic",
    marginBottom: 16,
  },
  quoteMark: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E74C3C",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Infos;
