import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import BottomDesign from '@/components/BottomDesign';
import { io, Socket } from 'socket.io-client';
import { useContextProvider } from '@/utils/ContextProvider';
import Toast from 'react-native-toast-message';
import { setupMicrotasks } from 'react-native-reanimated/lib/typescript/threads';

interface UserInGroup {
	socketId: string; // El ID de socket del usuario
	dbUserId: number;   // El ID de la base de datos del usuario
	userName: string;
}

export default function GamersGroup() {
	const router = useRouter();
	const params = useLocalSearchParams<{ mode: string; roomCode: string }>();
	const { mode, roomCode } = params;
	const { idUser, setIdUser, userName, setUserName, socketURL } = useContextProvider(); 

	const [socket, setSocket] = useState<Socket | null>(null);
	const [usersInGroup, setUsersInGroup] = useState<UserInGroup[]>([]);
	const [currentRoomCode, setCurrentRoomCode] = useState(roomCode);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreator, setIsCreator] = useState(mode === '0');
	const usersInGroupRef = useRef(usersInGroup);

	useEffect(() => {
		usersInGroupRef.current = usersInGroup;
	}, [usersInGroup])

	useEffect(() => {
/*		if (!idUser || !userName) {
			Toast.show({ type: 'error', text1: 'Error de Usuario', text2: 'No se pudo obtener la información del usuario.' });
			router.back();
			return;
		}
*/
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
			console.log('Conectado al servidor de Socket.IO:', newSocket.id);
			if (isCreator) { // Creador
				newSocket.emit('createRoom', { roomCode: currentRoomCode, user: { id: idUser, userName } });
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
		});

		newSocket.on('joinedRoom', ({ roomCode, users }: { roomCode: string; users: UserInGroup[] }) => {
			setCurrentRoomCode(roomCode);
			setUsersInGroup(users);
			setIsLoading(false);
			if(idUser < 1)  {
				const currentUserDetails = users.find(u => u.socketId === newSocket.id);
				if (currentUserDetails) {
					setIdUser(currentUserDetails.dbUserId);   // Actualiza idUser en el ContextProvider
					setUserName(currentUserDetails.userName); // Actualiza userName en el ContextProvider
				}
			}
			Toast.show({ type: 'success', text1: 'Te Uniste a la Sala', text2: `Código: ${roomCode}` });
		});

		newSocket.on('groupUpdate', ({ users }: { users: UserInGroup[] }) => {
			setUsersInGroup(users);
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
					myDbUserId: idUser?.toString() || '0', // El ID del usuario actual para identificar su peón
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
	}, []); // Incluir dependencias

	const handleStartGame = () => {
		if (socket && currentRoomCode && isCreator) {
			if (usersInGroup.length < 2) { // Mínimo 2 jugadores para empezar (o el número que definas)
				Toast.show({ type: 'info', text1: 'Jugadores Insuficientes', text2: 'Se necesitan al menos 2 jugadores.' });
				return;
			}
			socket.emit('startGame', { roomCode: currentRoomCode });
		}
	};

	if (isLoading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#6599C3" />
				<Text style={styles.loadingText}>Conectando al lobby...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.titleContainer}>
				<Text style={styles.title}>Sala de Espera</Text>
				{currentRoomCode && <Text style={styles.roomCodeText}>{currentRoomCode}</Text>}
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
		//paddingTop: 50,
		//paddingHorizontal: 20,
		alignItems: 'center',
		backgroundColor: '#6599C3',
	},
	centered: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'lightsteelblue',
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: '#333',
	},
	titleContainer: {
		flex: 15,
		paddingTop: 50,
		backgroundColor: 'white',
		alignItems: 'center',
      height: '100%',
      width: '100%',
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
		fontSize: 28,
		fontWeight: 'bold',
		color: '#365C80',
		marginBottom: 10,
		fontFamily: 'Manrope_700Bold',
	},
	roomCodeText: {
		fontSize: 30,
		color: '#6599C3',
		marginBottom: 20,
		fontFamily: 'Manrope_800ExtraBold',
		letterSpacing: 10,
		backgroundColor: 'white',
		paddingVertical: 3,
		paddingHorizontal: 15,
		borderRadius: 8,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 1.41,
	},
	usersTitle: {
		fontSize: 20,
		fontWeight: '600',
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
		padding: 10,
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
