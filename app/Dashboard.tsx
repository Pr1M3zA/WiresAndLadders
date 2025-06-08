import { useRouter } from 'expo-router';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from '@expo/vector-icons/Feather';

import GamesByPlatform from '@/components/dashboard/GamesByPlatform';
import PlayerMostWins from '@/components/dashboard/PlayerMostWins';
import PlayerMostPoints from '@/components/dashboard/PlayerMostPoints';
import GamesByDayOfWeek from '@/components/dashboard/GamesByDayOfWeek';
import GamesByMonth from '@/components/dashboard/GamesByMonth';
import PlayedMinutes from '@/components/dashboard/PlayedMinutes';
import PlayerMostGameStarted from '@/components/dashboard/PlayerMostGameStarted';


export default function Dashboard() {
	const router = useRouter();

	return (
		<View style={styles.container}>
			{/* Title */}
			<View style={[styles.titleContainer, { paddingTop: 40 }]}>
				<View style={styles.titleBar}>
					<View style={styles.titleBarSides}>
						<TouchableOpacity onPress={() => router.back()} style={{paddingLeft: 10}}>
							<Icon name='arrow-left' size={20} color={'white'} />
						</TouchableOpacity>						
					</View>
					<View style={styles.titleBarCenter}>
						<Text style={styles.titleText}>Wires & Ladders Dashboard</Text>
					</View>
					<View style={styles.titleBarSides}></View>
				</View>
			</View>
			{/* Top Pie & Cards Section */}
			<View style={[styles.TopContainer]}>
				<GamesByPlatform />
				<View style={{ width: '45%', rowGap: 5 }}>
					<PlayerMostWins />
					<PlayerMostPoints />
				</View>
			</View>
			{/* Bar graph section */}
			<View style={styles.middleContainer}>
				<GamesByMonth />
			</View>
			{/* Bottom Cards & Pie Section */}
			<View style={[styles.BottomContainer]}>
				<View style={{ flex: 1, rowGap: 5 }}>
					<PlayedMinutes />
					<PlayerMostGameStarted />
				</View>
				<GamesByDayOfWeek />
			</View>
		</View>
	)

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
		gap: '1%',
	},
	titleContainer: {
		flex: 3,
		backgroundColor: 'white',
	},
	titleBar: {
		flex: 1, 
		width: '100%', 
		flexDirection: 'row',
		backgroundColor: 'steelblue',
	},
	titleBarCenter: {
		flex: 8, 
		width: '100%', 
		alignItems: 'center', 
		justifyContent: 'center', 
	},
	titleBarSides: {
		flex: 1,
	},
	titleText: {
		fontSize: 16,
		fontFamily: 'Manrope_800ExtraBold',
		color: 'white',
		textAlign: 'center',
		includeFontPadding: false,
		fontWeight: 'bold',		
	},
	TopContainer: {
		flex: 30,
		flexDirection: 'row',
		gap: 3,
		paddingInline: 3,
	},
	middleContainer: { 
		flex: 26,
		paddingInline: 5,
	},
	BottomContainer: {
		flex: 32,
		flexDirection: 'row',
		gap: 3,
		paddingInline: 3,
		marginBottom: 20,
	}

})