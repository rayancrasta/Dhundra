import React from 'react'

function Footer() {
  return (
   <footer style={footerStyle} >
    Built by <a href="https://rayancrasta.com" style={linkStyle} target="_blank" rel="noopener noreferrer">Rayan Crasta</a>
   </footer>
  )
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
    color: 'primary',
  };

export default Footer
