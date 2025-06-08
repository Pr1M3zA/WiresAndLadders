import { useRouter } from 'expo-router';
import { FC } from 'react';
import { Dimensions, View, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { G } from 'react-native-svg';
import * as UIElemets from '@/utils/ui-elements.json';
import Cube from '@/components/Cube';
import Icon from '@expo/vector-icons/FontAwesome6';

interface designProps { allowRanking: boolean }

const BottomDesign: FC<designProps> = (props) => {
	const { width, height } = Dimensions.get('window');
	const router = useRouter();
	return (
		<View style={styles.designContainer}>
			<View style={styles.designTopContainer}>
				<View style={styles.cubesContainer}>
					<Svg height='100%' width='100%'>
						<G scale={height * 0.2 * 0.00558} x={width - (352 * height * 0.2 * 0.00558 * 0.825)} y={height * 0.2 * 0.0702}>
							{UIElemets.register.cubes.map((item, index) => {
								return (<Cube {...item} key={index} />)
							})}
						</G>
					</Svg>
				</View>
			</View>

			<View style={styles.designBottomContainer}>
				{props.allowRanking &&
				<TouchableOpacity onPress={() => router.navigate('/Ranking')} style={styles.rankingButton}>
					<Icon name={'ranking-star'} size={32} color={'goldenrod'} />
				</TouchableOpacity>}
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	designContainer: {
		flex: 25,
		width: '100%'
	},
	designTopContainer: {
		flex: 5,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	designBottomContainer: {
		flex: 20,
		justifyContent: 'flex-end',
		padding: 10,
	},
	cubesContainer: {
		position: 'absolute',
		height: '500%',
		width: '100%'
	},
	rankingButton: {
		borderColor: 'white',
		borderWidth: 2,
		borderRadius: 10,
		padding: 10,
		zIndex: 1,
		width: 60,
	}
})

export default BottomDesign;