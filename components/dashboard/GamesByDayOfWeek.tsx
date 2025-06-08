import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { PieChart } from "react-native-gifted-charts";
import { useContextProvider } from '@/utils/ContextProvider';

type graphData = {
	value: number;
	label: string;
	text: string;
	color: string
}

const GamesByDayOfWeek = () => {
	const [gamesByDoW, setGamesByDoW] = useState<graphData[]>([]);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [total, setTotal] = useState(0);
	const { apiURL } = useContextProvider();
	const { width } = Dimensions.get('window')

	useEffect(() => {
		getGamesByPlatform();
	}, []);

	const getGamesByPlatform = async () => {
		const colors = ['#118DFF', '#6B007B', '#E66C37', '#E044A7', '#744EC2', '#D9B300', '#D64550']
		const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
		await fetch(apiURL + '/dashboard/games-by-dayofweek')
			.then(response => response.json())
			.then(data => {
				const dataGraph: graphData[] = data.map((item: any, index: number) => ({ ...item, label: daysOfWeek[index], color: colors[index] }))
				setGamesByDoW(dataGraph)
				const sum = dataGraph.reduce((accumulator, currentValue) => {
					return accumulator + currentValue.value;
				}, 0);
				setTotal(sum)
				setDataLoaded(true)
			})
			.catch(error => Toast.show({ type: 'error', text1: 'Error', text2: error.message }))
	};

	return (
		<View style={styles.container}>
			{!dataLoaded && <Text>Loading...</Text>}
			{dataLoaded && <>
				<Text style={styles.textMini} >Partidas por</Text>
				<Text style={styles.textMedium} >Día de la Semana</Text>
				<PieChart
					showText
					donut
					focusOnPress
					showValuesAsLabels
					radius={width * 0.4 / 2}
					textSize={24}
					textColor="white"
					data={gamesByDoW}
					centerLabelComponent={() => {
						return (
							<View style={{ justifyContent: 'center', alignItems: 'center' }}>
								<Text style={styles.textMini}>Total</Text>
								<Text style={styles.textMedium}>{total}</Text>
							</View>
						);
					}}
				/>
				<View style={styles.legendContainer}>
					{gamesByDoW.map((item, index) => {
						return (
							<View key={index} style={{ flexDirection: 'row', marginBottom: 0 }}>
								<View style={[styles.legendMark, { backgroundColor: item.color }]} />
								<Text style={styles.textMini}>{item.label}</Text>
							</View>
						)
					})}

				</View>

			</>}
		</View>

	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: 'azure',
		borderRadius: 10,
		borderColor: 'steelblue',
		borderWidth: 2,
		width: '100%',
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
	legendContainer: {
		width: '100%',
		flexDirection: 'row',
		flex: 1,
		alignContent: 'center',
		justifyContent: 'center',
		flexWrap: 'wrap'
	},
	legendMark: {
		height: 15,
		width: 15,
		marginLeft: 5,
		marginRight: 2,
		borderRadius: 5,
	}
})

export default GamesByDayOfWeek;