import { FC, memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { G, Path, ForeignObject } from 'react-native-svg';
import Hexagon from "./Hexagon";
import * as gameItems from '@/utils/gameitems.json';

interface tileProps {
	pos: { x: number; y: number; };
	radius: number;
	rotation: number;
	type: number;
	borderWidth: number;
	numBox: number;
}

const HexTile: FC<tileProps> = (props) => {
	return (
		<G x={props.pos.x} y={props.pos.y}  >
			<Hexagon
				pos={{ x: 0, y: 0 }}
				radius={props.radius}
				rotation={props.rotation}
				colors={gameItems.tileTypes[props.type].colors}
				borderWidth={props.borderWidth}
			/>
			<Path d={gameItems.tileTypes[props.type].path1} fill='white' fillRule='evenodd' clipRule='evenodd' scale={1.5} x={-12} y={0} />
			<Path d={gameItems.tileTypes[props.type].path2} fill='white' fillRule='evenodd' clipRule='evenodd' scale={1.5} x={-12} y={0} />
			<ForeignObject x={-10} y={-props.radius+10} width={props.radius*2} height={props.radius}>
				<View style={styles.numberContainer}>
					<Text style={styles.number}>{props.numBox}</Text>
				</View>
			</ForeignObject>
		</G>
	);
}

const styles = StyleSheet.create({
	numberContainer: {
		//flex: 1,
		width: 50,
		height: 50,
		//justifyContent: 'flex-start',
		//alignItems: 'center',
		//borderColor: 'black',
		//borderWidth: 2,
		//textAlign: 'center',
	},
	number: {
		fontSize: 30,
		color: 'white',
		fontFamily: 'Jomhuria_400Regular',
		//alignSelf: 'center',
		//backgroundColor: 'red',
		includeFontPadding: false,
		//textAlign: 'center',

	},
});




export default memo(HexTile)