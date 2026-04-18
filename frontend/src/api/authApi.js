import API from './axiosConfig';

const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

// Login user
const login = async (userData) => {
  const response = await API.post('/auth/login', userData);

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }

  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Get all users (admin)
const getAllUsers = async () => {
  const response = await API.get('/auth/users');
  return response.data;
};

// Update user (admin)
const updateUser = async (id, userData) => {
  const response = await API.put(`/auth/users/${id}`, userData);
  return response.data;
};

// Delete user (admin)
const deleteUser = async (id) => {
  const response = await API.delete(`/auth/users/${id}`);
  return response.data;
};

const authApi = {
  register,
  login,
  logout,
  getAllUsers,
  updateUser,
  deleteUser,
};

export default authApi;
