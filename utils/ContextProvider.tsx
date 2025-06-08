import React, { createContext, useContext, useState, ReactNode } from 'react';

interface contextProps {
	token: string;
	setToken: (token: string) => void;
	idUser: number,
	setIdUser: (idUser: number) => void;
	userName: string;
	setUserName: (userName: string) => void;
	adminUser: boolean;
	setAdminUser: (adminUser: boolean) => void;
	apiURL: string;
	socketURL: string;
}
interface providerProps { children: ReactNode; }


const Context = createContext<contextProps>({
	token: '', setToken: () => { },
	idUser: 0, setIdUser: () => { },
	userName: '', setUserName: () => { },
	apiURL: '', socketURL: '',
	adminUser: false, setAdminUser: () => { }
});

export const ContextProvider: React.FC<providerProps> = ({ children }) => {
	const [token, setToken] = useState('');
	const [idUser, setIdUser] = useState(0);
	const [userName, setUserName] = useState('guest');
	const [adminUser, setAdminUser] = useState(false);
	const apiURL = 'https://wires-and-ladders-api.vercel.app';   
	const socketURL = 'https://wires-and-ladders-socket.onrender.com';	 

	return (
		<Context.Provider value={{ token, setToken, idUser, setIdUser, userName, setUserName, adminUser, setAdminUser, apiURL, socketURL }}>
			{children}
		</Context.Provider>
	);
}

export const useContextProvider = () => {
	return useContext(Context);
};
