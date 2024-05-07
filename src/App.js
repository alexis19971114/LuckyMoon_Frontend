import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Route, Routes } from "react-router-dom";
import Main from "./components/Main";
import TokenPage from "./components/TokenPage";
import MevBot from "./components/pages/mevbot";

function App() {
	return (
		<Routes>
			<Route path="/" element={<Main />} />
			<Route path="/:address" element={<TokenPage />} />
			<Route path="/mevbot" element={<MevBot />} />
		</Routes>
	);
}

export default App;
