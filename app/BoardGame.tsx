import { useState, useEffect, useCallback, useRef, use } from 'react';
import { Dimensions, Platform, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import { io, Socket } from 'socket.io-client';
import { useContextProvider } from '@/utils/ContextProvider';
import Svg, { Path, G } from 'react-native-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import Background from '@/components/Background';
import HexTile from '@/components/HexTile';
import Wire from '@/components/Wire';
import Ladder from '@/components/Ladder';
import Cube from '@/components/Cube';
import * as gameItems from '@/utils/gameitems.json';
import educationData from '@/utils/education.json'; 
import ModalEducation from '@/components/modalEducation'; 
import Hexagon from '@/components/Hexagon';
import Dice from '@/components/Dice';
import Player from '@/components/Player';
import ModalGameStats from '@/components/GameStatisticsModal';


//type landedTileTypeCounter = {Inicio: number, Ninguno: number, Positivo: number, Negativo: number, Informativo: number, Pregunta: number, Especial: number, Meta: number}
 
interface PlayerInfoFromLobby {   // Información del usuario que envía el Lobby
	socketId: string;
	dbUserId: number;
	userName: string;
}

interface PlayerGameState {  // Para llevar estadísticas del jugador en el desarrollo del juego
	dbUserId: number;
	userName: string;
	color: { fill: string; border: string; eyes: string} 
	platForm: string;
	currentTile: number;
	targetTile: number;
	diceRolls: number;
	pointsAccumulated: number;
	shortcutsTaken: number;
	laddersTaken: number;
	snakesTaken: number;
	landedOnTileCounter:{ [key: string]: number } 
	correctAnswers: number;
	//landedOnSquareType: { [squareType: string]: number };
}

interface GameOverallStats {   // Estadísticas del juego
	gameId: string | null;
	roomCode: string | null;
	startTime: Date;
	endTime: Date | null;
	winnerUserId: number | null;
}

const playerColors = gameItems.playerColors;
const wireScaleColor = { fill: 'green', border: 'black' };
const backgroundColor = { color1: "white", color2: "linen", color3: "mintcream" }
const ladderColor = { base: 'sandybrown', rung: 'saddlebrown' };

export default function BoardGame() {
	const [layoutBottom, setLayoutBottom] = useState({ x: 0, y: 0, width: 0, height: 0 });
	const router = useRouter();
	const params = useLocalSearchParams<{
		gameId: string;
		roomCode: string;
		players: string; 
		myDbUserId: string;
	}>();

	const { idUser, userName, token, socketURL, apiURL } = useContextProvider();
	const myActualDbUserId = parseInt(params.myDbUserId, 10);

	// Estados del juego
	const [socket, setSocket] = useState<Socket | null>(null);
	const [playersState, setPlayersState] = useState<PlayerGameState[]>([]);
	const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
	const [gameOverallStats, setGameOverallStats] = useState<GameOverallStats>({
		gameId: params.gameId, roomCode: params.roomCode, startTime: new Date(), endTime: null, winnerUserId: null,
	});
	const [lastDiceResult, setLastDiceResult] = useState(1);
	const [isMyTurn, setIsMyTurn] = useState(false);
	const [gameEnded, setGameEnded] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	// Estados para el modal Educacional
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isGameStatsModalVisible, setIsGameStatsModalVisible] = useState(false);
	const [currentEducationItem, setCurrentEducationItem] = useState<{
		Generation: number;
		Theme: string;
		Information: string;
		Question: string;
		Answer_1: string;
		Answer_2: string;
		Answer_3: string;
		Answer_4: string;
		Answer_Ok: number;
	} | null>(null);
	const [modalType, setModalType] = useState<'Informativo' | 'Pregunta' | null>(null);

	const canvas_width = Dimensions.get('window').width;
	const canvas_height = 2500;
	const hexTiles = gameItems.hexTiles.map((item, index) => {
		const tileEffect = gameItems.tileTypes[item.type]?.effect || 'UNKNOWN'; // Obtener el efecto
		return {
			...item,
			numBox: index,
			effect: tileEffect, // Usaremos 'effect' para las estadísticas
		};
	});
	const wires = gameItems.shortcuts.filter(item => item.from > item.to).map(wire => ({ ...wire, type: 'wire' }));
	const ladders = gameItems.shortcuts.filter(item => item.to > item.from).map(ladder => ({ ...ladder, type: 'ladder' }));
	const allShortcuts = [...wires, ...ladders];

/*	useEffect(() => {   // Actualizar referencia al estado actual de los jugadores
		playersStateRef.current = playersState;
		console.log("playerStateRef updated")
	}, [playersState]);
*/

/*---------------------------------------------------
	ACTUALIZAR CASILLA AL TERMINAR DE GIRAR EL DADO
----------------------------------------------------*/	
	const handleDiceSpinComplete = useCallback((diceValue: number) => {
		setLastDiceResult(diceValue);
		const updatedPlayer = { ...playersState[currentPlayerIndex] }; // Copia del jugador actual
		updatedPlayer.diceRolls++;
		updatedPlayer.targetTile = Math.min(updatedPlayer.currentTile + diceValue, hexTiles.length - 1);
		setPlayersState(prev => prev.map((player, index) => index === currentPlayerIndex ? updatedPlayer : player));

	}, [playersState, currentPlayerIndex]);

/*---------------------------------------------------
	CUANDO EL JUGADOR LLEGUE A SU CASILLA DESTINO
----------------------------------------------------*/	
	const handlePlayerMoveComplete = useCallback((landedTileIndex: number, movedPlayerId: number) => {
		if (gameEnded || playersState.length === 0) return;

		const playerIdx = playersState.findIndex(p => p.dbUserId === movedPlayerId);
		if (playerIdx === -1 || playerIdx !== currentPlayerIndex) {
			console.warn("handlePlayerMoveComplete: Event for non-current player or player not found.", { movedPlayerId, currentPlayerId: playersState[currentPlayerIndex]?.dbUserId, playerIdx });
			return;
		}
		let finalLandedTile = landedTileIndex;
		const currentPlayerSnapshot = playersState[currentPlayerIndex];
		const updatedPlayer = { ...currentPlayerSnapshot };
		//const tileType = hexTiles[landedTileIndex].type;
		const tileEffect = hexTiles[landedTileIndex].effect;
		//updatedPlayer.landedOnSquareType[tileType] = (updatedPlayer.landedOnSquareType[tileType] || 0) + 1;
		updatedPlayer.landedOnTileCounter[tileEffect] += 1;


		
		updatedPlayer.currentTile = landedTileIndex;
		if(updatedPlayer.platForm.length === 0) updatedPlayer.platForm = Platform.OS;
		const shortcut = allShortcuts.find(s => s.from === landedTileIndex);
		if (shortcut && shortcut.to !== landedTileIndex) {   // Aterrizó en un atajo
			finalLandedTile = shortcut.to;
			updatedPlayer.shortcutsTaken += 1;
			if (shortcut.type === "ladder") updatedPlayer.laddersTaken += 1;
			if (shortcut.type === "wire") updatedPlayer.snakesTaken += 1;
			updatedPlayer.targetTile = finalLandedTile; 
			const newPlayersStateWithShortcutTarget = playersState.map((player, idx) =>
				idx === currentPlayerIndex ? updatedPlayer : player
			);
			setPlayersState(newPlayersStateWithShortcutTarget);
			return; // El jugador se moverá de nuevo debido al atajo
		}

		if(tileEffect === 'Positivo') {  // Le daremos 1 punto al jugador
			updatedPlayer.pointsAccumulated += 1;
			Toast.show({ type: 'success', text1: '¡Efecto positivo! 😺', text2: 'Obtuviste un punto por llegar a esta casilla' });
		}
		if(tileEffect === 'Negativo') {  // Le quitaremos 1 punto al jugador
			updatedPlayer.pointsAccumulated -= 1;
			Toast.show({ type: 'error', text1: 'Efecto negativo... 😿', text2: 'Perdiste un punto por llegar a esta casilla' });
		}

		// Actualizar la posición final y verificar ganador
		updatedPlayer.currentTile = landedTileIndex;
		const newPlayersStateAfterLanding = playersState.map((player, idx) =>
			idx === currentPlayerIndex ? updatedPlayer : player
		);
		setPlayersState(newPlayersStateAfterLanding);
		console.log(`Landed on a tile type: ${tileEffect}`)
		if(tileEffect === 'Informativo' || tileEffect ===  'Pregunta') {
			const randomThemeIdx = Math.floor(Math.random() * educationData.themes.length);
			const selectedItem = educationData.themes[randomThemeIdx];
			setCurrentEducationItem(selectedItem);
			setModalType(tileEffect as 'Informativo' | 'Pregunta');
			setIsModalVisible(true);			
		}
		else {
			finalizeTurnAndProceed(updatedPlayer, landedTileIndex, newPlayersStateAfterLanding);
		}

	}, [currentPlayerIndex, playersState, gameEnded, allShortcuts, hexTiles, educationData]);

/*---------------------------------------------------
	FINALIZAR TURNO Y PROCEDER A SIGUIENTE JUGADOR
----------------------------------------------------*/
	const finalizeTurnAndProceed = (playerWhoMoved: PlayerGameState, finalTileIdx: number, authoritativePlayersArray: PlayerGameState[]) => {
		let isGameNowOver = false;
		let winnerOfGame: number | null = null;

		if (finalTileIdx === hexTiles.length - 1) {
			isGameNowOver = true;
			winnerOfGame = playerWhoMoved.dbUserId;
			const winnerPlayerIndex = authoritativePlayersArray.findIndex(p => p.dbUserId === winnerOfGame);
			if (winnerPlayerIndex !== -1) {
				authoritativePlayersArray[winnerPlayerIndex].pointsAccumulated += 25;
				Toast.show({ type: 'info', text1: '¡Bono de Victoria!', text2: `${authoritativePlayersArray[winnerPlayerIndex].userName} gana 25 puntos extra.` });
			}

			const newGameOverallStats = { ...gameOverallStats, winnerUserId: winnerOfGame, endTime: new Date() };
			setGameOverallStats(newGameOverallStats);
			setGameEnded(true);
			setIsMyTurn(false);
			Toast.show({ type: 'success', text1: '¡Fin del Juego!', text2: `${playerWhoMoved.userName} es el ganador.` });
			saveGameStats();
			setIsGameStatsModalVisible(true);
		}

		const nextPlayerTurnIdx = (currentPlayerIndex + 1) % authoritativePlayersArray.length;

		if (socket) {
			socket.emit('broadcastGameState', {
				roomCode: params.roomCode,
				gameState: { playersState: authoritativePlayersArray, currentPlayerIndex: nextPlayerTurnIdx, gameEnded: isGameNowOver, winnerUserId: winnerOfGame, lastDiceResult }
			});
		}
		if (!isGameNowOver) {
			setCurrentPlayerIndex(nextPlayerTurnIdx);
			const nextPlayer = authoritativePlayersArray[nextPlayerTurnIdx];
			if (nextPlayer) {
				setIsMyTurn(nextPlayer.dbUserId === myActualDbUserId);
			} else {
				console.warn("El siguiente jugador es indefinido, no se puede establecer isMyTurn");
				setIsMyTurn(false);
			}
		}		
	};
/*---------------------------------------------------
	INICIALIZAR ESTADÍSTICAS DEL JUEGO AL ENTRAR
----------------------------------------------------*/	
	useEffect(() => {   
		if (params.players && params.gameId && params.roomCode && params.myDbUserId) {
			try {
				const parsedPlayers: PlayerInfoFromLobby[] = JSON.parse(params.players);
				const initialPlayersState: PlayerGameState[] = parsedPlayers.map((p, index) => ({
					dbUserId: p.dbUserId,
					userName: p.userName,
					platForm: '',
					color: playerColors[index % playerColors.length],
					currentTile: 0,
					targetTile: 0,
					diceRolls: 0,
					pointsAccumulated: 0, 
					shortcutsTaken: 0,
					laddersTaken: 0,
					snakesTaken: 0,
					landedOnTileCounter: {Inicio: 0, Ninguno: 0, Positivo: 0, Negativo: 0, Informativo: 0, Pregunta: 0, Especial: 0, Meta: 0},
					correctAnswers: 0
				}));

				setPlayersState(initialPlayersState);
				setGameOverallStats({
					gameId: params.gameId,
					roomCode: params.roomCode,
					startTime: new Date(),
					endTime: null,
					winnerUserId: null,
				});
				setCurrentPlayerIndex(0);
				setIsMyTurn(initialPlayersState[0]?.dbUserId === myActualDbUserId);
				setIsLoading(false);
				console.log("Juego inicializado para:", initialPlayersState.map(p => p.userName).join(', '));
			} catch (error) {
				console.error("Error inicializando el juego:", error);
				Toast.show({ type: 'error', text1: 'Error de Juego', text2: 'No se pudo cargar la información de la partida.' });
				router.back();
			}
		} else {
			Toast.show({ type: 'error', text1: 'Error de Configuración', text2: 'Faltan datos para iniciar la partida.' });
			router.back();
		}
	}, []);

/*---------------------------------------------------
	GUARDAR ESTADÍSTICAS DEL JUEGO EN BDD AL FINALIZAR
----------------------------------------------------*/	
	const saveGameStats = async () => {
		const finalPlayersState = playersState; // Usar el estado más reciente
		const finalGameStats = { ...gameOverallStats, endTime: gameOverallStats.endTime || new Date() };

		finalGameStats.winnerUserId = finalPlayersState[currentPlayerIndex].dbUserId

		if (!finalGameStats.gameId || !finalGameStats.startTime || !finalGameStats.endTime || finalGameStats.winnerUserId === null) {
			Toast.show({ type: 'error', text1: 'Error Interno', text2: 'Faltan datos para guardar estadísticas.' });
			return;
		}

		const gameDataToSave = {
			gameId: finalGameStats.gameId,
			roomCode: finalGameStats.roomCode,
			startTime: finalGameStats.startTime.toISOString().slice(0, 19).replace('T', ' '),
			endTime: finalGameStats.endTime.toISOString().slice(0, 19).replace('T', ' '),
			winnerUserId: finalGameStats.winnerUserId,
			players: finalPlayersState.map(p => ({
				dbUserId: p.dbUserId,
				platform: p.platForm,
				diceRolls: p.diceRolls,
				pointsAccumulated: p.pointsAccumulated,
				shortcutsTaken: p.shortcutsTaken,
				laddersTaken: p.laddersTaken,
				snakesTaken: p.snakesTaken,
				landedOnTileCounter: p.landedOnTileCounter,
				finalTile: p.currentTile,
				correctAnswers: p.correctAnswers,
			})),
		};
		await fetch(apiURL + '/game-stats', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'authorization': token,
			},
			body: JSON.stringify(gameDataToSave),
		})
			.then(response => response.json())
			.then(data => {
				Toast.show({ type: 'success', text1: 'Juego Guardado', text2: 'Las estadísticas del juego han sido guardadas con éxito.' });
			})
			.catch(error => Toast.show({ type: 'error', text1: 'Error', text2: error.message }))
	};

