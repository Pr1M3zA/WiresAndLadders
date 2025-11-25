import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef, use } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import BottomDesign from '@/components/BottomDesign';
import { io } from 'socket.io-client';
import { useContextProvider } from '@/utils/ContextProvider';
import Toast from 'react-native-toast-message';
import { getHour } from '@/utils/utils';
import Loading from '@/components/Loading';
import Icon from '@expo/vector-icons/Feather';

interface UserInGroup {
	socketId: string; // El ID de socket del usuario
	dbUserId: number;   // El ID de la base de datos del usuario
	userName: string;
}

export default function GamersGroup() {
	const router = useRouter();
	const params = useLocalSearchParams<{ mode: string; roomCode: string }>();
	const { mode, roomCode } = params;
	const { idUser, setIdUser, userName, setUserName, defBoard, setDefBoard, apiURL, socketURL, socket, setSocket, boards, setBoards, shortcuts, setShortcuts, tiles, setTiles, tileTypes, setTileTypes} = useContextProvider(); 
	const [usersInGroup, setUsersInGroup] = useState<UserInGroup[]>([]);
	const [currentRoomCode, setCurrentRoomCode] = useState(roomCode);
	const [isLoading, setIsLoading] = useState(false);
	//const [isFetching, setIsFetcthing] = useState(false);
	const [isCreator, setIsCreator] = useState(mode === '0');
	const [idBoardGame, setIdBoardGame] = useState(defBoard);
	const [idxBoardGame, setIdxBoardGame] = useState(0)
	const usersInGroupRef = useRef(usersInGroup);
	const idBoardRef = useRef(idBoardGame);
	
	useEffect(() => {
		idBoardRef.current = idBoardGame;
		if(boards.length > 0) setIdxBoardGame(boards.findIndex(b => b.id === idBoardGame))
	}, [idBoardGame]);


	useEffect(() => {
		usersInGroupRef.current = usersInGroup
		if(idUser < 1)  {
			const currentUserDetails = usersInGroup.find(u => u.socketId === socket?.id);
			if (currentUserDetails) {
				setIdUser(currentUserDetails.dbUserId);   // Actualiza idUser en el ContextProvider
				setUserName(currentUserDetails.userName); // Actualiza userName en el ContextProvider
				//console.log(`Update userId: ${idUser}; userName: ${userName}`)
			}
		}
	}, [usersInGroup])

	useEffect(() => {
		/*if (!idUser || !userName) {
			Toast.show({ type: 'error', text1: 'Error de Usuario', text2: 'No se pudo obtener la información del usuario.' });
			router.back();
			return;
		}*/

		console.log(`API SOCKETS: ${socketURL}: Inicio llamada a las ${getHour()}`)
		const newSocket = io(socketURL, {
			query: {
				dbUserId: idUser,
				userName: userName,
			},
			transports: ['websocket'], 
		});
		setSocket(newSocket);
		setIsLoading(true);

		newSocket.on('connect', () => {
			console.log(`API SOCKETS (connect): ${socketURL}: Inicio llamada a las ${getHour()}`)
			if (isCreator) { // Creador
				newSocket.emit('createRoom', { roomCode: currentRoomCode, user: { id: idUser, userName }, idBoardGame: 1 });
			} else { // Unirse
				newSocket.emit('joinRoom', { roomCode: currentRoomCode, user: { id: idUser, userName } });
			}
		
		});

		newSocket.on('disconnect', (reason) => {
			console.log('Desconectado del servidor de Socket.IO:', reason);
			Toast.show({ type: 'info', text1: 'Desconectado', text2: 'Se perdió la conexión con el servidor.' });
		});

		newSocket.on('connect_error', (err) => {
			console.error('Error de conexión Socket.IO:', err.message);
			Toast.show({ type: 'error', text1: 'Error de Conexión', text2: 'No se pudo conectar al servidor del lobby.' });
			setIsLoading(false);
			router.back();
		});

		// Eventos del servidor
		newSocket.on('roomCreated', ({ roomCode, users, isCreator: creatorStatus }: { roomCode: string; users: UserInGroup[], isCreator: boolean }) => {
			setCurrentRoomCode(roomCode);
			setUsersInGroup(users);
			setIsCreator(creatorStatus);
			setIsLoading(false);
			Toast.show({ type: 'success', text1: 'Sala Creada', text2: `Código: ${roomCode}` });
			console.log(`API SOCKETS (roomCreated): ${socketURL}: Respuesta obtenida a las ${getHour()}`)
		});

		newSocket.on('joinedRoom', ({ roomCode, users }: { roomCode: string; users: UserInGroup[] }) => {
			setCurrentRoomCode(roomCode);
			setUsersInGroup(users);
			setIsLoading(false);
			Toast.show({ type: 'success', text1: 'Te Uniste a la Sala', text2: `Código: ${roomCode}` });
			console.log(`API SOCKETS (joinedRoom): ${socketURL}: Respuesta obtenida a las ${getHour()}`)
		});

		newSocket.on('groupUpdate', ({ users, idBoard }: { users: UserInGroup[], idBoard: number}) => {
			console.log(`Group update... ${users.length} users; Board: ${idBoard}`)
			setUsersInGroup(users);
			setIdBoardGame(idBoard);
		});

		newSocket.on('createRoomError', ({ message }: { message: string }) => {
			Toast.show({ type: 'error', text1: 'Error al Crear Sala', text2: message });
			setIsLoading(false);
			router.back();
		});

		newSocket.on('joinError', ({ message }: { message: string }) => {
			Toast.show({ type: 'error', text1: 'Error al Unirse', text2: message });
			setIsLoading(false);
			router.back();
		});

		newSocket.on('roomFull', ({ message }: { message: string }) => {
			Toast.show({ type: 'error', text1: 'Sala Llena', text2: message });
			setIsLoading(false);
			router.back();
		});

		newSocket.on('creatorLeft', ({ message }: { message: string }) => {
			Toast.show({ type: 'info', text1: 'El Creador se fue', text2: message });
			router.replace('/Lobby'); // O a la pantalla principal
		});

		newSocket.on('gameStarting', ({ gameId }: { gameId: string }) => { // gameId podría ser útil
			Toast.show({ type: 'info', text1: '¡Comenzando Partida!', text2: `Uniéndose al juego ${gameId}` });
			router.push({
				pathname: '/BoardGame',
				params: {
					gameId, // El ID único de esta partida
					roomCode: currentRoomCode,
					players: JSON.stringify(usersInGroupRef.current), // Serializa el array de UserInGroup
					//myDbUserId: idUser?.toString() || '0', // El ID del usuario actual para identificar su peón
					idBoard: idBoardRef.current,
					isCreator: isCreator ? '1' : '0',
				}
			});
		});

		return () => {
			newSocket.off('connect');
			newSocket.off('disconnect');
			newSocket.off('connect_error');
			newSocket.off('roomCreated');
			newSocket.off('joinedRoom');
			newSocket.off('groupUpdate');
			newSocket.off('createRoomError');
			newSocket.off('joinError');
			newSocket.off('roomFull');
			newSocket.off('creatorLeft');
			newSocket.off('gameStarting');
			newSocket.disconnect();
			setSocket(null);
		};
	}, []);

	const handleStartGame = () => {
		if (socket && currentRoomCode && isCreator) {
			if (usersInGroup.length < 2) { // Mínimo 2 jugadores para empezar (o el número que definas)
				Toast.show({ type: 'info', text1: 'Jugadores Insuficientes', text2: 'Se necesitan al menos 2 jugadores.' });
				return;
			}
			socket.emit('startGame', { roomCode: currentRoomCode });
		}
	};

	const nextBoardGame = () => {
		setIdxBoardGame((idxBoardGame + 1) % boards.length)
	}

	const prevBoardGame = () => {
		setIdxBoardGame(idxBoardGame === 0 ? boards.length - 1 : idxBoardGame - 1)
	}

	useEffect(() => {
		if(idxBoardGame >= 0 && idxBoardGame < boards.length && socket && currentRoomCode && isCreator && boards.length > 0) 
			socket.emit('setBoard', {roomCode: currentRoomCode, idBoard: boards[idxBoardGame].id})
	}, [idxBoardGame])

	
	if (isLoading) {
		return (
			<Loading />
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.titleContainer}>
				<Text style={styles.title}>Sala de Espera</Text>
				{currentRoomCode && <Text style={styles.roomCodeText}>{currentRoomCode}</Text>}
			</View>
			<View style={styles.boardCointainer}>
				<Text>Generación:</Text>
				<View style={styles.selBoardCointainer}>
					<View style={styles.arrowsSelBoard}>
						{isCreator && (
							<TouchableOpacity onPress={prevBoardGame}>
								<Icon name='arrow-left-circle' size={24} color='white' />
							</TouchableOpacity>
						)}
					</View>
					<View style={styles.boardName}>
						<Text style={styles.boardNameText}>{boards.length === 0 ? ' Cargando....' :  boards[idxBoardGame].board_name}</Text>
					</View>
					<View style={styles.arrowsSelBoard}>
						{isCreator && (
							<TouchableOpacity onPress={(nextBoardGame)}>
								<Icon name='arrow-right-circle' size={24} color='white' />
							</TouchableOpacity>
						)}
					</View>
				</View>
			</View>
			<View style={styles.playersContainer}>
				<Text style={styles.usersTitle}>Jugadores ({usersInGroup.length}/6):</Text>
				<FlatList
					data={usersInGroup}
					keyExtractor={(item) => item.socketId}
					renderItem={({ item }) => (
						<View style={styles.userItem}>
							<Text style={styles.userName}>{item.userName} {item.socketId === socket?.id ? "(Tú)" : ""}{usersInGroup[0]?.socketId === item.socketId ? " (Host)" : ""}</Text>
						</View>
					)}
					ListEmptyComponent={<Text style={styles.emptyListText}>Esperando jugadores...</Text>}
					style={styles.userList}
				/>
			</View>
			<View style={styles.buttonsContainer}>
				{isCreator && (
					<TouchableOpacity style={[styles.button, usersInGroup.length < 2 ? styles.buttonDisabled : {}]} onPress={handleStartGame} disabled={usersInGroup.length < 2} >
						<Text style={styles.buttonText}>Iniciar Partida</Text>
					</TouchableOpacity>
				)}
				<TouchableOpacity style={[styles.button, styles.leaveButton]} onPress={() => router.back()} >
					<Text style={styles.buttonText}>Salir de la Sala</Text>
				</TouchableOpacity>
			</View>

			<BottomDesign allowRanking={false}/>

		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		backgroundColor: '#6599C3',
	},
	titleContainer: {
		flex: 18,
		paddingTop: 50,
		backgroundColor: 'white',
		alignItems: 'center',
      height: '100%',
      width: '100%',
	},
	boardCointainer: {
		flex: 10,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
      height: '100%',
      width: '100%',
	},
	selBoardCointainer: {
		width: '100%',
		paddingHorizontal: 50,
		flexDirection: 'row',
	},
	arrowsSelBoard: {	
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'steelblue',
	},
	boardName: {
		flex: 5,
		alignItems: 'center',
		justifyContent: 'center',
		borderColor: 'steelblue',
		borderWidth: 1,
	},
	boardNameText: {
		color: 'steelblue',
		fontFamily: 'Manrope_400Regular',
		fontSize: 18,
	},
	
	playersContainer: {
		flex: 45,
		backgroundColor: 'white',
		alignItems: 'center',		
      height: '100%',
      width: '100%',
		paddingHorizontal: 50,
		justifyContent: 'center',
	},
	buttonsContainer: {
		flex: 15,
		backgroundColor: 'white',
		alignItems: 'center',		
      height: '100%',
      width: '100%',
	},
	title: {
		fontSize: 32,
		includeFontPadding: false,
		//fontWeight: 'bold',
		color: '#365C80',
		fontFamily: 'Manrope_800ExtraBold',
	},
	roomCodeText: {
		fontSize: 40,
		color: '#365C80',
		fontFamily: 'Manrope_800ExtraBold',
		textAlignVertical: 'center',
		//textAlign: 'center',
		includeFontPadding: false,
		letterSpacing: 15,
		backgroundColor: 'white',
		paddingHorizontal: 15,
		borderColor: 'steelblue',
		borderWidth: 3,
		borderRadius: 8,
	},
	usersTitle: {
		fontSize: 18,
		color: '#333',
		marginBottom: 10,
		alignSelf: 'flex-start',
		fontFamily: 'Manrope_600SemiBold',
		textAlign: 'center',
	},
	userList: {
		width: '100%',
		marginBottom: 10,
	},
	userItem: {
		backgroundColor: '#FFFFFF',
		padding: 5,
		borderRadius: 10,
		marginBottom: 10,
		borderColor: '#E0E0E0',
		borderWidth: 1,
	},
	userName: {
		fontSize: 16,
		color: '#365C80',
		fontFamily: 'Manrope_500Medium',
	},
	emptyListText: {
		textAlign: 'center',
		fontSize: 16,
		color: '#777',
		marginTop: 20,
		fontFamily: 'Manrope_400Regular',
	},
	button: {
		backgroundColor: '#6599C3',
		paddingVertical: 5,
		paddingHorizontal: 30,
		borderRadius: 10,
		alignItems: 'center',
		width: '80%',
		marginBottom: 15,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	buttonDisabled: {
		backgroundColor: '#B0C4DE', // Un color más claro para indicar deshabilitado
	},
	buttonText: {
		color: 'white',
		fontSize: 18,
		fontWeight: 'bold',
		fontFamily: 'Manrope_700Bold',
	},
	leaveButton: {
		backgroundColor: '#D9534F', // Un color rojo para salir
	}
});
