import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginNav = () => {
    navigate('/login'); // Navigate to the About page
  };

  const handleSignupNav = () => {
    navigate('/signup'); // Navigate to the About page
  };


  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={handleLoginNav}>Login</button>
      <button onClick={handleSignupNav}>Sign Up</button>
    </div>
  );
};

export default HomePage;
