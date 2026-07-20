import { api } from '../api';

export const notificationsService = {
  getNotifications: (queryString = '') => {
    return api.get(`/api/notifications${queryString}`);
  },
  
  sendNotification: (payload) => {
    return api.post("/api/notifications/send", payload);
  },
  
  markNotificationAsRead: (id) => {
    return api.put(`/api/notifications/${id}/read`);
  },
  
  deleteNotification: (id) => {
    return api.delete(`/api/notifications/${id}`);
  },
  
  deleteAllNotifications: () => {
    return api.delete("/api/notifications-delete-all");
  }
};
