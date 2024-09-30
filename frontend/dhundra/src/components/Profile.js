// Profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import AuthNavbar from './AuthNavbar';
import UserProfileCard from './UserProfileCard';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        openApiToken: '',
    });
    const [tokenTestResult, setTokenTestResult] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:8000/user/profile', { withCredentials: true });
                setUser(response.data);
                setFormData({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    openApiToken: response.data.openApiToken || 'Token not set',
                });
                setLoading(false);
            } catch (err) {
                setError(err.response ? err.response.data.detail : 'Error fetching profile');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:8000/user/profile', formData, { withCredentials: true });
            setUser(formData);
            setIsEditing(false);
        } catch (err) {
            setError(err.response ? err.response.data.detail : 'Error updating profile');
        }
    };

    const handleTokenCheck = async () => {
        try {
            const response = await axios.get('http://localhost:8000/user/openai-token-check', { withCredentials: true });
            setTokenTestResult('OpenAI token is valid!');
            setIsTokenValid(true);
        } catch (err) {
            setTokenTestResult(err.response ? err.response.data.detail : 'Error checking token');
            setIsTokenValid(false);
        }
    };


    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <AuthNavbar />
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center', // Center horizontally
                    // alignItems: 'center', // Center vertically
                    height: '100vh', // Full viewport height
                    padding: 2,
                }}
            >
                <UserProfileCard
                    user={user}
                    isEditing={isEditing}
                    formData={formData}
                    handleChange={handleChange}
                    setIsEditing={setIsEditing} 
                    handleSubmit={handleSubmit}
                    handleTokenCheck={handleTokenCheck}
                    tokenTestResult={tokenTestResult}
                    isTokenValid={isTokenValid}
                />
            </Box>
        </div>
    );
};

export default Profile;
