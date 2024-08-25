// StadionService.ts
import axios from 'axios';

const API_URL = 'https://localhost:7251/api/Stadion'; // Adjust this to your API URL

const getAllStadiums = async (): Promise<any> => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const getStadiumById = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

export default {
    getAllStadiums,
    getStadiumById
};
