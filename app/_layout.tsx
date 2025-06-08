import Toast from 'react-native-toast-message';
import { ContextProvider } from '@/utils/ContextProvider'
import { Jomhuria_400Regular, useFonts as useFontJomhuria } from '@expo-google-fonts/jomhuria';
import {
   Manrope_200ExtraLight, Manrope_300Light, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, 
   Manrope_700Bold, Manrope_800ExtraBold, useFonts as useFontManrope
} from '@expo-google-fonts/manrope';


import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
   const [fontLoadedJomhuria] = useFontJomhuria({Jomhuria_400Regular});
   const [fontLoadedManrope] = useFontManrope({
      Manrope_800ExtraBold, Manrope_700Bold, Manrope_600SemiBold, Manrope_500Medium, Manrope_400Regular, Manrope_300Light, Manrope_200ExtraLight
   });
   
   useEffect(() => {
      async function prepare() {
         if(fontLoadedJomhuria && fontLoadedManrope) {
            await SplashScreen.hideAsync()
         }
      }
      prepare()
   }, [fontLoadedJomhuria, fontLoadedManrope])
   
  if (!fontLoadedJomhuria || !fontLoadedManrope) {
      return null;
   }

return (
   <ContextProvider>
      <Stack>
         <Stack.Screen name="index" options={{ headerShown: false }} />
         <Stack.Screen name="Start" options={{ headerShown: false }} />
         <Stack.Screen name="Register" options={{ headerShown: false }} /> 
         <Stack.Screen name="Login" options={{ headerShown: false }} />
         <Stack.Screen name="BoardGame" options={{ headerShown: false }} />
         <Stack.Screen name="VerifyCode" options={{ headerShown: false }} /> 
         <Stack.Screen name="ResetPassword" options={{ headerShown: false }} /> 
         <Stack.Screen name="Lobby" options={{ headerShown: false }} />
         <Stack.Screen name="GamersGroup" options={{ headerShown: false }} />
         <Stack.Screen name="Dashboard" options={{ headerShown: false }} />
         <Stack.Screen name="Ranking" options={{ headerShown: false }} />
      </Stack>
      <Toast />
   </ContextProvider>
  );
}
