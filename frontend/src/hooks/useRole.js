import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook to check user role and permissions
 * Usage:
 * - useRole() - returns current user role
 * - useRole('admin') - returns boolean if user is admin
 * - useRole(['admin', 'telecaller']) - returns boolean if user is admin OR telecaller
 */
const useRole = (role) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return role ? false : null;
    }

    // If no specific role is passed, return the user's role
    if (!role) {
        return user.role;
    }

    // If role is an array, check if user has any of the specified roles
    if (Array.isArray(role)) {
        return role.includes(user.role);
    }

    // If role is a string, check if user has that specific role
    return user.role === role;
};

export default useRole;