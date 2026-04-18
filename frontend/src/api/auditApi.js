import API, { handleError } from './axiosConfig';

const saveDraft = async (auditData) => {
  try {
    const res = await API.post('/audit/draft', auditData);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

const getDraft = async (leadId) => {
  try {
    const res = await API.get(`/audit/draft/${leadId}`);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

const submitAudit = async (auditData) => {
  try {
    const res = await API.post('/audit/submit', auditData);
    return res.data;
  } catch (err) {
    throw handleError(err);
  }
};

const auditApi = {
  saveDraft,
  getDraft,
  submitAudit,
};

export default auditApi;
