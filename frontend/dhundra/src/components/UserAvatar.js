// UserAvatar.js
import React from 'react';
import { Avatar, Typography, Box } from '@mui/material';

const UserAvatar = ({ user }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar
            sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 40 }}
            alt={`${user.firstName} ${user.lastName}`}
        >
            {`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`}
        </Avatar>
        <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold', color: '#333', mt: 2 }}>
            {`${user.firstName} ${user.lastName}`}
        </Typography>
        <Typography variant="body1" sx={{ color: '#666' }}>
            {user.email}
        </Typography>
    </Box>
);

export default UserAvatar;
