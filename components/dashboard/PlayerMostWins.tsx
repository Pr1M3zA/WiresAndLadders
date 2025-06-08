import { useEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { useContextProvider } from '@/utils/ContextProvider';

type topPlayerWins = {
   userName: string;
   totWins: number;
}

const PlayerMostWins = () => {
   const [topPlayer, setTopPlayer] = useState<topPlayerWins | null>(null);
   const [dataLoaded, setDataLoaded] = useState(false);
   const { apiURL } = useContextProvider();

   useEffect(() => {
      getPlayerMostWins();
   }, []);

   const getPlayerMostWins = async () => {
      await fetch(apiURL + '/dashboard/top-wins/1')
         .then(response => response.json())
         .then(data => {
            setTopPlayer(data[0])
            setDataLoaded(true)
         })
         .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: `${error}` }))
   };

   return (
      <View style={styles.container}>
         {!dataLoaded && <Text>Loading...</Text>}
         {dataLoaded && <View style={{rowGap: 5}}>
            <View style={{backgroundColor: 'steelblue'}}>
               <Text style={styles.textMedium} numberOfLines={1}>{topPlayer?.userName}</Text>
            </View>
            <View style={styles.detailContainer}>
               <View style={{ flex: 6, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={styles.textMini}>es el jugador con mas victorias, con:</Text>
               </View>
               <View style={styles.bigNumberContainer}>
                  <Text style={styles.textBig}>{topPlayer?.totWins}</Text>
               </View>
            </View>
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

export default PlayerMostWins;