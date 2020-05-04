import axios from 'axios';
import Swal from 'sweetalert2';

const instance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true
});
instance.interceptors.response.use(response => response, error => {
    const errRes = error.response;
    if (errRes.config.url === '/account/register' && errRes.status === 400) {
        Swal.fire({
            title: 'Error!',
            text: 'Username already taken',
            icon: 'error'
        });
    }
    return Promise.reject(error);
});

export const get = async <T>(url: string) => {
    const response = await instance.get<T>(url);
    return response.data;
};
export const post = async (url: string, data: any) => await instance.post(url, data);