import React from 'react';
import { TextField, Button, Paper, Select, MenuItem, Typography, Box, FormControl,InputLabel, CircularProgress } from "@mui/material";

const ResumeUpload = ({ resumeFile, onResumeUpload, jobDescription, onJobDescriptionChange, loading, isUpdated , handleUpdateResume, uploadError,selectedModel,setSelectedModel}) => {
    
    const handleModelSelect = (event) => {
        const model = event.target.value;
        setSelectedModel(model);
    };

    return (
    <Paper elevation={3} sx={{ padding: 3 }}>
        <Typography variant="h6">Resume Upload & Job Description</Typography>
        <input type="file" onChange={onResumeUpload} />

        <FormControl fullWidth sx={{ marginY: 2 }}>
            <InputLabel id="model-select-label">Model</InputLabel>
            <Select
                labelId="model-select-label"
                value={selectedModel}
                onChange={handleModelSelect}
                label="Model"  // This binds the label to the Select
            >
                <MenuItem value="gpt-4o-mini">gpt-4o-mini</MenuItem>
                <MenuItem value="gpt-4o">gpt-4o</MenuItem>
                <MenuItem value="gpt-4">gpt-4</MenuItem>
                <MenuItem value="gpt-3.5-turbo">gpt-3.5-turbo</MenuItem>
            </Select>
        </FormControl>

        <TextField
        fullWidth
        multiline
        rows={10}
        placeholder="Enter job description"
        value={jobDescription}
        onChange={onJobDescriptionChange}
        sx={{ marginY: 2 }}
        />
        <Button variant="contained" onClick={handleUpdateResume} sx={{ textTransform: 'none', borderRadius: '5px' }}>
        Update Resume
        </Button>
        {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <CircularProgress />
        </Box>
        )}

        {isUpdated && !loading && (
        <Box sx={{ marginTop: 2, width: '100%' }}>  {/* Wrap message in Box */}
            <Typography variant="body1" sx={{ color: 'green' }}>
                &#10003; Resume updated successfully
            </Typography>
        </Box>
        )}

        <Typography variant="p" sx={{ color: 'red', paddingTop: 2 }}>
            {uploadError}
        </Typography>
    </Paper>
  )
};

export default ResumeUpload;
