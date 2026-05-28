import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [inputText, setInputText] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    // Firestore'daki 'messages' koleksiyonunu tarihe göre sıralı şekilde dinle
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArray = [];
      querySnapshot.forEach((doc) => {
        messagesArray.push({ id: doc.id, ...doc.data() });
      });
      setNotes(messagesArray);
    }, (error) => {
      console.error("Veri çekme hatası: ", error);
    });

    // Bileşen ekrandan kalktığında dinleyiciyi temizle
    return () => unsubscribe();
  }, []);

  // Yeni Veri Ekleme ve Güncelleme
  const handleSave = async () => {
    if (inputText.trim() === '') return;

    try {
      if (editingId) {
        // Güncelleme işlemi
        const noteRef = doc(db, "messages", editingId);
        await updateDoc(noteRef, { 
          message: inputText 
        });
        setEditingId(null);
      } else {
        // Yeni kayıt ekleme işlemi
        await addDoc(collection(db, "messages"), {
          message: inputText,
          createdAt: serverTimestamp() // Firestore sunucu zamanını baz alır
        });
      }
      setInputText('');
    } catch (error) {
      Alert.alert("Hata", "İşlem sırasında bir hata oluştu: " + error.message);
    }
  };

  // Veri Silme
  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (error) {
      Alert.alert("Hata", "Silme işlemi başarısız: " + error.message);
    }
  };

  // Düzenleme moduna geçiş
  const editNote = (item) => {
    setInputText(item.message);
    setEditingId(item.id);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.messageText}>{item.message}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => editNote(item)} style={styles.editButton}>
          <Text style={styles.buttonText}>Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteNote(item.id)} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Text style={styles.headerTitle}>Günün Mesajları (Firebase)</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Yeni bir not veya mesaj yazın..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{editingId ? 'Güncelle' : 'Ekle'}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Stiller SQLite versiyonu ile birebir aynı kalarak görsel bütünlüğü korur
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', 
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  input: {
    color: '#fff',
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#4a90e2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  messageText: {
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12, 
  },
  editButton: {
    backgroundColor: '#404040',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: '#e53935',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});