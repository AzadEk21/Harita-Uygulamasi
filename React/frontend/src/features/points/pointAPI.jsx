import axios from "../../utils/axiosWithAuth"; 

export const fetchPoints = async () => {
  const res = await axios.get("https://localhost:7261/api/point");
  return res.data;
};

export const addPoint = async (data) => {
  const res = await axios.post("https://localhost:7261/api/point", data);
  return res.data;
};
