import axios from 'axios';
import { swal } from '../utilities/Utilities';

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    withCredentials: true
});
instance.interceptors.response.use(response => response, error => {
    const errRes = error.response;
    if (errRes) {
        if (errRes.config.url === '/account/register' && errRes.status === 400) {
            swal.fire({
                title: 'Error!',
                text: 'Username already taken',
                icon: 'error'
            });
        }
        if (errRes.config.url === '/account/login' && [400, 401].includes(errRes.status)) {
            swal.fire({
                title: 'Error!',
                text: 'Invalid username/password',
                icon: 'error'
            });
        }
    }
    return Promise.reject(error);
});

export const get = async <T>(url: string) => {
    const response = await instance.get<T>(url);
    return response.data;
};
export const post = async (url: string, data?: any) => await instance.post(url, data);