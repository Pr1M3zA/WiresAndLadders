import { useContextProvider } from '@/utils/ContextProvider';
import Icon from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import Toast from 'react-native-toast-message';
import BottomDesign from '@/components/BottomDesign';
import Cube from '@/components/Cube';
import * as UIElemets from '@/utils/ui-elements.json';

export default function Login() {
   const router = useRouter();
   //const [layoutBottom, setLayoutBottom] = useState({x: 0, y: 0, width: 0, height: 0});
   const [showForgotPassword, setShowForgotPassword] = useState(false);
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
   const [identifier, setIdentifier] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const { setToken, apiURL } = useContextProvider();

   const loginUser = async () => {
      try {
         setLoading(true);
         const response = await fetch(apiURL + '/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               identifier: identifier,
               password: password,
            }),
         });
         const res = await response.json();
         if (res.hasOwnProperty('message')) 
            Toast.show({type: 'error', text1: 'Error', text2: `${res.message}`, position: 'top', visibilityTime: 3000 });           
         if (res.hasOwnProperty('token')){
            setToken(res.token);
            Toast.show({type: 'success', text1: 'Correcto', text2: `Acceso concedido`, position: 'top', visibilityTime: 2000 }); 
            router.replace('/Lobby');
         }
         else
            setToken('')
      } catch (error) {
         Toast.show({type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 });
      }
      finally {
         setLoading(false);
      }
   }

   const sendCode = async () => {
      setLoading(true);
      await fetch(apiURL + '/send-reset-code', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({
            identifier: identifier,
         }),
      })
      .then(response => response.json())
      .then(data => {
         //console.log(data)
         if (data.hasOwnProperty('email')) {
            Toast.show({type: 'success', text1: 'Correcto', text2: `Código enviado a ${data.email}`, position: 'top', visibilityTime: 3000 });
                        router.replace({
               pathname: '/VerifyCode',
               params: { identifier: identifier } 
            });
         }
         else 
            Toast.show({type: 'error', text1: 'Error', text2: `${data.message}`, position: 'top', visibilityTime: 30})   
      })
      .catch(error =>  Toast.show({type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 }));
      setLoading(false);
   }

   
   return (
      <View style={styles.container}>
         <View style={styles.topBarContainer}></View>
         <View style={styles.topContainer}>
            <View style={styles.backContainer}>
               <TouchableOpacity onPress={() => router.back()} style={{padding: 10}}>
                  <Icon name='arrow-left' size={40} color={'#6599C3'} />
               </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
               <Svg height='100%' width='100%'>
                     <G x={Dimensions.get('window').width*0.7/2-88} y={0} scale={1}>
                        <Cube  
                           x={0} y={0} scale={1}
                           colors={{faceUp: '#6599c3', faceLeft: '#78bdf6', faceRight: '#78bdf6', line: '#ffffff'}} 
                           lineWidth={1}
                        />
                        {UIElemets.start.circles.map((item, index) => {
                           return (<Circle {...item} key={index} />)
                        })}
                        <Rect x={0} y={105} width={275} height={40} fill='#ffffff'></Rect>
                     </G>
                  </Svg>
                  <Text style={styles.titleText}>Bienvenido</Text>            
            </View>
            <View style={styles.emptyContainer}></View>
         </View>

         {/* Conditional rendering based on showForgotPassword */}
         {!showForgotPassword ? (
            // Login Form
            <>
               <View style={styles.fieldsContainer}>
                  <TextInput placeholder="Nombre de usuario / Correo electrónico" placeholderTextColor={'#365C80'} value={identifier} onChangeText={setIdentifier} onEndEditing={() => setIdentifier(prev => prev.trim())}
                     style={[styles.fieldInput, identifier.length > 0 ? styles.fieldFilled : styles.fieldEmpty]}></TextInput>
                  
                  <View style={[styles.fieldInput, styles.fieldPassword]}>
                     <TextInput secureTextEntry={!isPasswordVisible} placeholder="Contraseña" placeholderTextColor={'#365C80'} value={password} onChangeText={setPassword}
                        style={[{flex: 1}, password.length > 0 ? styles.fieldFilled : styles.fieldEmpty]}/>
                        <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                           <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
                        </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.forgotPassButton} onPress={() => setShowForgotPassword(true)}>
                     <Text style={styles.forgotPassText}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
               </View>

               <View style={styles.buttonContainer}>
                  {loading && (<ActivityIndicator size='large' color="#6599C3"/>)}
                  {!loading && (<TouchableOpacity style={styles.loginButton} onPress={loginUser}>
                     <Text style={styles.loginText}>Entrar</Text>
                  </TouchableOpacity>)}
               </View>
            </>
         ) : (
            // Forgot Password - Enter Identifier Form
            <>
               <View style={styles.fieldsContainer}>
                  <Text style={styles.forgotPassTitle}>Recuperar Contraseña</Text>
                  <Text style={styles.forgotPassDescription}>Ingresa tu nombre de usuario o correo electrónico para recibir un código de verificación.</Text>
                  <TextInput placeholder="Nombre de usuario / Correo electrónico" placeholderTextColor={'#365C80'} value={identifier} onChangeText={setIdentifier} onEndEditing={() => setIdentifier(prev => prev.trim())}
                     style={[styles.fieldInput, identifier.length > 0 ? styles.fieldFilled : styles.fieldEmpty]}></TextInput>
               </View>
               <View style={styles.buttonContainer}>
                  {loading && (<ActivityIndicator size='large' color="#6599C3"/>)}
                  {!loading && (<TouchableOpacity style={styles.loginButton} onPress={sendCode}>
                     <Text style={styles.loginText}>Enviar Código</Text>
                     <Icon name={'mail'} size={24} color={'white'} />
                  </TouchableOpacity>)}
                  <TouchableOpacity style={styles.forgotPassButton} onPress={() => setShowForgotPassword(false)}>
                     <Text style={styles.forgotPassText}>Volver a Iniciar Sesión</Text>
                  </TouchableOpacity>
               </View>
            </>
         )}
         <BottomDesign allowRanking={false} />
      </View>
   )
}