/*----------------------------------------------
	// DEFINICIÓN DEL SOCKET PARA MULTIJUGADOR
------------------------------------------------*/	
	useEffect(() => {
		if (!socketURL || !params.roomCode || !idUser || isLoading) return;
		const socketInstance = io(socketURL, {
			query: {
				dbUserId: idUser,
				userName: userName,
			},
			transports: ['websocket'],
		});
		setSocket(socketInstance);

		socketInstance.on('connect', () => {
			console.log(`BoardGame: Conectado al servidor Socket.IO (${socketInstance.id})`);
			socketInstance.emit('joinBoardGameRoom', { roomCode: params.roomCode });
		});

		socketInstance.on('gameStateUpdated', (receivedGameState: {
			playersState: PlayerGameState[];
			currentPlayerIndex: number;
			gameEnded: boolean;
			winnerUserId: number | null;
			lastDiceResult: number;
		}) => {
			setPlayersState(receivedGameState.playersState);
			setCurrentPlayerIndex(receivedGameState.currentPlayerIndex);
			setGameEnded(receivedGameState.gameEnded);
			setLastDiceResult(receivedGameState.lastDiceResult);
			if (receivedGameState.winnerUserId) {
				setGameOverallStats(prev => ({ ...prev, winnerUserId: receivedGameState.winnerUserId, endTime: prev.endTime || new Date() }));
			}
			if (receivedGameState.gameEnded) {
				setIsGameStatsModalVisible(true); // Mostrar modal a todos los jugadores cuando el juego termina
				setIsMyTurn(false); // Nadie tiene el turno si el juego terminó
			} else {
				// Recalcular isMyTurn basado en el estado recibido solo si el juego no ha terminado
				setIsMyTurn(receivedGameState.playersState[receivedGameState.currentPlayerIndex]?.dbUserId === myActualDbUserId);
			}			
		});

		socketInstance.on('disconnect', (reason) => {
			console.log('BoardGame: Desconectado del servidor Socket.IO:', reason);
			Toast.show({ type: 'info', text1: 'Desconectado del Juego', text2: 'Se perdió la conexión con la partida.' });
		});

		return () => {
			socketInstance.disconnect();
			setSocket(null);
		};
	}, [isLoading]); 

