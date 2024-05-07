import { useState, useEffect, createContext, useContext } from "react";
import { io } from "socket.io-client";
import { SERVER_URL } from "./utils";
import { MAX_NUMBER } from "./utils";

const SocketContext = createContext(null);
export const useSocketContext = () => useContext(SocketContext);
const socket = io(SERVER_URL);
const initialContextValue = {
	socket,
	tokens: [],
	profitable: {
		active: false,
		buyCount: 0,
		sellCount: 0,
		swapCount: 0,
		price: MAX_NUMBER,
		ratio: MAX_NUMBER,
		owner: false,
		lock: false,
		reow:	false,
		reli: false, 
		star: false,
		snipedMin: 5,
		snipedMax: MAX_NUMBER,
		nonce: 5,
		snipers: 1,
		bgMinCount: 0,
		bgMaxRate: 1,
		masMaxRate: 1,
		mevSpecialRate: 0.8
	},
	mode: "all",
	loading: false,
}
export default function SocketContextProvider({ children }) {
	const [contextValue, setContextValue] = useState(initialContextValue);
			
	const updateContextValue = newValue => {
		setContextValue(newValue);
		// localStorage.setItem('contextValue', newValue)
  };

	useEffect(() => {
		// localStorage.setItem('contextValue', initialContextValue)
	}, [initialContextValue])

	useEffect(() => {
		socket.on("connect", () => {
			console.log("Socket ID", socket.id); // x8WIv7-mJelg7on_ALbx
			updateContextValue({
				...contextValue,
				loading: true,
			})
			// updateContextValue(localStorage.getItem('contextValue'))
		});
		socket.on("disconnect", (reason) => {
			updateContextValue({
				...contextValue,
				loading: false,
			})
			alert("socket is disconnected");
		});
	}, []);

	// document.addEventListener('keydown', function(event) {
	// 	if (event.key === 'F5' || (event.keyCode === 116)) {
	// 		updateContextValue(localStorage.getItem('contextValue'))
	// 		console.log('F5 key was pressed');
	// 	} else if (event.ctrlKey && event.key === 'r') {
	// 		updateContextValue(localStorage.getItem('contextValue'))
	// 		console.log('Ctrl + R keys were pressed');
	// 	}
	// });
	
	return (
		<SocketContext.Provider value={ {contextValue, updateContextValue} }>{children}</SocketContext.Provider>
	);
}
