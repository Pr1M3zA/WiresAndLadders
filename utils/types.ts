type BoardType = {
	id: number, 
	board_name: string, 
	width: number, 
	height: number, 
	rect_width: number, 
	rect_height: number, 
	path1: string, 
	path2: string, 
	color_rect: string, 
	color_path1: string, 
	color_path2: string, 
	education: number,
}

type DiceType = {
	id: number, 
	dice_name: string, 
	color_faceup: string, 
	color_faceleft: string, 
	color_faceright: string, 
	color_dots: string, 
	color_border: string, 
	border_width: number, 
	scale: number
}

type EducationType = {
   id: number,
   generation: number, 
   theme: string, information: string, question: string, 
   answer_1: string, answer_2: string, answer_3: string, answer_4: string, answer_ok: number
}

type TileType = {
   id: number, 
	id_board: number,
   num_tile: number, 
   pos_x: number, 
   pos_y: number, 
   tile_type: number,
   rotation: number, 
   radius: number,
   border_width: number,
   effect_name: string,
	direction: number
}

type EffectType = {
	id: number,
	effect_name: string,
	color_fill: string, color_border: string, color_path1: string, color_path2: string,
	path1: string, path2: string,	
	paths_x: number, paths_y: number, paths_scale: number
}

type ShortCutType ={
	id: number; id_board: number;
   from_tile: number;  to_tile: number;
}

type PlayerInfoFromLobby = {   // Información del usuario que envía el Lobby
	socketId: string;
	dbUserId: number;
	userName: string;
	idBoard: number;
}

type PlayerGameState = {  // Para llevar estadísticas del jugador en el desarrollo del juego
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

type GameOverallStats = {   // Estadísticas del juego
	gameId: string | null;
	roomCode: string | null;
	startTime: Date;
	endTime: Date | null;
	winnerUserId: number | null;
}

type GameBoardParams = {
	gameId: string;
	roomCode: string;
	players: string; 
	idBoard: string;
	isCreator: string;
}

type BoardBackgroundType = {
	background_name: string, 
	rect_width: number,  rect_height: number, 
	color_rect: string, color_path1: string, color_path2: string, 
	path1: string, path2: string
}

type DbBoardType = {
	id: number, id_background: number, 
	board_name: string, 	board_description: string, 
	width: number, height: number, 
	education: number,
}

export type {
	BoardType, DiceType, EducationType, TileType, ShortCutType, EffectType, 
	PlayerInfoFromLobby, PlayerGameState, GameOverallStats, GameBoardParams, 
	BoardBackgroundType, DbBoardType
}