const styles = StyleSheet.create({
   container:{
      flex: 1,
      //justifyContent: 'center',
      //marginTop: 50,
      alignItems: 'center',
      backgroundColor: '#6599C3',
   },
   topBarContainer: {
      flex: 5,
      backgroundColor: 'white',
      width: '100%',
      height: '100%',
   },
   titleContainer:{
      flex: 65,
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
   },
   topContainer:{
      flex: 25,
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      //borderColor: '#6599C3',
      //borderWidth: 2,
   },
   titleText:{
      fontSize: 55,
      color: '#6599c3',
      fontFamily: 'Jomhuria_400Regular',
      position: 'absolute',
      top: 80,
      textAlign: 'center',
   },
   fieldsContainer:{
      height: '100%',
      width: '100%',
      flex: 30,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: '7%',
      justifyContent: 'center',
      rowGap: 30,
      columnGap: 10,
      //borderColor: '#6599C3',
      //borderWidth: 2,

   },
   buttonContainer:{
      flex: 20,
      height: '100%',
      width: '100%',
      //alignItems: 'center',
      paddingHorizontal: '10%',
      justifyContent: 'flex-start',
      gap: 50,
      backgroundColor: '#FFFFFF',
      //borderColor: '#6599C3',
      //borderWidth: 2,
   },
   backContainer:{
      flex: 15
   },
   emptyContainer:{
      flex: 15
   },
   fieldInput:{
      backgroundColor: '#FFFFFF',
      borderWidth: 1.3,
      borderStyle: 'solid', 
      borderRadius: 10,  
      paddingHorizontal: 10,
   },
   fieldPassword:{
      flexDirection: 'row',
      alignItems: 'center',
   },
   fieldFilled:{
      fontFamily: 'Manrope_600SemiBold',
      color: '#365C80',
   },
   fieldEmpty:{
      fontFamily: 'Manrope_400Regular'
   },
   loginButton:{
      alignSelf: 'center',
      width: '70%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      backgroundColor: '#6599c3',
      borderRadius: 10,
      paddingInline: 10,
      borderColor: '#6599C3',
      borderWidth: 2,
   },
   loginText:{
      fontSize: 18,
      color: '#FFFFFF',
      fontFamily: 'Manrope_800ExtraBold'
   },
   forgotPassButton:{
      marginTop: -10,
      alignItems: 'flex-end',
   },
   forgotPassText:{
      fontSize: 12,
      color: '#365C80',
      fontFamily: 'Manrope_800ExtraBold',
      borderBottomColor: '#365C80',
      borderBottomWidth: 2
   },
   forgotPassTitle: {
      fontSize: 24,
      color: '#365C80',
      fontFamily: 'Manrope_700Bold',
      textAlign: 'center',
   },
   forgotPassDescription: {
      fontSize: 14,
      color: '#365C80',
      fontFamily: 'Manrope_400Regular',
      textAlign: 'center',
   }
})
