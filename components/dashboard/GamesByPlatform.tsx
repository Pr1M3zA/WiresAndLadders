import { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import { PieChart } from "react-native-gifted-charts";
import { useContextProvider } from '@/utils/ContextProvider';

type graphData = {
	value: number;
	label: string;
	text: string;
	color: string;
}

const GamesByPlatform = () => {
	const [gamesByPlatform, setGamesByPlatform] = useState<graphData[]>([]);
	const [dataLoaded, setDataLoaded] = useState(false);
	const [total, setTotal] = useState(0);
	const { apiURL } = useContextProvider();
	const { width } = Dimensions.get('window')

	useEffect(() => {
		getGamesByPlatform();
	}, []);

	const getGamesByPlatform = async () => {
		const colors = ['#118DFF', '#6B007B', '#E66C37']
		await fetch(apiURL + '/dashboard/games-by-platform')
			.then(response => response.json())
			.then(data => {
				const dataGraph: graphData[] = data.map((item: any, index: number) => ({ ...item, color: colors[index] }))
				setGamesByPlatform(dataGraph)
				const sum = dataGraph.reduce((accumulator, currentValue) => {
					return accumulator + currentValue.value;
				}, 0);
				setTotal(sum)

				setDataLoaded(true)
			})
			.catch(error => Toast.show({ type: 'error', text1: 'Error', text2: `${error}` }))
	};

	return (
		<View style={styles.container}>
			{!dataLoaded && <Text>Loading...</Text>}
			{dataLoaded && <>
				<Text style={styles.textMini} >Jugadores por</Text>
				<Text style={styles.textMedium} >Plataforma</Text>
				<PieChart
					showText
					donut
					focusOnPress
					showValuesAsLabels
					radius={width * 0.42 / 2}
					textSize={24}
					textColor="white"
					data={gamesByPlatform}
					centerLabelComponent={() => {
						return (
							<View style={{ justifyContent: 'center', alignItems: 'center' }}>
								<Text style={styles.textMini}>Total</Text>
								<Text style={styles.textMedium}>{total}</Text>
							</View>
						);
					}}
				/>
				<View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-evenly' }}>
					{gamesByPlatform.map((item, index) => {
						return (
							<View key={index} style={{ flexDirection: 'row', marginBottom: 12 }}>
								<View style={[styles.legendMark, { backgroundColor: item.color }]} />
								<Text style={styles.textMini}>{item.label || ''}</Text>
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
		width: '45%',
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

export default GamesByPlatform;