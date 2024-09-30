import React from 'react'
import { Navigate } from 'react-router-dom';
import useAuth from './useAuth';
const ProtectedRoute = ({ element : Component }) => { // we pass the element as a prop 
    const isAuthenticated = useAuth(); // we do token check here
    // console.log("Authenticated status ", isAuthenticated)

    if (isAuthenticated === null) {
        return <div>Loading...</div>; // Show loading state while the check is in progress
    }

    return isAuthenticated ? <Component /> : <Navigate to="/login" />;
};

export default ProtectedRoute
