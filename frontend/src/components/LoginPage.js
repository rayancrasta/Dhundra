// LoginPage.js
import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Stack , Link} from '@mui/material';
import axios from 'axios';
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from './UserContext'; // Import the user context

const LoginPage = () => {
    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { setUserFullName } = useUserContext(); // Access the context
    const navigate = useNavigate();

    // Password visibility
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // Error and success message
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        setErrorMessage('');
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await axios.post('http://localhost:8000/user/login', {
                email: formData.email,
                password: formData.password
            }, { withCredentials: true });

            // Assuming the response contains the user's full name
            const fullname = response.data.fullname; // Adjust according to your API response
            setUserFullName(fullname); // Set the user's full name in context

            // console.log("Full name from login: ",fullname)
            // Navigate to the dashboard
            setSuccessMessage('Login successful');
            navigate('/dashboard');
        } catch (error) {
          console.log("Error logging in: ",error)
            if (error.response && error.response.status === 400) {
                setErrorMessage('Invalid email or password');
                setSuccessMessage('');
            } else {
                setErrorMessage('Error logging in');
                setSuccessMessage('');
            }
        }
    };

    return (
        <div>
            <Container maxWidth="sm">
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Typography component="h1" variant="h5" color="primary">
                        Login
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <Stack spacing={2}>
                            <TextField
                                name="email"
                                variant="outlined"
                                fullWidth
                                label="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'} // Toggle password visibility
                                value={formData.password}
                                onChange={handleChange}
                                required
                                InputProps={{
                                    endAdornment: (
                                        <Button onClick={togglePasswordVisibility}>
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Button>
                                    ),
                                }}
                            />
                            <Typography component="p" sx={{ fontSize: '0.8rem', color: 'red' }}>
                                {errorMessage}
                            </Typography>
                            <Typography component="p" sx={{ fontSize: '0.8rem', color: 'green' }}>
                                {successMessage}
                            </Typography>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                            >
                                Login
                            </Button>
                        </Stack>
                    </Box>
                    <Typography sx={{ mt: 2 }}>
                        Don't have an account?{' '}
                        <Link href="/signup" color="primary">
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </Container>
            <Footer />
        </div>
    );
};

export default LoginPage;
