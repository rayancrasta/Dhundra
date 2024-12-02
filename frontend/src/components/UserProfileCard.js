// UserProfileCard.js
import React from 'react';
import { Card, CardContent, Grid, Typography, Button, CardActions } from '@mui/material';
import UserAvatar from './UserAvatar';
import UserDetail from './UserDetail';

const coverletter_defaultprompt = "You are a professional cover letter writer. Generate a cover letter based on the resume and job description. Keep it concise. Dont use any urls. Just give me the content from Dear XYZ to salutation.";
const resumegeneration_defaultprompt = "You are an expert resume writer. Update the following resume to better fit the given job description. Maintain the structure and content of the original resume as much as possible. Don't reduce the size of content much. Don't fake any experience or skills that the original resume doesn't have. If anything seems obvious, then only add it; don't add any new data that would make it look fake. As the resume is of a professional, change the title according to the job description. Match the title according to the experience of the proffesional in the resume. For example: Dont add senior title for a less experienced proffesional. Add soft skills based on the job description. Dont use a lot of buzz words. Making it ATS friendly according to the job description is our goal. Just give me resume content; don't add any info text from your side.It should look human written.";

const UserProfileCard = ({ user, isEditing, formData, handleChange, setIsEditing, handleSubmit, handleTokenCheck, tokenTestResult, isTokenValid }) => {

    return (
        <Card
            sx={{
                border: '1px solid',
                borderColor: 'lightgrey',
                borderRadius: 1,
            }}
        >
            <CardContent>
                <UserAvatar user={user} />
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
                    <UserDetail
                        label="OpenAI Token"
                        value={formData.openaitoken}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="openaitoken"
                        isToken
                    />
                    <UserDetail
                        label="Resume Generation Prompt"
                        value={formData.resumeprompt}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="resumeprompt"
                        defaultPrompt={resumegeneration_defaultprompt}
                    />
                    <UserDetail
                        label="Cover Letter Prompt"
                        value={formData.coverletterprompt}
                        isEditing={isEditing}
                        onChange={handleChange}
                        name="coverletterprompt"
                        defaultPrompt={coverletter_defaultprompt}
                    />
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

                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleTokenCheck}
                    disabled={!formData.openaitoken || isEditing}
                >
                    Test OpenAI Token
                </Button>

                {tokenTestResult && (
                    <Typography
                        variant="h6"
                        sx={{
                            color: isTokenValid ? 'green' : 'red',
                            mt: 2,
                        }}
                    >
                        {tokenTestResult}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default UserProfileCard;
