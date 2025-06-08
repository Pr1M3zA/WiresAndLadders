import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Icon from '@expo/vector-icons/MaterialIcons'; 
import { useContextProvider } from '@/utils/ContextProvider';
import BottomDesign from '@/components/BottomDesign';

export default function VerifyCode() {
   const router = useRouter();
   const params = useLocalSearchParams<{ identifier: string }>();
   const { apiURL } = useContextProvider();

   const identifier = params.identifier; // Username or Email
   const [code, setCode] = useState('');
   const [loading, setLoading] = useState(false);

   const verifyCode = async () => {
      Keyboard.dismiss(); // Hide keyboard
      setLoading(true);
      await fetch(apiURL + '/verify-reset-code', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            identifier: identifier,
            code: code,
         }),
      })
         .then(response => response.json())
         .then(data => {
            if (data.hasOwnProperty('token')) {
               Toast.show({ type: 'success', text1: 'Correcto', text2: 'Código verificado con éxito.', position: 'top', visibilityTime: 2000 });
               router.replace({
                  pathname: '/ResetPassword',
                  params: { verificationToken: data.token } // 
               });
            }
            else
               Toast.show({ type: 'error', text1: 'Error', text2: `${data.message}`, position: 'top', visibilityTime: 3000 });
         })
         .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 }));
      setLoading(false);
   }



   return (
      <View style={styles.container}>
         <View style={styles.topBarContainer}></View>
         <View style={styles.topContainer}>
            <View style={styles.backContainer}>
               <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
                  <Icon name='close' size={40} color={'#6599C3'} />
               </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
               <Text style={styles.titleText}>Verificar Código</Text>
            </View>
            <View style={styles.emptyContainer}></View>
         </View>

         <View style={styles.contentContainer}>
            <Text style={styles.descriptionText}>
               Hemos enviado un código de 5 letras mayúsculas a tu correo electrónico.
               Por favor, ingrésalo a continuación:
            </Text>

            <View style={styles.singleCodeInputContainer}>
               <TextInput
                  style={styles.singleCodeInputBox}
                  value={code}
                  onChangeText={(text) => setCode(text.toUpperCase())} // Convertir a mayúsculas directamente
                  maxLength={5}
                  keyboardType="default"
                  autoCapitalize="characters" // Asegura mayúsculas
                  textAlign="center"
                  caretHidden={true} // Hide cursor
               />
            </View>

            <TouchableOpacity style={styles.resendButton}>
               <Text style={styles.resendText}>Reenviar Código</Text>
            </TouchableOpacity>

         </View>

         <View style={styles.buttonContainer}>
            {loading && (<ActivityIndicator size='large' color="#6599C3" />)}
            {!loading && (<TouchableOpacity style={[styles.verifyButton, code.length !== 5 && styles.buttonDisabled]} onPress={verifyCode} disabled={code.length !== 5}>
               <Text style={styles.verifyText}>Verificar</Text>
            </TouchableOpacity>)}
         </View>

         <BottomDesign allowRanking={false}/>

      </View>
   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#6599C3',
   },
   topBarContainer: {
      flex: 5, 
      backgroundColor: 'white',
   },
   topContainer: {
      flex: 15, 
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
   },
   backContainer: {
      flex: 10,
      justifyContent: 'center',
   },
   titleContainer: {
      flex: 30,
      alignItems: 'center',
   },
   titleText: {
      fontSize: 28, 
      color: '#6599c3',
      fontFamily: 'Manrope_700Bold', 
      textAlign: 'center',
   },
   emptyContainer: {
      flex: 10,
   },
   contentContainer: {
      flex: 60, 
      backgroundColor: '#FFFFFF',
      paddingHorizontal: '7%',
      justifyContent: 'center',
      alignItems: 'center',
      rowGap: 30, 
   },
   descriptionText: {
      fontSize: 16,
      color: '#365C80',
      fontFamily: 'Manrope_400Regular',
      textAlign: 'center',
      marginBottom: 20,
   },
   singleCodeInputContainer: { 
      width: '100%',
      maxWidth: 300, 
      alignItems: 'center', 
   },
   singleCodeInputBox: { 
      width: '80%', 
      height: 60,
      borderWidth: 2,
      borderColor: '#6599C3',
      borderRadius: 8,
      fontSize: 30,
      letterSpacing: 10, // Espacio entre letras para simular casillas
      paddingHorizontal: 10, // Añadir padding horizontal
      fontFamily: 'Manrope_800ExtraBold',
      color: '#365C80',
      padding: 0, // Remove default padding
      textAlignVertical: 'center', // Center text vertically
   },
   resendButton: {
      marginTop: 10,
   },
   resendText: {
      fontSize: 14,
      color: '#365C80',
      fontFamily: 'Manrope_800ExtraBold',
      borderBottomColor: '#365C80',
      borderBottomWidth: 1, // Slightly thinner underline
   },
   buttonContainer: {
      flex: 15, // Button area
      paddingHorizontal: '10%',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
   },
   verifyButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6599c3',
      borderRadius: 10,
      paddingVertical: 12, // Adjusted padding
      borderColor: '#6599C3',
      borderWidth: 2,
   },
   buttonDisabled: { // Estilo para botón deshabilitado
      backgroundColor: '#B0C4DE',
      borderColor: '#B0C4DE',
   },
   verifyText: {
      fontSize: 18,
      color: '#FFFFFF',
      fontFamily: 'Manrope_800ExtraBold',
   },
});