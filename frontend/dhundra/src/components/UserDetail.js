import React from 'react'
import { Grid, TextField, Typography} from '@mui/material';

const UserDetail = ({ label,value,isEditing,onChange,name}) => {
    return (
        <Grid item xs={12}>
        <Typography variant="h6" sx={{ color: 'primary' }}>
            {label}
        </Typography>
        {isEditing ? (
            <TextField
                name={name}
                value={value}
                onChange={onChange}
                fullWidth
                variant="outlined"
                size="small"
            />
        ) : (
            <Typography variant="body1" sx={{ color: '#333' }}>
                {value}
            </Typography>
        )}
    </Grid>
    )
}

export default UserDetail
