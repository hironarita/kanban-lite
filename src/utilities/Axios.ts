import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});

export const get = async <T>(url: string) => {
    const response = await instance.get<T>(url);
    return response.data;
};
export const post = async (url: string, data: any) => await instance.post(url, data);