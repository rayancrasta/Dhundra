// UserDetail.js
import React from 'react';
import { Grid, TextField, Typography, Button } from '@mui/material';

const UserDetail = ({ label, value, isEditing, onChange, name, defaultPrompt, isToken }) => {
    const handleResetPrompt = () => {
        if (defaultPrompt) {
            onChange({ target: { name, value: defaultPrompt } });
        }
    };

    const renderOpenAIToken = () => {
        if (isEditing) {
            return (
                <TextField
                    fullWidth
                    variant="outlined"
                    value={value}
                    onChange={onChange}
                    name={name}
                />
            );
        } else {
            const maskedToken = value.length > 20 
                ? `${value.slice(0, 10)}...${value.slice(-10)}` 
                : value;
            return (
                <Typography variant="body1">
                    {maskedToken}
                </Typography>
            );
        }
    };

    return (
        <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: 'primary' }}>
                {label}
            </Typography>
            {isToken ? (
                renderOpenAIToken()
            ) : isEditing ? (
                <TextField
                    name={name}
                    value={value}
                    onChange={onChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                    multiline={!!defaultPrompt} // js trick to get True value
                    rows={defaultPrompt ? 4 : 1}
                />
            ) : (
                <Typography variant="body1" sx={{ color: '#333' }}>
                    {value}
                </Typography>
            )}
            {isEditing && defaultPrompt && (
                <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    onClick={handleResetPrompt}
                    sx={{ mt: 1 }}
                >
                    Reset to Default
                </Button>
            )}
        </Grid>
    );
};

export default UserDetail;
