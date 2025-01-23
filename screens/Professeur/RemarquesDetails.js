import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';

const RemarquesDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId, classId, profId, matiereId, student } = route.params;

  const [remark, setRemark] = useState('');
  const [matiereNom, setMatiereNom] = useState('');
  const [profNom, setProfNom] = useState('');
  const [profPrenom, setProfPrenom] = useState('');
  const [remarks, setRemarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [editingRemarkText, setEditingRemarkText] = useState('');
  const [inputHeight, setInputHeight] = useState(40);

  useEffect(() => {
    if (userId && classId && profId && matiereId && student?.id) {
      fetchSubjectAndProfName();
      fetchExistingRemarks();
    } else {
      console.error('Missing required parameters:', {
        userId,
        classId,
        profId,
        matiereId,
        studentId: student?.id
      });
    }
  }, [userId, classId, profId, matiereId, student]);

  const fetchSubjectAndProfName = async () => {
    try {
      const profMatiereRef = collection(firestore, `Classes/${userId}/ClassesIds/${classId}/ProfClasseProfsMatieres`);
      const q = query(profMatiereRef, where('matiereId', '==', matiereId), where('profId', '==', profId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        setMatiereNom(data.matiereNom || '');
        setProfNom(data.profNom || '');
        setProfPrenom(data.profPrenom || '');
      });
    } catch (error) {
      console.error('Error fetching subject and prof name:', error);
    }
  };

  const fetchExistingRemarks = async () => {
    try {
      const remarksRef = collection(firestore, 'Remarques');
      const q = query(remarksRef, where('studentId', '==', student.id), where('matiereId', '==', matiereId), where('profId', '==', profId));
      const querySnapshot = await getDocs(q);
      const fetchedRemarks = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedRemarks.push({ id: doc.id, ...data });
      });
      setRemarks(fetchedRemarks);
    } catch (error) {
      console.error('Error fetching existing remarks:', error);
    }
  };

  const saveRemark = async () => {
    setLoading(true);
    try {
      const remarksData = {
        studentId: student.id,
        classId,
        matiereId,
        profId,
        studentFullName: `${student.name} ${student.lastName}`,
        matiereNom,
        profNom,
        profPrenom,
        remark,
        status: 'Non Lu', // Add status field
        created_at: new Date(), // Add created_at field
      };

      const remarksRef = collection(firestore, 'Remarques');
      const docRef = await addDoc(remarksRef, remarksData);
      setRemarks((prev) => [...prev, { id: docRef.id, ...remarksData }]);

      // Create a notification
      const notificationsRef = collection(firestore, 'Notifications');
      const notificationData = {
        studentId: student.id,
        message: `New remark added for ${student.name} in ${matiereNom}.`,
        timestamp: new Date(),
        read: false,
      };
      await addDoc(notificationsRef, notificationData);

      setRemark('');
      setInputHeight(40);
      Alert.alert('Success', 'Remark saved and notification sent successfully!');
    } catch (error) {
      console.error('Error saving remark and creating notification:', error);
      Alert.alert('Error', 'Failed to save remark and create notification.');
    } finally {
      setLoading(false);
    }
  };

  const updateRemark = async (remarkId) => {
    setLoading(true);
    try {
      const remarkDoc = doc(firestore, 'Remarques', remarkId);
      await updateDoc(remarkDoc, { remark: editingRemarkText });
      setRemarks((prev) => prev.map((r) => (r.id === remarkId ? { ...r, remark: editingRemarkText } : r)));
      setEditingRemarkId(null);
      setEditingRemarkText('');
      Alert.alert('Success', 'Remark updated successfully!');
    } catch (error) {
      console.error('Error updating remark:', error);
      Alert.alert('Error', 'Failed to update remark.');
    } finally {
      setLoading(false);
    }
  };

  const deleteRemark = async (remarkId) => {
    setLoading(true);
    try {
      const remarkDoc = doc(firestore, 'Remarques', remarkId);
      await deleteDoc(remarkDoc);
      setRemarks((prev) => prev.filter((r) => r.id !== remarkId));
      Alert.alert('Success', 'Remark deleted successfully!');
    } catch (error) {
      console.error('Error deleting remark:', error);
      Alert.alert('Error', 'Failed to delete remark.');
    } finally {
      setLoading(false);
    }
  };

  const handleContentSizeChange = (contentWidth, contentHeight) => {
    setInputHeight(contentHeight > 40 ? contentHeight : 40); // Set height to content height or minimum 40
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.studentName}>{student ? `${student.name} ${student.lastName}` : 'Student not found'}</Text>
        <Text style={styles.subject}>{`Matière: ${matiereNom}`}</Text>
      </View>
      {loading && <ActivityIndicator size="large" color="#3B82F6" style={styles.spinner} />}
      {remarks.length > 0 && (
        <View style={styles.remarksContainer}>
          {remarks.map((remark) => (
            <View key={remark.id} style={styles.remarkItem}>
              {editingRemarkId === remark.id ? (
                <>
                  <TextInput
                    style={[styles.editInput, { height: Math.max(40, inputHeight) }]} // Dynamic height adjustment
                    value={editingRemarkText}
                    onChangeText={setEditingRemarkText}
                    multiline={true}
                    autoFocus={true}
                    onContentSizeChange={(e) => handleContentSizeChange(e.nativeEvent.contentSize.width, e.nativeEvent.contentSize.height)}
                  />
                  <View style={styles.actions}>
                    <Button title="Save" onPress={() => updateRemark(remark.id)} />
                    <Button title="Cancel" onPress={() => { setEditingRemarkId(null); setEditingRemarkText(''); }} />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.remarkText}>{remark.remark}</Text>
                  <Text style={styles.remarkStatus}>Status: {remark.status}</Text>
                  <Text style={styles.remarkDate}>Created At: {new Date(remark.created_at.seconds * 1000).toLocaleString()}</Text>
                  <View style={styles.iconContainer}>
                    <TouchableOpacity onPress={() => { setEditingRemarkId(remark.id); setEditingRemarkText(remark.remark); }}>
                      <Icon name="edit" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteRemark(remark.id)} style={styles.icon}>
                      <Icon name="trash" size={24} color="#000" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      )}
      <TextInput
        style={[styles.input, { height: Math.max(40, inputHeight) }]} // Dynamic height adjustment
        placeholder="Enter Remark"
        value={remark}
        onChangeText={setRemark}
        multiline={true}
        onContentSizeChange={(e) => handleContentSizeChange(e.nativeEvent.contentSize.width, e.nativeEvent.contentSize.height)}
      />
      <View style={styles.buttonContainer}>
        <Button title="Enregistrer" onPress={saveRemark} disabled={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ebf3f3',
  },
  header: {
    width: '100%',
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
  subject: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  remarksContainer: {
    width: '100%',
    marginBottom: 20,
  },
  remarkItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  remarkText: {
    fontSize: 16,
    marginBottom: 10,
  },
  remarkStatus: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#777',
    marginBottom: 10,
  },
  remarkDate: {
    fontSize: 14,
    color: '#777',
    marginBottom: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginBottom: 20,
    textAlignVertical: 'top', // Ensure text starts at the top
  },
  editInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    textAlignVertical: 'top', // Ensure text starts at the top
  },
  buttonContainer: {
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  spinner: {
    marginTop: 20,
  },
});

export default RemarquesDetails;
