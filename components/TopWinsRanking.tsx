import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useContextProvider } from '@/utils/ContextProvider'
import Toast from 'react-native-toast-message';
import BottomDesign from '@/components/BottomDesign'
import Icon from '@expo/vector-icons/FontAwesome6';
import { getHour } from '@/utils/utils';

type topData = {
	userName: number;
	totWins: string;
}

const topWinsRanking = () => {
	const { apiURL } = useContextProvider();
	const [data, setData] = useState<topData[]>([]);
	const [isLoading, setIsLoading] = useState(true);


	useEffect(() => {
		console.log(`API GET: ${apiURL}/dashboard/top-wins/10: Inicio llamada a las ${getHour()}`);
		getData();
		console.log(`API GET: ${apiURL}/dashboard/top-wins/10: Respuesta obtenida a las ${getHour()}`);
	}, []);

	const getData = async () => {
		setIsLoading(true);
		await fetch(apiURL + '/dashboard/top-wins/10')
			.then(response => response.json())
			.then(data => {
				setData(data)
			})
			.catch(error => Toast.show({ type: 'error', text1: 'Error', text2: error.message }))
		setIsLoading(false)
	}
	const medalColors = ['gold', 'silver', '#CD7F32']

	return (
		<View style={styles.container}>
			{isLoading && <View style={{ flex: 65, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', width: '100%' }} >
				<ActivityIndicator size="large" color="#6599C3" />
			</View>}
			{!isLoading && <View style={styles.dataContainer}>
				<View style={[styles.title, styles.rowUser]}>
					<View style={styles.position}><Text style={styles.titleText}>#</Text></View>
					<View style={styles.userName}><Text style={styles.titleText}>Usuario</Text></View>
					<View style={styles.total}><Text style={styles.titleText}>Partidas ganadas</Text></View>
				</View>
				{data.map((item, index) => {
					return (
						<View style={styles.rowUser} key={index}>
							<View style={styles.position}>
								{index < 3 && <Icon name={'medal'} size={32} color={medalColors[index]} />}
								{index >= 3 && <Text style={styles.text} >{index + 1}</Text>}
							</View>
							<View style={styles.userName}>
								<Text style={styles.text}>{item.userName}</Text>
							</View>
							<View style={styles.total}>
								<Text style={styles.text}>{item.totWins}</Text>
							</View>
						</View>
					)
				})}
			</View>}


			<BottomDesign allowRanking={false} />
		</View>
	)
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#6599C3'
	},
	dataContainer: {
		flex: 65,
		width: '100%',
		backgroundColor: 'white',
		paddingInline: 10,
		paddingTop: 30,
	},
	title: {
		backgroundColor: '#6599C3',
		color: 'white',
		justifyContent: 'center',
		alignItems: 'center',
	},
	titleText: {
		fontSize: 18,
		color: 'white',
		fontFamily: ' Manrope_800ExtraBold',
	},
	rowUser: {
		flexDirection: 'row',
		rowGap: 5,
		columnGap: 10,
		paddingVertical: 4,
		paddingHorizontal: 10,
	},
	position: {
		flex: 1,
		alignItems: 'center',
	},
	userName: {
		flex: 6.5,
		alignItems: 'center'
	},
	total: {
		flex: 2.5,
		alignItems: 'center'
	},
	text: {
		fontSize: 18,
		color: '#6599C3',
		fontFamily: ' Manrope_400Regular',
	}
})

export default topWinsRanking;