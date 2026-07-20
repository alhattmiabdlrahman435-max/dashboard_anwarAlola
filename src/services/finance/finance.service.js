import { api } from '../api';

export const financeService = {
  getFinanceStudents: (queryString = '') => {
    return api.get(`/api/finance/students${queryString}`);
  },
  
  getFinanceStats: () => {
    return api.get("/api/finance/stats");
  },
  
  addPayment: (payload) => {
    return api.post("/api/finance/payment", payload);
  }
};
