import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { collection, query, where, getDocs, doc, getDoc, onSnapshot, setDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { firestore, auth } from "../../firebase/firebase";
import { GiftedChat } from 'react-native-gifted-chat';

function ChatsDetails() {
  const route = useRoute();
  const { profId } = route.params;

  const [professor, setProfessor] = useState(null);
  const [profEmail, setProfEmail] = useState(null); // State to store professor's email
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchProfessor = async () => {
      try {
        const q = query(collection(firestore, "users"), where("role", "==", "Professeur"), where("profId", "==", profId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const profData = querySnapshot.docs[0].data();
          setProfessor({ id: querySnapshot.docs[0].id, ...profData });
          setProfEmail(profData.email); // Set the professor's email
          return profData.email;
        } else {
          setError("No professor found with the given ID.");
          return null;
        }
      } catch (err) {
        console.error("Error fetching professor: ", err);
        setError("Failed to fetch professor. Please try again.");
        return null;
      }
    };

    const fetchCurrentUserEmail = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
          if (userDoc.exists()) {
            setCurrentUserEmail(userDoc.data().email);
            return userDoc.data().email;
          } else {
            console.log("Current user document not found");
            return null;
          }
        }
      } catch (err) {
        console.error("Error fetching current user email: ", err);
        setError("Failed to fetch current user email. Please try again.");
        return null;
      }
    };

    const fetchData = async () => {
      const profEmail = await fetchProfessor();
      const userEmail = await fetchCurrentUserEmail();

      if (profEmail && userEmail) {
        const sortedEmails = [profEmail, userEmail].sort();
        setChatId(sortedEmails.join('_'));
      }

      setLoading(false);
    };

    fetchData();
  }, [profId]);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = () => {
      const chatDocRef = doc(firestore, `chats/${chatId}`);
      const unsubscribe = onSnapshot(chatDocRef, docSnapshot => {
        if (docSnapshot.exists()) {
          const chatData = docSnapshot.data();
          const fetchedMessages = chatData.messages.map(message => ({
            _id: message._id,
            createdAt: message.createdAt.toDate(),
            text: message.text,
            user: message.user,
            status: message.status,
          }));
          setMessages(fetchedMessages.reverse());

          // Update the status of messages sent by the professor to 'Lu'
          const updatedMessages = chatData.messages.map(message => ({
            ...message,
            status: message.user.email === profEmail ? 'Lu' : message.status
          }));
          updateDoc(chatDocRef, { messages: updatedMessages });
        }
      });

      return unsubscribe;
    };

    const unsubscribe = fetchMessages();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [chatId, profEmail]);

  const onSend = useCallback((newMessages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const chatDocRef = doc(firestore, `chats/${chatId}`);
    newMessages.forEach(async message => {
      const messageData = {
        _id: message._id,
        createdAt: message.createdAt,
        text: message.text,
        user: {
          ...message.user,
          email: currentUserEmail,
        },
        chatId,
        profId,
        status: 'Non Lu', // Always set to 'Non Lu' when a new message is sent
      };

      try {
        const chatSnapshot = await getDoc(chatDocRef);
        let chatData = {};
        if (chatSnapshot.exists()) {
          chatData = chatSnapshot.data();
        }
        await setDoc(chatDocRef, { messages: arrayUnion(messageData) }, { merge: true });
        await updateDoc(chatDocRef, { unreadCount: (chatData.unreadCount || 0) + 1 });
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    });
  }, [chatId, currentUserEmail]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {professor && (
        <View style={styles.header}>
          <Text style={styles.profName}>{`${professor.name} ${professor.lastName}`}</Text>
        </View>
      )}
      <View style={styles.separator} />
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: currentUserEmail,
        }}
        renderAvatar={null}
        inverted={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profName: {
    marginLeft: 10,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 10,
    width: '100%',
  },
});

export default ChatsDetails;