/*---------------------------------------------------
	HANDLE MODAL ACTIONS
----------------------------------------------------*/
	const handleModalClose = (playersStateAfterQuestion?: PlayerGameState[]) => {    // el Modal de Información o Pregunta se cerró
		setIsModalVisible(false);
		const effectivePlayersState = modalType === 'Pregunta' ? playersStateAfterQuestion || playersState : playersState;
		const playerFinalizingTurn = effectivePlayersState[currentPlayerIndex];
		const finalLandedTileForThisPlayer = playerFinalizingTurn.currentTile;

		setCurrentEducationItem(null); 
		setModalType(null);

		finalizeTurnAndProceed(playerFinalizingTurn, finalLandedTileForThisPlayer, effectivePlayersState);
	};

	const handleAnswer = (selectedAnswer: number) => {    // Evaluamos la respuesta del Modal de pregunta
		let newPlayersState = [...playersState];
		if (currentEducationItem) {
				const updatedPlayer = { ...playersState[currentPlayerIndex] };
			if (selectedAnswer === currentEducationItem.Answer_Ok) {
				// Dar 5 puntos porque respondió correctamente
				updatedPlayer.pointsAccumulated += 5;
				updatedPlayer.correctAnswers += 1;
				Toast.show({ type: 'success', text1: '¡Correcto!', text2: 'Respuesta acertada. ¡Has ganado 5 puntos!' });
			} else {
				// Quitar 5 puntos porque falló la respuesta
				updatedPlayer.pointsAccumulated -= 5;
				const answers = [currentEducationItem.Answer_1, currentEducationItem.Answer_2, currentEducationItem.Answer_3, currentEducationItem.Answer_4]
				Toast.show({ type: 'error', text1: 'Incorrecto', text2: `La respuesta correcta era la opción ${answers[currentEducationItem.Answer_Ok-1]}; Pierdes 5 puntos.` });
			}
			newPlayersState = playersState.map((player, index) =>
				index === currentPlayerIndex ? updatedPlayer : player
			);
			setPlayersState(newPlayersState);			

		}
		handleModalClose(newPlayersState);
	};

	// Handlers for Game Stats Modal
	const handleOpenGameStatsModal = () => {
		setIsGameStatsModalVisible(true);
	};

	const handleCloseGameStatsModal = () => {
		setIsGameStatsModalVisible(false);
		if(gameOverallStats.winnerUserId !== null) {
			router.back();
		}
	};


