import React, { useState } from 'react'
import { AppBar, Toolbar, Typography, IconButton ,  Drawer, List, ListItem, ListItemText  } from "@mui/material"
import { Link } from "react-router-dom";
import { Menu as MenuIcon } from '@mui/icons-material';
import NavButton from './NavButton';

const AuthNavbar = () => {
    const [drawerOpen,setDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen)
    }
    
    //Button mapping
    const buttons = [
        { text: 'Dashboard', link: '/dashboard' },
        { text: 'Resume', link : '/resume-builder'}, 
        { text: 'Tracker', link : '/tracker'},
        { text: 'People', link : '/people'},  
        { text: 'Profile', link : '/profile'},
        { text: 'Logout', link: '/logout' , sxProps: { '&:hover': { backgroundColor: '#311B92' }}}
    ];

    return (
        <>
        <AppBar position="static" sx={{ backgroundColor: 'primary', marginBottom: 3 }}>
            <Toolbar >
                <Typography variant="h6" sx={{ flexGrow: 1, color: 'white' }}>
                    Dhundra
                </Typography>
                
                {/* For responsive app */}
                <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleDrawerToggle} sx={{ display: { xs: 'block', sm: 'none' } }}>
                    <MenuIcon />
                </IconButton>

                {buttons.map((button,index) => (
                    <NavButton
                        key={index}
                        text={button.text}
                        link={button.link}
                        sxProps={{ display: { xs: 'none', sm: 'inline' }, ...button.sxProps }} 
                        />
                    ))}
            </Toolbar>
        </AppBar>    

        <Drawer 
    anchor='right' 
    open={drawerOpen} 
    onClose={handleDrawerToggle}
    sx={{ 
        '& .MuiDrawer-paper': {
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Light translucent background
            color: 'primary', // Darker text color for contrast
            borderRadius: '10px', // Rounded corners
            boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.3)', // Subtle shadow
        }
    }}
>

            <List>
                {buttons.map((button,index) => (
                    <ListItem button component={Link} to={button.link} key={index} onClick={handleDrawerToggle} sx={button.sxProps}>
                        <ListItemText primary={button.text} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
        </>

    )
}

export default AuthNavbar
