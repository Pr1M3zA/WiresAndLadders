import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useContextProvider } from '@/utils/ContextProvider';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import Icon from '@expo/vector-icons/Feather';
import Cube from '@/components/Cube'
import Figure from '@/components/Figure';
import * as UIElemets from '@/utils/ui-elements.json';
import Dashboard from './Dashboard';

export default function Start() {
	const { token, setToken, adminUser } = useContextProvider();
	const router = useRouter();
	const [layoutBottom, setLayoutBottom] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [layoutTop, setLayoutTop] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const handleLayoutBottom = (event: any) => { setLayoutBottom(event.nativeEvent.layout) };
	const handleLayoutTop = (event: any) => { setLayoutTop(event.nativeEvent.layout) };

	return (
		<View style={styles.container}>
			<View style={styles.titleContainer} onLayout={handleLayoutTop}>
				<View style={styles.titleSides}></View>
				<View style={styles.titleCenter}>
					<Svg height='100%' width='100%'>
						<G x={layoutTop.width * 0.7 / 2 - 88} y={0} scale={1}>
							<Cube
								x={0} y={0} scale={1}
								colors={{ faceUp: '#6599c3', faceLeft: '#78bdf6', faceRight: '#78bdf6', line: '#ffffff' }}
								lineWidth={1}
							/>
							{UIElemets.start.circles.map((item, index) => {
								return (<Circle {...item} key={index} />)
							})}
							<Rect x={0} y={105} width={275} height={40} fill='#ffffff'></Rect>
						</G>
					</Svg>
					<Text style={styles.titleText}>Wires&Ladders</Text>
				</View>
				<View style={styles.titleSides}>
					{token.length > 0 &&
               <TouchableOpacity onPress={() => setToken('') } >
                  <Icon name='log-out' size={40} color={'red'} />
               </TouchableOpacity>}
				</View>
			</View>
			<View style={styles.buttonsContainer}>
				<TouchableOpacity style={styles.loginButton} onPress={() => router.push(token.length > 0 ? '/Lobby' : '/Login')}>
					<Text style={styles.loginText}>{token.length > 0 ? 'Continuar' : 'Iniciar sesión'}</Text>
				</TouchableOpacity>

				{token.length == 0 &&
            <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/Register')}>
					<Text style={styles.registerText}>Crear cuenta</Text>
				</TouchableOpacity>}

				{token.length == 0 &&
            <TouchableOpacity style={styles.guestButton} onPress={() => router.navigate('/Lobby') }>
					<Text style={styles.guestText}>o, continuar como Invitado</Text>
				</TouchableOpacity>}

				{token.length > 0 && adminUser &&
					<TouchableOpacity style={styles.dashboard} onPress={() => router.navigate('/Dashboard') } >
						<Icon name='bar-chart-2' size={32} color={'green'} />
						<Icon name='pie-chart' size={32} color={'purple'} />
					</TouchableOpacity>
				}

			</View>
			<View style={styles.designContainer} onLayout={handleLayoutBottom}>
				<Svg height='100%' width='100%'>
					<G scale={layoutBottom.width * 0.00236} y={layoutBottom.height - 310 - (Platform.OS === 'ios' ? 40 : 0)}>
						{UIElemets.start.cubes.map((item, index) => {
							return (<Cube {...item} key={index} />)
						})}
						{UIElemets.start.figures.map((item, index) => {
							return (<Figure {...item} key={index} />)
						})}
					</G>
				</Svg>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		paddingTop: 50,
		//alignItems: 'center',
		backgroundColor: '#FFFFFF'
	},
	text: {
		fontSize: 20,
		color: '#000'
	},
	titleContainer: {
		height: '100%',
		width: '100%',
		flex: 30,
		flexDirection: 'row',
	},
	titleCenter: {
		flex: 70,
		alignItems: 'center',
	},
	titleSides: {
		flex: 15,
	},

	titleText: {
		fontSize: 55,
		color: '#6599c3',
		fontFamily: 'Jomhuria_400Regular',
		position: 'absolute',
		top: 80,
		textAlign: 'center',
	},
	buttonsContainer: {
		marginTop: 30,
		flex: 30,
		paddingHorizontal: '10%',
		gap: 50,
		justifyContent: 'center',
		//alignItems: 'center',
	},
	loginButton: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#6599c3',
		borderRadius: 10,
		paddingBottom: 5,
		borderColor: '#6599C3',
		borderWidth: 2,
	},
	loginText: {
		fontSize: 20,
		color: '#FFFFFF',
		fontFamily: 'Manrope_800ExtraBold'
	},
	registerButton: {
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFFFFF',
		borderColor: '#6599C3',
		borderWidth: 1.3,
		borderStyle: 'solid',
		borderRadius: 10,
		paddingBottom: 5,
	},
	registerText: {
		fontSize: 20,
		color: '#6599C3',
		fontFamily: 'Manrope_800ExtraBold'
	},
	guestButton: {
		marginTop: -40,
		alignItems: 'flex-end',
	},
	guestText: {
		fontSize: 12,
		color: '#365C80',
		fontFamily: 'Manrope_800ExtraBold',
		borderBottomColor: '#365C80',
		borderBottomWidth: 2
	},
	dashboard: {
		backgroundColor: 'white',
		borderColor: 'red',
		borderWidth: 2,
		borderRadius: 30,
		flexDirection: 'row',
		gap: 10,
		padding: 10,
		justifyContent: 'center',
		marginLeft: '60%',

	},
	designContainer: {
		flex: 40,
		width: '100%',
		backgroundColor: '#6599c3',
	},
})

