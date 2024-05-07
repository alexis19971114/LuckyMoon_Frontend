import axios from "axios";
const BASE_URL = "http://139.180.128.169:52222";

const getCustomAxios = () => {
	// console.log("refresh token");
	return axios.create({
		baseURL: BASE_URL,
		// headers: {
		// 	// Authorization: `Bearer ${
		// 	//   JSON.parse(localStorage.getItem("user"))?.token
		// 	// }`,
		// 	"Content-Type": `application/json`,
		// },
	});
};

export default getCustomAxios;

const token_endpoint = "/api/v1/contractInfo";

export { BASE_URL, token_endpoint };
