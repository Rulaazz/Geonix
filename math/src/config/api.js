const API_URL = (
  process.env.REACT_APP_API_URL || 'http://localhost:5001'
).replace(/\/+$/, '');

export const API_BASE_URL = API_URL;
export const SOCKET_URL = API_URL;
