import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { type BoardType, type ShortCutType, type TileType, type EffectType, DiceType } from './types';

interface contextProps {
	token: string;
	setToken: (token: string) => void;
	idUser: number,
	setIdUser: (idUser: number) => void;
	userName: string;
	setUserName: (userName: string) => void;
	adminUser: boolean;
	setAdminUser: (adminUser: boolean) => void;
	defBoard: number;
	setDefBoard: (defBoard: number) => void;
	defDice: number;
	setDefDice: (defDice: number) => void;	
	apiURL: string;
	socketURL: string;
   socket: Socket | null;
   setSocket: (socket: Socket | null) => void;	
	boards: BoardType[];
	setBoards: (boards: BoardType[]) => void;
	tiles: TileType[];
	setTiles: (tiles: TileType[]) => void;
	tileTypes: EffectType[];
	setTileTypes: (tileTypes: EffectType[]) => void;
	shortcuts: ShortCutType[];
	setShortcuts: (shortcuts: ShortCutType[]) => void;
	dices: DiceType[];
	setDices: (dices: DiceType[]) => void;
}
interface providerProps { children: ReactNode; }


const Context = createContext<contextProps>({
	token: '', setToken: () => { },
	idUser: 0, setIdUser: () => { },
	userName: '', setUserName: () => { },
	apiURL: '', socketURL: '',
	adminUser: false, setAdminUser: () => { },
	defBoard: 1, setDefBoard: () => { },
	defDice: 1, setDefDice: () => {},
	boards: [], setBoards: () => { },
	tiles: [], setTiles: () => { },
	tileTypes: [], setTileTypes: () => { },
	shortcuts: [], setShortcuts: () => { },
	dices: [], setDices: () => { },
	socket: null, setSocket: () => { }
});

export const ContextProvider: React.FC<providerProps> = ({ children }) => {
	const [token, setToken] = useState('');
	const [idUser, setIdUser] = useState(0);
	const [userName, setUserName] = useState('guest');
	const [adminUser, setAdminUser] = useState(false);
	const [defBoard, setDefBoard] = useState(1);
	const [defDice, setDefDice] = useState(1);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [boards, setBoards] = useState<BoardType[]>([]);
	const [tiles, setTiles] = useState<TileType[]>([]);
	const [tileTypes, setTileTypes] = useState<EffectType[]>([]);
	const [shortcuts, setShortcuts] = useState<ShortCutType[]>([]);
	const [dices, setDices] = useState<DiceType[]>([]);
	//const apiURL = 'http://192.168.68.115:3000';
	//const socketURL = 'http://192.168.68.115:3001';
	const apiURL = 'https://wires-and-ladders-api.vercel.app';   
	const socketURL = 'https://wires-and-ladders-socket.onrender.com';	 

	return (
		<Context.Provider value={{ 
				token, setToken, idUser, setIdUser, userName, setUserName, adminUser, setAdminUser, defBoard, setDefBoard, defDice, setDefDice,
				boards, setBoards, tiles, setTiles, shortcuts, setShortcuts, tileTypes, setTileTypes, dices, setDices,
				apiURL, socketURL, socket, setSocket }}>
			{children}
		</Context.Provider>
	);
}

export const useContextProvider = () => {
	return useContext(Context);
};
