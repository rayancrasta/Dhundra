import React from 'react'
import { Card, CardContent } from '@mui/material';
import UserAvatar from './UserAvatar';
import UserDetail from './UserDetail';
import { Grid, TextField, Typography } from '@mui/material';
import { Button, CardActions } from '@mui/material';
const UserProfileCard = ({user,isEditing,formData,handleChange,setIsEditing,handleSubmit,handleTokenCheck,tokenTestResult,isTokenValid}) => {
    const renderOpenAIToken = (token) => {
        if (isEditing) {
            return (
                <TextField
                    fullWidth
                    variant="outlined"
                    value={token}
                    onChange={handleChange}
                    name="openApiToken"
                />
            );
        } else {
            // Display first 10 and last 10 characters with ellipses in the middle
            const maskedToken = token.length > 20 
                ? `${token.slice(0, 10)}...${token.slice(-10)}` 
                : token; // Fallback for shorter tokens
            return (
                <Typography variant="body1">
                    {maskedToken}
                </Typography>
            );
        }
    };
    
    return (
        <Card
            sx={{
                border: 'none', // Remove any outline
                boxShadow: 'none', // Remove the default box shadow    
            }}
        >
            <CardContent>
                <UserAvatar user={user}/>   
                <Grid container spacing={2}>
                    <UserDetail
                        label="First Name"
                        value={formData.firstName}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="firstName"
                    />

                    <UserDetail
                    label="Last Name"
                    value={formData.lastName}
                    isEditing={isEditing}
                    onChange={handleChange}
                    name="lastName"
                    />
                    
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: 'primary' }}>OpenAI Token:</Typography>
                        {renderOpenAIToken(formData.openApiToken)}
                    </Grid>
                </Grid>
                
                <CardActions sx={{ justifyContent: 'center', px: 3, pb: 2 }}>
                    <Button size="small" variant="outlined" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancel' : 'Edit'}
                    </Button>
                    {isEditing && (
                        <Button size="small" variant="contained" color="primary" onClick={handleSubmit}>
                            Save
                        </Button>
                    )}
                </CardActions>

                {/* Test button for OpenAI Token */}
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleTokenCheck}
                    disabled={!formData.openApiToken || isEditing}
                >
                    Test OpenAI Token
                </Button>

                {/* Display token test result */}
                {tokenTestResult && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: isTokenValid ? 'green' : 'red',  // Green for valid, red for invalid
                            mt: 2,  //  margin-top for spacing
                        }}
                    >
                        {tokenTestResult}
                    </Typography>
                )}

                

            </CardContent>
        </Card>
    )
}

export default UserProfileCard
