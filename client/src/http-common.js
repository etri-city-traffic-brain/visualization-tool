import axios from 'axios';

// eslint-disable-next-line import/prefer-default-export
export const HTTP = axios.create({
  // baseURL: `http://localhost:3001/`,
  baseURL: '',
  headers: {
    Authorization: 'Bearer {token}',
  },
});
