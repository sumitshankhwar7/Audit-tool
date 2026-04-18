import API from './axiosConfig';

const scoringApi = {
    getRules: async () => {
        try {
            const response = await API.get('/scoring');
            return response.data;
        } catch (error) {
            console.error('Get Scoring Rules Error:', error);
            throw error;
        }
    },

    createRule: async (data) => {
        try {
            const response = await API.post('/scoring', data);
            return response.data;
        } catch (error) {
            console.error('Create Scoring Rule Error:', error);
            throw error;
        }
    },

    updateRule: async (id, data) => {
        try {
            const response = await API.put(`/scoring/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Update Scoring Rule Error:', error);
            throw error;
        }
    },

    deleteRule: async (id) => {
        try {
            const response = await API.delete(`/scoring/${id}`);
            return response.data;
        } catch (error) {
            console.error('Delete Scoring Rule Error:', error);
            throw error;
        }
    },

    bulkUpdate: async (rules) => {
        try {
            const response = await API.put('/scoring/bulk', { rules });
            return response.data;
        } catch (error) {
            console.error('Bulk Update Scoring Rules Error:', error);
            throw error;
        }
    },
};

export default scoringApi;