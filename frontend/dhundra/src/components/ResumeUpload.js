import React from 'react';
import { TextField, Button, Paper, Typography, Box, CircularProgress } from "@mui/material";

const ResumeUpload = ({ resumeFile, onResumeUpload, jobDescription, onJobDescriptionChange, loading, isUpdated , handleUpdateResume, uploadError}) => {
    

    return (
    <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h6">Resume Upload & Job Description</Typography>
        <input type="file" onChange={onResumeUpload} />
        <TextField
        fullWidth
        multiline
        rows={10}
        placeholder="Enter job description"
        value={jobDescription}
        onChange={onJobDescriptionChange}
        sx={{ marginY: 2 }}
        />
        <Button variant="contained" onClick={handleUpdateResume} fullWidth>
        Update Resume
        </Button>
        {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <CircularProgress />
        </Box>
        )}
        {isUpdated && !loading && (
        <Typography variant="h6" sx={{ color: 'green', marginTop: 2 }}>
            &#10003; Resume updated successfully
        </Typography>
        )}
        <Typography variant="p" sx={{ color: 'red', paddingTop: 2 }}>
            {uploadError}
        </Typography>
    </Paper>
  )
};

export default ResumeUpload;
