import { useLayoutEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const useAuth = () => {

    const[isAuthenticated,setIsAuthenticated] = useState(false);
    const [checkCompleted, setCheckCompleted] = useState(false);
    const navigate = useNavigate();

    useLayoutEffect(() => {
        const checkTokens = async () => {
            try {
                // Verify the token
                await axios.get('http://localhost:8000/user/verify',{
                    withCredentials: true,
                });
                // console.log("Access token verified true")
                setIsAuthenticated(true);
            } catch (error) { // Access token isnt valid
                    try {
                        await axios.post('http://localhost:8000/user/refresh',{},{
                            withCredentials: true,
                        })
                        // If the refresh token is valid,  we get new cookie set from the backend
                        setIsAuthenticated(true);
                    } catch (refreshError) {
                        setIsAuthenticated(false); // Refresh token failed
                        navigate('/login');
                    }
                } 
                setCheckCompleted(true)
        };

    checkTokens();
    },[navigate]);
    
    return checkCompleted ? isAuthenticated : null
}

export default useAuth
