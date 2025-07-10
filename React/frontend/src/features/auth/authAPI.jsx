import { jwtDecode } from "jwt-decode";
import axios from "../../utils/axiosWithAuth";

export const login = async ({ username, password }) => {
  const response = await axios.post("https://localhost:7261/api/auth/login", {
    username,
    password,
  });

  const token = response.data.token;
  const decoded = jwtDecode(token);
  const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  return { token, username, role };
};
