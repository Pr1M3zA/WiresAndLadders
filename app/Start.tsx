import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useContextProvider } from '@/utils/ContextProvider';
import Svg, { Circle, G, Rect } from 'react-native-svg';
import Icon from '@expo/vector-icons/Feather';
import Cube from '@/components/Cube'
import Figure from '@/components/Figure';
import * as UIElemets from '@/utils/ui-elements.json';
import { SyncBoardData } from '@/utils/db';
import Loading from '@/components/Loading';
import Toast from 'react-native-toast-message';
import * as SQLite from 'expo-sqlite';
import { BoardType, EffectType, TileType, ShortCutType, DiceType } from '@/utils/types';

export default function Start() {
	const { token, setToken, adminUser, apiURL, setTileTypes, setTiles, setShortcuts, setBoards, setDices } = useContextProvider();
	const router = useRouter();
	const [layoutBottom, setLayoutBottom] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [layoutTop, setLayoutTop] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const [isLoading, setIsLoading] = useState(false);
	const handleLayoutBottom = (event: any) => { setLayoutBottom(event.nativeEvent.layout) };
	const handleLayoutTop = (event: any) => { setLayoutTop(event.nativeEvent.layout) };

	useEffect(() => {
		(async () => {
			const db = await SQLite.openDatabaseAsync('WiresAndLadders.db');
			try {
				setIsLoading(true)
				await SyncBoardData(apiURL, db);
				await GetLocalDbBoardElements(db);
			} catch (error: any) {
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error', text2: error.message })
			} finally {
				await db.closeAsync();
				setIsLoading(false)
			}
		})()
	}, [apiURL]);

/*-----------------------------------------------------------
		CARGA DE TABLEROS, CASILLAS, ATAJOS Y TIPOS DE CASILLAS
	------------------------------------------------------------*/
	const GetLocalDbBoardElements = async (db: SQLite.SQLiteDatabase) => {
		//const db = await SQLite.openDatabaseAsync('WiresAndLadders.db');
		//await db.execAsync('PRAGMA journal_mode = WAL');
		// Get Shortcuts
		await db.getAllAsync('SELECT id, id_board, from_tile, to_tile FROM shortcuts ORDER BY id_board')
			.then(data => { 
				console.log(`Shortcuts: ${data.length}`)
				setShortcuts(data as ShortCutType[]) 
			})
			.catch(error => { 
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Shortcuts local)', text2: error.message }) 
			});  
		// Get Boards
		await db.getAllAsync('SELECT b.id, board_name, width, height, rect_width, rect_height, path1, path2, color_rect, color_path1, color_path2, education FROM boards b INNER JOIN board_backgrounds bb ON b.id_background=bb.id ORDER BY b.id')
			.then(data => { 
				console.log(`Boards: ${data.length}`)
				setBoards(data as BoardType[]) 
			})
			.catch(error => { 
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Boards local)', text2: error.message }) 
			});  
		// Get Tiles
		await db.getAllAsync('SELECT t.id, id_board, num_tile, pos_x, pos_y, tile_type, rotation, radius, border_width, tt.effect_name, direction FROM tiles t INNER JOIN tile_types tt ON t.tile_type=tt.id ORDER BY id_board, num_tile')
			.then(data => { 
				console.log(`Tiles: ${data.length}`)
				setTiles(data as TileType[]) 
			})
			.catch(error => { 
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Tiles local)', text2: error.message }) 
			});  
			// Get Tile Types
		await db.getAllAsync('SELECT id, effect_name, color_fill, color_border, color_path1, color_path2, path1, path2, paths_x, paths_y, paths_scale FROM tile_types ORDER BY id')
			.then(data => { 
				console.log(`Tile Types: ${data.length}`)
				setTileTypes(data as EffectType[]) 
			})
			.catch(error => { 
				console.log(error.message)
				Toast.show({ type: 'error', text1: 'Error (Get Tile Types local)', text2: error.message }) 
			});

		// Get Dices
		await db.getAllAsync('SELECT id, dice_name, color_faceup, color_faceleft, color_faceright, color_dots, color_border, border_width, scale FROM dices ORDER BY id')
			.then(data => {
				console.log(`Dices: ${data.length}`)
				setDices(data as DiceType[]) 
			})
			.catch(error => { 
				console.log(`dices: ${error.message}`)
				Toast.show({ type: 'error', text1: 'Error (Get Dices local)', text2: error.message }) 
			});  

		//await db.closeAsync();
	}


	if (isLoading) return (
		<Loading />
	)

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

