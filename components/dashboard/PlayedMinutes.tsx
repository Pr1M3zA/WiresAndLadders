import { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { useContextProvider } from '@/utils/ContextProvider';

const PlayedMinutes = () => {
   const [playedMinutes, setPlayedMinutes] = useState(0);
   const [dataLoaded, setDataLoaded] = useState(false);
   const { apiURL } = useContextProvider();

   useEffect(() => {
      getPlayedMinutes();
   }, []);

   const getPlayedMinutes = async () => {
      await fetch(apiURL + '/dashboard/played-minutes')
         .then(response => response.json())
         .then(data => {
            setPlayedMinutes(data[0].played_minutes)
            setDataLoaded(true)
         })
         .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: `${error}` }))
   };

   return (
      <View style={styles.container}>
         {!dataLoaded && <Text>Loading...</Text>}
         {dataLoaded && <View style={{rowGap: 3}}>
            <Text style={styles.textMini}>En partidas terminadas, el total de</Text>
            <View style={{backgroundColor: 'steelblue'}}>
               <Text style={styles.textMedium}>Minutos Jugados</Text>
            </View>
            <Text style={styles.textMini}>acumulados es</Text>
            <Text style={styles.textBig}>{playedMinutes}</Text>
            
         </View>}
      </View>
   )
}

const styles = StyleSheet.create({
   container: {
      //flex: 1,
      padding: 5,
      alignItems: 'center',
      justifyContent: 'flex-start',
      backgroundColor: 'azure',
      borderRadius: 10,
      width: '100%',
      borderColor: 'steelblue',
      borderWidth: 2,
   },
   textMini: {
      fontSize: 12,
      fontFamily: 'Manrope_400Regular',
      color: 'midnightblue',
      textAlign: 'center',
      includeFontPadding: false,
   },
   textMedium: {
      fontSize: 18,
      fontFamily: 'Manrope_800ExtraBold',
      color: 'white',
      textAlign: 'center',
      includeFontPadding: false,
   },
   textBig: {
      fontSize: 24,
      fontFamily: 'Manrope_800ExtraBold',
      color: 'steelblue',
      textAlign: 'center',
      includeFontPadding: false,
   },
   detailContainer: {
      flexDirection: 'row',
      width: '100%',
      //paddingInline: 5,
      columnGap: 5,
      marginBottom: 6,      
   },
   bigNumberContainer: {
      flex: 4, 
      backgroundColor: 'ghostwhite',
      borderColor: 'steelblue', 
      borderRadius: 20, 
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
   },


})

export default PlayedMinutes;