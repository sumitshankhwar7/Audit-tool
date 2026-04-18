import API from './axiosConfig';

const reportApi = {
    getReports: async () => {
        try {
            const response = await API.get('/reports');
            return response.data;
        } catch (error) {
            console.error('Get Reports Error:', error);
            throw error;
        }
    },

    getAllReports: async () => {
        try {
            const response = await API.get('/reports/all');
            return response.data;
        } catch (error) {
            console.error('Get All Reports Error:', error);
            throw error;
        }
    },

    getReportStatus: async (requestId) => {
        try {
            const response = await API.get(`/reports/status/${requestId}`);
            return response.data;
        } catch (error) {
            console.error('Get Report Status Error:', error);
            throw error;
        }
    },

    downloadReport: async (requestId) => {
        try {
            const response = await API.get(`/reports/download/${requestId}`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Download Report Error:', error);
            throw error;
        }
    },
};

export default reportApi;