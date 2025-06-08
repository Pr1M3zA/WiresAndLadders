import { FC } from 'react'
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native'

interface PlayerGameState {  // Para llevar estadísticas del jugador en el desarrollo del juego
	dbUserId: number;
	userName: string;
	color: { fill: string; border: string; eyes: string }
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

interface ModalGameStatsProps {
	isVisible: boolean;
	onClose: () => void;
	startTime: Date;
	players: PlayerGameState[];
	roomCode: string;
	creatorName: string
	winnerUserId: number | null;
	myActualDbUserId: number;
}

const ModalGameStats: FC<ModalGameStatsProps> = (props) => {
	if (!props.isVisible) return null;
	const sortedPlayers = [...props.players].sort((a, b) => b.pointsAccumulated - a.pointsAccumulated);
	const formatTime = props.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	let iAmWinner = false;
	let winner: PlayerGameState | undefined;
	if (props.winnerUserId !== null) {
		iAmWinner = props.winnerUserId === props.myActualDbUserId;
		winner = sortedPlayers.find(p => p.dbUserId === props.winnerUserId);
	}
	

	return (
		<View>
			<Modal animationType="slide" transparent={true} visible={props.isVisible} onRequestClose={props.onClose}>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						{iAmWinner && <>
								<Text style={styles.modalTitle}>¡Felicidades!</Text>
								<Text style={styles.modalTitle}>Haz Ganado la partida!</Text>
						</>}
						{!iAmWinner && props.winnerUserId !== null && <>
							<Text style={styles.modalTitle}>¡Perdiste!</Text>
							<Text style={styles.modalTitle}>El ganador fue: {winner?.userName}</Text>
						</> } 
						<Text style={styles.modalTitle}>Estadísticas de la Partida</Text>
						<Text style={styles.infoText}><Text style={styles.infoLabel}>Código de Sala:</Text> {props.roomCode}</Text>
						<Text style={styles.infoText}><Text style={styles.infoLabel}>Anfitrión:</Text> {props.creatorName}</Text>
						<Text style={styles.infoText}><Text style={styles.infoLabel}>Hora de Inicio:</Text> {formatTime}</Text>

						<Text style={styles.rankingTitle}>Ranking Actual:</Text>
						{sortedPlayers.map((player, index) => (
							<View key={player.dbUserId} style={styles.playerRankItem}>
								<Text style={styles.playerRankText}>{index + 1}. {player.userName}</Text>
								<Text style={styles.playerRankText}>{player.pointsAccumulated} puntos</Text>
							</View>
						))}

						<TouchableOpacity style={styles.closeButton} onPress={props.onClose}>
							<Text style={styles.closeButtonText}>Cerrar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};


const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
	},
	modalView: {
		margin: 20,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 25, // Reducido un poco para más espacio
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		width: '90%',
		maxHeight: '80%',
	},
	modalTitle: {
		fontSize: 22, // Ligeramente más grande
		fontWeight: 'bold',
		marginBottom: 20, // Más espacio
		textAlign: 'center',
		color: '#365C80', // Color principal
	},
	infoText: {
		fontSize: 16,
		marginBottom: 10, // Más espacio
		color: '#555',
		textAlign: 'left',
		width: '100%',
	},
	infoLabel: {
		fontWeight: 'bold',
		color: '#6599C3', // Color secundario
	},
	rankingTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 20, // Más espacio
		marginBottom: 10,
		color: '#365C80',
	},
	playerRankItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		paddingVertical: 8, // Más padding
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	playerRankText: {
		fontSize: 16,
		color: '#444',
	},
	closeButton: {
		backgroundColor: '#6599C3',
		borderRadius: 10,
		paddingVertical: 12, // Más padding
		paddingHorizontal: 25, // Más padding
		elevation: 2,
		marginTop: 25, // Más espacio
	},
	closeButtonText: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
		fontSize: 16,
	},
});

export default ModalGameStats;