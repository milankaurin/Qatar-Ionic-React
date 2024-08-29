import axios from 'axios';

const API_URL = 'https://localhost:7251/api/Auth';

const login = async (username: string, password: string): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/login`, { username, password });
        if (response.data.token) {
            sessionStorage.setItem('token', response.data.token);
            sessionStorage.setItem('firstName', response.data.firstName);
            sessionStorage.setItem('lastName', response.data.lastName);
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        }
        return response.data;
    } catch (error) {
        throw error;
    }
};

const register = async (username: string, password: string, firstName: string, lastName: string): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/register`, { username, password,  firstName,
            lastName});
        return response.data;
    } catch (error) {
        throw error;
    }
};


const logout = (): void => {
    sessionStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
};

export default {
    login,
    register,
    logout
};
