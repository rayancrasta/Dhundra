import React from 'react'
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from '@mui/material/styles';

const NavButton = ({text,link,sxProps,onClick }) => {
    const theme = useTheme();

  return (
    <Button 
        component={Link}
        to={link}
        onClick={onClick}
        sx={{
            marginRight: 2,
            fontSize: '15px',
            color: 'white',
            textTransform: 'none',
            ...sxProps, // to add additional styles for Logout
            '&:hover': { backgroundColor : theme.palette.custom.buttonhover }
        }}
        >
            {text}
    </Button>
  )
}

export default NavButton
