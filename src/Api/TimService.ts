// TimService.ts
import axios from 'axios';

const API_URL = 'https://localhost:7251/api/Tim'; // Adjust this to your API URL

const getTeamsByGroupId = async (groupId: number): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/byGrupa/${groupId}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const createTeam = async (teamData: any): Promise<any> => {
    try {
        const response = await axios.post(API_URL, teamData);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const getTeamById = async (id: number): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

const deleteTeamsByGroupId = async (groupId: number): Promise<any> => {
    try {
        return await axios.delete(`${API_URL}/tim/byGrupa/${groupId}`);
    } catch (error: any) {
        throw error;
    }
};

export default {
    getTeamsByGroupId, 
    createTeam, 
    getTeamById,
    deleteTeamsByGroupId
};
