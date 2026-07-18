import { api } from '../api';

export const authService = {
  getCurrentUser: () => {
    return api.get("/api/me");
  },
  
  login: (username, password, role) => {
    return fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password, role })
    }).then(res => res.json());
  },

  logout: () => {
    return api.post("/api/logout");
  }
};
