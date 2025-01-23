import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { collection, query, where, getDocs, onSnapshot, doc, setDoc, arrayUnion } from 'firebase/firestore';
import { auth, firestore } from '../../firebase/firebase';
import { GiftedChat } from 'react-native-gifted-chat';

const MessagesDetails = () => {
  const route = useRoute();
  const { student, profId } = route.params;

  const [studentEmail, setStudentEmail] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUserEmail(user.email);
      }
    };

    const fetchStudentEmail = async (studentId) => {
      try {
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('studentId', '==', studentId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          const studentData = studentDoc.data();
          setStudentEmail(studentData.email);
        }
      } catch (error) {
        console.error('Error fetching student email:', error);
      }
    };

    fetchCurrentUser();

    if (student?.id) {
      fetchStudentEmail(student.id);
    } else {
      console.error('Student ID is missing');
    }
  }, [student]);

  useEffect(() => {
    if (currentUserEmail && studentEmail) {
      const sortedEmails = [currentUserEmail, studentEmail].sort();
      setChatId(sortedEmails.join('_'));
    }
  }, [currentUserEmail, studentEmail]);

  useLayoutEffect(() => {
    if (!chatId) return;

    const fetchMessages = () => {
      const chatDocRef = doc(firestore, `chats/${chatId}`);
      const unsubscribe = onSnapshot(chatDocRef, async (docSnapshot) => {
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

          // Update the status of all messages sent by the student to 'Lu'
          const updatedMessages = chatData.messages.map(message => ({
            ...message,
            status: message.user.email === studentEmail ? 'Lu' : message.status
          }));
          await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });
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
  }, [chatId, studentEmail]);

  const onSend = useCallback(async (messages = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages)
    );

    const message = messages[0];
    const messageData = {
      _id: message._id,
      createdAt: message.createdAt,
      text: message.text,
      user: {
        ...message.user,
        email: currentUserEmail,
      },
      chatId,
      studentFullName: `${student.name} ${student.lastName}`,
      studentId: student.id,
      profId,
      status: 'Non Lu', // Always set to 'Non Lu' when a new message is sent
    };

    const chatDocRef = doc(firestore, `chats/${chatId}`);
    try {
      await setDoc(chatDocRef, { messages: arrayUnion(messageData) }, { merge: true });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [currentUserEmail, chatId, student, profId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.studentName}>{student ? `${student.name} ${student.lastName}` : 'Student not found'}</Text>
      </View>
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={messages => onSend(messages)}
          user={{
            _id: currentUserEmail,
          }}
          renderAvatar={() => null}  // Hide avatar
          renderUsernameOnMessage={true}
          inverted={true}  // Invert the order to show recent messages at the bottom
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ebf3f3',
  },
  header: {
    width: '100%',
    top: 20,
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    width: '100%',
  },
});

export default MessagesDetails;
