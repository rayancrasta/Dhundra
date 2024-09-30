import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Stack } from '@mui/material';
import axios from 'axios';
import Footer from './Footer';

const SignupPage = () => {
  // form Data
  const [formData,setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  //Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  //Error and Sucess
  const [errorMessage,setErrorMessage] = useState('');
  const [successMessage,setsuccessMessage] = useState('');

  // 
  const handleChange = (e) => {
    const { name,value } = e.target;
    setFormData({
      ...formData, //prev value
      [name]:value,
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setsuccessMessage('');
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords Dont Match");
      return;
    }

    //Call the api
    try {
      const response = await axios.post('http://localhost:8000/user/signup',formData);
      if (response.status === 200){
        setsuccessMessage('User Registered Successfully')
        setErrorMessage(''); //deliberate
      } 
    } catch(error) {
      if (error.response && error.response.status === 400) {
        setErrorMessage('User already registered'); 
        setsuccessMessage(''); // deliberate
      } else {
        setErrorMessage('Error Registering User'); // General error for other status codes
        setsuccessMessage(''); // deliberate
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
          Signup
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}> 
              {/* same row */}
              <TextField name="firstName"
                variant="outlined"
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
              <TextField
                name="lastName"
                variant="outlined"
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </Stack>
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
            <TextField
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'} // Toggle confirm password visibility
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <Button onClick={toggleConfirmPasswordVisibility}>
                      {showConfirmPassword ? 'Hide' : 'Show'}
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
              Sign Up
            </Button>
          </Stack>
        </Box>

    </Box>
  </Container>
  <Footer/>
  </div>


  );
};

export default SignupPage;
