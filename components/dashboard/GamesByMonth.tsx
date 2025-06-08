import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { BarChart } from "react-native-gifted-charts";
import { useContextProvider } from '@/utils/ContextProvider';

type graphData = {
   value: number;
   label: string;
   text: string;
}

const GamesByMonth = () => {
   const [gamesByMonth, setGamesByMonth] = useState<graphData[]>([]);
   const [dataLoaded, setDataLoaded] = useState(false);
   const [maxValue, setMaxValue] = useState(0);
   const { apiURL } = useContextProvider();
   const { width } = Dimensions.get('window')

   useEffect(() => {
      getGamesByPlatform();
   }, []);

   const getGamesByPlatform = async () => {
      const monthOfYear = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      await fetch(apiURL + '/dashboard/games-by-month')
         .then(response => response.json())
         .then(data => {
            const dataGraph: graphData[] = data.map((item: any, index: number) => ({ ...item, label: monthOfYear[index] }))
            setGamesByMonth(dataGraph)
            const maxVal: number = dataGraph.reduce((max, obj) => Math.max(max, obj.value), -Infinity);
            setMaxValue(maxVal)
            setDataLoaded(true)
         })
         .catch(error => Toast.show({ type: 'error', text1: 'Error', text2: error.message }))
   };

   return (
      <View style={styles.container}>
         {!dataLoaded && <Text>Loading...</Text>}
         {dataLoaded && <>
            <View>
               <Text style={styles.textMedium} >Partidas por Mes</Text>
            </View>
            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
               <BarChart
                  height={120}
                  roundedTop
                  maxValue={maxValue+1}
                  stepValue={maxValue/5}
                  topLabelTextStyle={styles.textMini}
                  yAxisTextStyle={styles.textMini}
                  xAxisLabelTextStyle={styles.textMini}
                  spacing={5}
                  barWidth={20}
                  frontColor={'#6B007B'}
                  showValuesAsTopLabel
                  data={gamesByMonth}
               />
            </View>
         </>}
      </View>

   )
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'azure',
      borderRadius: 10,
      borderColor: 'steelblue',
      borderWidth: 2,
      width: '100%',
      height: 500,
   },
   textMini: {
      fontSize: 12,
      fontFamily: 'Manrope_400Regular',
      color: 'darkblue',
      textAlign: 'center',
      includeFontPadding: false,
   },
   textMedium: {
      fontSize: 18,
      fontFamily: 'Manrope_800ExtraBold',
      color: 'steelblue',
      textAlign: 'center',
      includeFontPadding: false,
      fontWeight: 'bold',
   },
   textBig: {
      fontSize: 36,
      fontFamily: 'Manrope_800ExtraBold',
      color: 'steelblue',
      textAlign: 'center',
      includeFontPadding: false,
   },
   legendMark: {
      height: 18,
      width: 18,
      marginRight: 5,
      borderRadius: 8,
   }
})

export default GamesByMonth;