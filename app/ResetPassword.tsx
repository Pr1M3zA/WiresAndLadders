import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Icon from '@expo/vector-icons/Feather';
import { useContextProvider } from '@/utils/ContextProvider';
import BottomDesign from '@/components/BottomDesign';

export default function ResetPassword() {
   const router = useRouter();
   const params = useLocalSearchParams<{ verificationToken: string }>();
   const { apiURL } = useContextProvider();

   const verificationToken = params.verificationToken; // Token received from VerifyCode screen

   const [newPassword, setNewPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [isPasswordVisible, setIsPasswordVisible] = useState(false);
   const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
   const [loading, setLoading] = useState(false);
   const [errPassword, setErrPassword] = useState('');
   const [errConfirmPassword, setErrConfirmPassword] = useState('');

   const validatePassword = () => {
      const trimmedPassword = newPassword.trim();
      setNewPassword(trimmedPassword);
      if (trimmedPassword.length === 0) {
         setErrPassword('La nueva contraseña es requerida.');
      } else if (trimmedPassword.length < 8) {
         setErrPassword('La contraseña debe tener al menos 8 caracteres.');
      } else if (trimmedPassword.length > 20) {
         setErrPassword('La contraseña no puede tener más de 20 caracteres.');
      } else {
         // Example regex: at least one uppercase, one lowercase, one number
         const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
         if (!regex.test(trimmedPassword)) {
            setErrPassword('Debe contener mayúscula, minúscula y número.');
         } else {
            setErrPassword('');
         }
      }
      // Also re-validate confirm password if new password changes
      if (confirmPassword.length > 0) {
         validateConfirmPassword(trimmedPassword, confirmPassword.trim());
      }
   };

   const validateConfirmPassword = (passwordToMatch = newPassword.trim(), confirmPasswordValue = confirmPassword.trim()) => {
      setConfirmPassword(confirmPasswordValue);
      if (confirmPasswordValue.length === 0) {
         setErrConfirmPassword('Confirma tu nueva contraseña.');
      } else if (confirmPasswordValue !== passwordToMatch) {
         setErrConfirmPassword('Las contraseñas no coinciden.');
      } else {
         setErrConfirmPassword('');
      }
   };

   const resetPassword = async () => {
      setLoading(true);
      await fetch(apiURL + '/reset-password', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'authorization': verificationToken,
            },
            body: JSON.stringify({
               newPassword: newPassword.trim(),
            }),
         })
         .then(response => response.json())
         .then(data => {
            if (data.hasOwnProperty('affectedRows') && data.affectedRows > 0) {
               Toast.show({ type: 'success', text1: 'Correcto', text2: 'Contraseña restablecida con éxito.', position: 'top', visibilityTime: 3000 });
               router.replace('/Login');
            }
            else
               Toast.show({ type: 'error', text1: 'Error', text2: data.message, position: 'top', visibilityTime: 3000 });
         })
         .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: `${error}`, position: 'top', visibilityTime: 3000 }));
      setLoading(false);
   } 


   // Determine if the reset button should be active
   const isButtonActive = newPassword.trim().length > 0 && confirmPassword.trim().length > 0 && !errPassword && !errConfirmPassword;

   return (
      <View style={styles.container}>
         <View style={styles.topBarContainer}></View>
         <View style={styles.topContainer}>
            <View style={styles.backContainer}>
               {/* Maybe go back to login or a specific screen, not just previous */}
               <TouchableOpacity onPress={() => router.replace('/Login')} style={{ padding: 10 }}>
                  <Icon name='arrow-left' size={40} color={'#6599C3'} />
               </TouchableOpacity>
            </View>
            <View style={styles.titleContainer}>
               <Text style={styles.titleText}>Nueva Contraseña</Text>
            </View>
            <View style={styles.emptyContainer}></View>
         </View>

         <View style={styles.contentContainer}>
            <Text style={styles.descriptionText}>
               Ingresa y confirma tu nueva contraseña.
            </Text>

            <View>
               <View style={[styles.fieldInput, styles.fieldPassword, errPassword ? styles.fieldError : (newPassword.length > 0 ? styles.fieldOk : styles.fieldEmptyBorder)]}>
                  <TextInput
                     secureTextEntry={!isPasswordVisible}
                     placeholder="Nueva Contraseña"
                     placeholderTextColor={'#365C80'}
                     value={newPassword}
                     onChangeText={setNewPassword}
                     onEndEditing={validatePassword}
                     style={[{ flex: 1 }, newPassword.length > 0 ? styles.fieldFilled : styles.fieldEmpty]}
                  />
                  <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                     <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
                  </TouchableOpacity>
               </View>
               {errPassword ? <Text style={styles.errText}>{errPassword}</Text> : <Text style={styles.errText}> </Text>}
            </View>

            <View>
               <View style={[styles.fieldInput, styles.fieldPassword, errConfirmPassword ? styles.fieldError : (confirmPassword.length > 0 ? styles.fieldOk : styles.fieldEmptyBorder)]}>
                  <TextInput
                     secureTextEntry={!isConfirmPasswordVisible}
                     placeholder="Confirmar Contraseña"
                     placeholderTextColor={'#365C80'}
                     value={confirmPassword}
                     onChangeText={setConfirmPassword}
                     onEndEditing={() => validateConfirmPassword()} // Use default params
                     style={[{ flex: 1 }, confirmPassword.length > 0 ? styles.fieldFilled : styles.fieldEmpty]}
                  />
                  <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                     <Icon name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color={'#6599C3'} />
                  </TouchableOpacity>
               </View>
               {errConfirmPassword ? <Text style={styles.errText}>{errConfirmPassword}</Text> : <Text style={styles.errText}> </Text>}
            </View>

         </View>

         <View style={styles.buttonContainer}>
            {loading && (<ActivityIndicator size='large' color="#6599C3" />)}
            {!loading && (<TouchableOpacity style={[styles.resetButton, !isButtonActive && styles.buttonDisabled]} onPress={resetPassword} disabled={!isButtonActive}>
               <Text style={styles.resetText}>Restablecer Contraseña</Text>
            </TouchableOpacity>)}
         </View>

         <BottomDesign allowRanking={false}/>
        
      </View>
   );
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
      flex: 10,
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
   },
   backContainer: {
      flex: 1,
      justifyContent: 'center',
   },
   titleContainer: {
      flex: 3,
      alignItems: 'center',
   },
   titleText: {
      fontSize: 28,
      color: '#6599c3',
      fontFamily: 'Manrope_700Bold',
      textAlign: 'center',
   },
   emptyContainer: {
      flex: 1,
   },
   contentContainer: {
      flex: 50,
      backgroundColor: '#FFFFFF',
      paddingHorizontal: '7%',
      justifyContent: 'center',
      rowGap: 20, // Space between password fields
   },
   descriptionText: {
      fontSize: 16,
      color: '#365C80',
      fontFamily: 'Manrope_400Regular',
      textAlign: 'center',
      marginBottom: 10, // Space before fields
   },
   fieldInput: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1.3,
      borderStyle: 'solid',
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 50, // Standard height
      justifyContent: 'center', // Center content vertically
   },
   fieldPassword: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   fieldFilled: {
      fontFamily: 'Manrope_600SemiBold',
      color: '#365C80',
   },
   fieldEmpty: {
      fontFamily: 'Manrope_400Regular',
   },
   fieldOk: {
      borderColor: '#294270', // Greenish/Blueish border for valid
   },
   fieldError: {
      borderColor: '#B05151', // Red border for error
   },
   fieldEmptyBorder: {
       borderColor: '#cccccc', // Grey border when empty and no error
   },
   errText: {
      fontSize: 11,
      color: '#B05151',
      alignSelf: 'flex-start',
      marginLeft: 10,
      marginTop: 5,
      minHeight: 15, // Reserve space to prevent layout shifts
   },
   buttonContainer: {
      flex: 15,
      paddingHorizontal: '10%',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
   },
   resetButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#6599c3',
      borderRadius: 10,
      paddingVertical: 12,
      borderColor: '#6599C3',
      borderWidth: 2,
   },
   buttonDisabled: {
       backgroundColor: '#B0C4DE', // Lighter color when disabled
       borderColor: '#B0C4DE',
   },
   resetText: {
      fontSize: 18,
      color: '#FFFFFF',
      fontFamily: 'Manrope_800ExtraBold',
   },
});