/*---------------------------------------------------
	MOSTRAR PANTALLA DE CARGA 
---------------------------------------------------*/
	if (isLoading || playersState.length === 0) {
		console.log(`${isLoading}, ${playersState.length}`);
		return (
			<View style={styles.centeredLoading}>
				<ActivityIndicator size="large" color="#6599C3" />
				<Text style={styles.loadingText}>Cargando partida...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Animated.View style={styles.gameArea}>
				<Animated.ScrollView>
					<Svg width="100%" height={canvas_height} >
						<Background width={canvas_width} height={canvas_height} colors={backgroundColor} />

						{hexTiles.map((item, index) => {
							return (<HexTile {...item} key={index} />)
						})}
						{wires.map((wire, index) => {
							return (
								<Wire key={index} width={10} scaleColor={wireScaleColor}
									from={hexTiles[wire.from].pos}
									to={hexTiles[wire.to].pos}
								/>)
						})}
						{ladders.map((ladder, index) => {
							return (
								<Ladder key={index} scale={1} color={ladderColor}
									from={hexTiles[ladder.from].pos}
									to={hexTiles[ladder.to].pos}
								/>)
						})}

						{/* Renderizar un Player por cada jugador */}
						{playersState.map((player) => (
							<Player
								key={`player-${player.dbUserId}`}
								playerId={player.dbUserId}
								targetTile={player.targetTile}
								initialTile={player.currentTile} 
								scale={0.8}
								color={player.color}
								onMoveComplete={handlePlayerMoveComplete}
								tilesCoords={hexTiles.map(b => b.pos)} 
							/>
						))}


					</Svg>
				</Animated.ScrollView>
			</Animated.View>

			<View style={styles.controlArea} onLayout={(event: any) => { setLayoutBottom(event.nativeEvent.layout) }}>
				{/* Hexágono contenedor del dado */}
				<View style={[styles.diceContainer, { left: layoutBottom.width / 2 - 72 }]}>
					<Svg width="100%" height={layoutBottom.height + 85}>
						<Hexagon
							pos={{ x: 72, y: 83.14 }} radius={83.14} rotation={30} borderWidth={0}
							colors={{ fill: '#6599C3', border: 'black' }}
						/>
					</Svg>
				</View>

				{/* Dado */}
				<Animated.View style={[styles.diceContainer, { left: layoutBottom.width / 2 - 72 }]}>
					{isMyTurn && (
						<Svg width="100%" height={layoutBottom.height + 85}>
							<Dice
								initialValue={1} // Dice always starts at 1 visually
								onSpinComplete={handleDiceSpinComplete} // Callback for when spin ends
								position={{ x: 33, y: 20 }}
								scale={1} lineWidth={1}
								colors={{ faceUpColor: 'white', faceLeftColor: 'white', faceRightColor: 'white', line: '#6599C3', dots: '#6599C3' }}
							/>
						</Svg>
					)}
					{/* Mostrar quien tiene el turno cuando no es mi turno  */}
					{!isMyTurn && <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: -70}}>
 						<Text style={styles.turnOf}>Turno de</Text>
						<Text style={styles.currentPlayer}>{playersState[currentPlayerIndex].userName}</Text>
					</View>}
				</Animated.View>
				
				<Animated.View style={{zIndex: 1}}>
					<Svg>
						{/* Linea de cubos inferior */}
						{Array.from({ length: (layoutBottom.width / (176 * 0.38)) + 1 }, (_, i) => i).map((item, index) => {
							return (
								<Cube
									key={index}
									x={item * 176 * 0.38 - 15} y={layoutBottom.height - 37}
									scale={0.38} lineWidth={1}
									colors={{ faceUp: '#6599C3', faceLeft: '#6599C3', faceRight: '#6599C3', line: 'white' }}
								/>
							)
						})}
						{ /* Hex con trofeo   handleOpenGameStatsModal */}
						<G onPress={handleOpenGameStatsModal}>
							<Hexagon
								pos={{ x: 52, y: layoutBottom.height - 55 }} radius={37} rotation={30} borderWidth={0}
								colors={{ fill: 'white', border: 'white' }}
							/>
							<Path d={gameItems.trophyIcon} x={20} y={layoutBottom.height - 80} fillRule="evenodd" clipRule="evenodd" fill='#6599C3' scale={3} />
						</G>
						{/* Hex con infoIcon -- funcionalidad futura
						<Hexagon
							pos={{ x: 320, y: layoutBottom.height - 55 }} radius={37} rotation={30} borderWidth={0}
							colors={{ fill: 'white', border: 'white' }}
						/>
						<Path d='M16 8 C16 12.4 12.4 16 8 16 C3.6 16 0 12.4 0 8 C0 3.6 3.56 0 8 0 C12.4 0 16 3.6 16 8 Z' x={295} y={layoutBottom.height - 80} scale={3} fill='#6599C3' />
						<Path d={gameItems.infoIcon} x={295} y={layoutBottom.height - 80} fill-rule="evenodd" clip-rule="evenodd" fill='white' scale={3} />
						*/}
					</Svg>
				</Animated.View>
			</View>
			<ModalEducation
				educationItem={currentEducationItem}
				modalType={modalType}
				isModalVisible={isModalVisible}
				handleModalClose={handleModalClose}
				handleAnswer={handleAnswer}
			/>
			<ModalGameStats
				isVisible={isGameStatsModalVisible}
				onClose={handleCloseGameStatsModal}
				startTime={gameOverallStats.startTime}
				players={playersState}
				roomCode={params.roomCode}
				creatorName={playersState[0].userName}
				winnerUserId={gameOverallStats.winnerUserId}
				myActualDbUserId={myActualDbUserId}
			/>

		</View>
	)

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		//width: Platform.OS === "web" ? 400 : "100%",
		backgroundColor: '#6599C3',
		alignItems: "center",
		justifyContent: "center",
		width: '100%',
		height: '100%',
	},
	gameArea: {
		flex: 85,
		width: "100%",
		height: "300%",
		backgroundColor: 'white',
	},
	controlArea: {
		flex: 15,
		backgroundColor: 'transparent',
		width: "100%",
	},
	diceContainer: {
		top: -50,
		width: 144,
		height: 50,
		position: 'absolute',
	},
	turnOf: {
		fontSize: 16,
		color: 'white',
		fontFamily: 'Manrope_600SemiBold'
	},
	currentPlayer: {
		fontSize: 24,
		color: 'white',
		fontFamily: 'Manrope_800ExtraBold'
	},


	centeredLoading: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#6599C3',
	},
	loadingText: {
		marginTop: 10,
		fontSize: 16,
		color: 'white',
		fontFamily: 'Manrope_600SemiBold',
	},
})