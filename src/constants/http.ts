import axios from 'axios';

import { CONFIG } from '../config';

export const instance = axios.create({ baseURL: CONFIG.BASE_API_URL, withCredentials: true });
