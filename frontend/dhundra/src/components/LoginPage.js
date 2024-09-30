import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Stack } from '@mui/material';
import axios from 'axios';
import Footer from './Footer';
import { useNavigate  } from 'react-router-dom';
const LoginPage = () => {

  // Form data
  const [formData,setFormData] = useState({
    email: '',
    password: '',
  })

  const navigate = useNavigate();

  // Password visibility
  const [showPassword,setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  }

  // Error and sucess message
  const [errorMessage,setErrorMessage] = useState('');
  const [successMessage,setsuccessMessage] = useState('');

  //Handle input change
  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({
      ...formData,
      [name]:value,
    });
    setErrorMessage('');
  }

  // Handle form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setsuccessMessage('');
    try {
      await axios.post('http://localhost:8000/user/login', {
        email: formData.email,
        password: formData.password
      }, { withCredentials: true });

      // Navigate to the dashboard
      setsuccessMessage('Login succesful');
      navigate('/dashboard');

      } catch (error) {
        if (error.response && error.response.status === 400) {
          setErrorMessage('Invalid email or password');
          setsuccessMessage('');
        } else {
          setErrorMessage('Error logging in');
          setsuccessMessage('');
        }
      }
    }

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
              slotProps={{
                input: {
                  endAdornment: (
                    <Button onClick={togglePasswordVisibility}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Button>
                  ),
                },
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
    </Box>
  </Container>
  <Footer/>
  </div>

  );
};

export default LoginPage;
