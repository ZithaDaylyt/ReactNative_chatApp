//b@refresh reset
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View,LogBox, TextInput, Button} from 'react-native';
import * as firebase from 'firebase';
import 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GiftedChat } from 'react-native-gifted-chat';


const firebaseConfig = {
  apiKey: "AIzaSyBt7PedYv81NQrIr4YiM8zHTjZvsohEhog",
  authDomain: "chat-app-e5a6c.firebaseapp.com",
  projectId: "chat-app-e5a6c",
  storageBucket: "chat-app-e5a6c.appspot.com",
  messagingSenderId: "1075013235880",
  appId: "1:1075013235880:web:2cf71c556106db95fa7e9d"
};
if(firebase.apps.length === 0){
  firebase.initializeApp(firebaseConfig);
}

// YellowBox.ignoreWarnings(['Setting a timer for a long period of time']);
//LogBox.ignoreAllLogs(); 

const db = firebase.firestore();
const chatsRef = db.collection('chats');

export default function App() {

  const [ user, setUser ] = useState(null);
  const  [name, setName ] = useState('');
  const [ messages, setMessages ] = useState([]);

  useEffect(()=>{
    readUser();
    const unsubscribe = chatsRef.onSnapshot(querySnapshot =>{
      const messagesFirestore = querySnapshot
            .docChanges()
            .filter(({type})=> type === 'added')
            .map(({doc})=>{
              const message = doc.data()
              return { ...message, createdAt: message.createdAt.toDate() }
            }).sort((a, b) => b.createdAt.getTime()- a.createdAt.getTime())
        appendMessages(messagesFirestore);
    })
    return () => unsubscribe();
  },[]);

  const appendMessages = useCallback((messages)=>{
    setMessages((prevMsgs)=>GiftedChat.append(prevMsgs,messages))
  },[messages]);

  async function readUser(){
    const user = await AsyncStorage.getItem('user')
    if(user){
      setUser(JSON.parse(user));
    }
  };
  async function handlePress(){
    const _id = Math.random().toString(36).substring(7);
    const user = { _id, name };
    await AsyncStorage.setItem('user',JSON.stringify(user));
    setUser(user)
  };
  
  async function handleSend (messages){
    const writes = messages.map( msg => chatsRef.add(msg))
    await Promise.all(writes)
  }

  if(!user){
    return (
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder='Enter your name' value={name} onChangeText={setName}/>
        <Button onPress={handlePress} title='Enter the chat'/>
      </View>
    )
  };
  return (
     <GiftedChat 
        messages={messages} 
        user={user}
        onSend={handleSend}
      />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding:30,
  },
  input:{
    height:50,
    width:'100%',
    borderWidth:1,
    marginBottom:20,
    padding:15,
    borderColor:'gray'
  }
});
