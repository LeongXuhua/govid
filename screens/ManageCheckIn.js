import React, { useState, useEffect} from 'react';
import { StyleSheet, Text, View, picker, SafeAreaView, ScrollView, Button, ActivityIndicator, TextInput} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';

import firebase from 'firebase';
import "firebase/firestore";
import 'firebase/firebase-storage';

import QrCodeScreen from './QrCode';

const ManageCheckInScreen = ({navigation}) =>{
  const [counter, setCounter]=useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [orgId, setOrgId]= useState();
  const [locations, setLocations] = useState([]);
  const [locationSelected, setLocationSelected] = useState();
  const [locationNew, setLocationNew] = useState();
  const [locationQrCode, setLocationQrCode] = useState();
  const [svg, setSvg] = useState();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const snapshot = await firebase.firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()

      const organisationId = await snapshot.data().organisationId;
      setOrgId(organisationId);
    }

    catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(()=>{
    const fetchLocation = async()=>{
    const locations =[];

    const snapshot2 = await firebase.firestore()
        .collection('organisations')
        .doc(orgId)
        .collection('locations').orderBy('name')
        .get()

    snapshot2.docs.map(function(doc){
            locations.push(
              {
                //add location fields into here
                name: doc.data().name,
                uid: doc.id,
              }
            )
          setLocations([...locations])
          setLocationSelected(doc.id)    
          setIsLoading(false)
        })
        
        
    setIsLoading(false)}
    fetchLocation();
  }, [orgId, counter])

  //get user id
  const userId = firebase.auth().currentUser.uid

  //add new location
  function addLocation(newLocation){
    if (locations.some(l => l.name === newLocation)){
      alert(newLocation+" is already in the list of locations");
    }else{
      firebase.firestore().collection("organisations")
                .doc(orgId)
                .collection('locations')
                .doc(newLocation)
                .set({
                    name:newLocation,
                });
      alert(newLocation+" has been succesfully added!")
      setCounter(counter+1)
    }
  }

  function getDataURL(){
    alert(svg)
    svg.toDataURL((url)=>{
      console.log(url)
    })
  }

  if (isLoading){
    return <ActivityIndicator />
  }
  return (
    <View style={styles.container}>

      <View style={styles.container}> 
        <Text> Add a location: </Text>
        <TextInput
          style= {styles.textInput}
          placeholder="new location"
          value={locationNew}
          onChangeText={(value)=>setLocationNew(value)}
                />
        <Button title="Add Location" onPress={()=>{addLocation(locationNew)}} color = "yellowgreen" />
      </View>


      <View style={styles.container}> 
        <Text> Select Location: </Text>
        <Picker
          selectedValue={locationSelected}
          placeholder='Select Location'
          onValueChange={(value, index)=>setLocationSelected(value)}
        >
        {locations.map((location)=>(
          <Picker.Item label={location.name} value={location.uid}/>
                ))}
        </Picker>
        <Button title="Generate QR Code" onPress={()=>{navigation.navigate('QrCode', {location: locationSelected})}} color = "yellowgreen" />
        {locationQrCode?[<QRCode value={locationQrCode} getRef={(ref) => (setSvg(ref))} />,
        <Button title="Save QR Code" onPress={()=>{getDataURL()}} color = "yellowgreen" />]:<Text/>}
      </View>
    </View>
      );
    };

export default ManageCheckInScreen;

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#d4e9ff',
        alignItems: 'center',
        justifyContent: 'center',
    },




  questionText: {
    color: "#000000",
    marginTop: 12,
    marginBottom: 8,
    fontSize: 18,
  
},

  buttonContainer: {
    marginTop: 30,
    marginBottom: 30,
  },

  textInput: {
    paddingLeft: 10,
    height: 40,
    padding: 10,
    color: 'grey',
},

  text: {
    marginTop: 10,
    marginLeft: 10,
},

    picker: {
        width: 150,
        height: 30,
        borderColor:'blue',
        color: 'red',
       
    }

});