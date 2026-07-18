import { api } from '../api';

export const financeService = {
  getFinanceStudents: () => {
    return api.get("/api/finance/students");
  },
  
  addPayment: (payload) => {
    return api.post("/api/finance/payment", payload);
  }
};
