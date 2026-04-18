import API from './axiosConfig';

const leadApi = {
  createLead: async (data) => {
    try {
      const response = await API.post('/leads', data);
      return response.data;
    } catch (error) {
      console.error('Lead API Error:', error);
      throw error;
    }
  },

  getLeads: async () => {
    try {
      const response = await API.get('/leads');
      return response.data;
    } catch (error) {
      console.error('Fetch Leads Error:', error);
      throw error;
    }
  },

  getLeadById: async (id) => {
    const response = await API.get(`/leads/${id}`);
    return response.data;
  },

  updateLead: async (id, data) => {
    const response = await API.put(`/leads/${id}`, data);
    return response.data;
  },

  deleteLead: async (id) => {
    const response = await API.delete(`/leads/${id}`);
    return response.data;
  },

  addNote: async (id, noteData) => {
    const response = await API.post(`/leads/${id}/notes`, noteData);
    return response.data;
  },

  getAllLeads: async () => {
    try {
      const response = await API.get('/leads');
      return response.data;
    } catch (error) {
      console.error('Fetch All Leads Error:', error);
      throw error;
    }
  },
};

export default leadApi;
