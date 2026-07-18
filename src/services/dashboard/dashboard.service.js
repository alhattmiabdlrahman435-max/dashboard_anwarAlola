import { api } from '../api';

export const dashboardService = {
  getStats: () => {
    return api.get("/api/dashboard/stats");
  }
};
