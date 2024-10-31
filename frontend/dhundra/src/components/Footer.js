import React from 'react';
import { Typography } from '@mui/material'; // Import Typography from Material-UI

function Footer() {
  return (
    <footer style={footerStyle}>
      <Typography variant="body2" component="span">
        Built by{' '}
        <a 
          href="https://rayancrasta.com" 
          style={linkStyle} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Typography variant="body2" color="primary" component="span">
            Rayan Crasta
          </Typography>
        </a>
      </Typography>
    </footer>
  );
}

const footerStyle = {
  position: 'fixed',
  bottom: 0,
  width: '100%',
  textAlign: 'center',
  padding: '10px',
};

const linkStyle = {
  textDecoration: 'none',
};

export default Footer;
