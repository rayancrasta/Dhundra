import React, { useState } from "react";
import { TextField, Button, Paper, Select, MenuItem, Typography, Box, FormControl,InputLabel, CircularProgress } from "@mui/material";
import axios from 'axios';

const ResumeUpload = ({ jobDescription,setJobDescription,selectedModel,setSelectedModel,setShowForm,setUpdatedMarkdown,
    setRelevancyScore,setReasoning
}) => {
    
    const [resumeFile,setResumeFile] = useState(null);

    const [uploadError,setUploadError] = useState("");
    const [loading,setLoading] = useState(false); // When resume is updating
    const [isUpdated,setIsUpdated] = useState(false); //while openai call
    
    const onResumeUpload = (e) => setResumeFile(e.target.files[0]);

    const onJobDescriptionChange = (e) => {
        setJobDescription(e.target.value);
    }

    const handleModelSelect = (event) => {
        const model = event.target.value;
        setSelectedModel(model);
    };

    const handleUpdateResume = async () => {
        if (!resumeFile || !jobDescription) {
            alert("Please upload a resume and enter a job description");
            return;
        }
        setRelevancyScore('');
        setReasoning('');
        setUploadError("");
        setLoading(true); // opeai call made
        setIsUpdated(false); // Reset completion tickmark

        //Upload the resume
        const formData = new FormData();
        formData.append("file",resumeFile);
        formData.append("job_description",jobDescription);
        formData.append("model",selectedModel)
        try {
        
            const response = await axios.post(
                "http://localhost:8000/resume/update_resume",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    withCredentials: true,
                }
            );

            setUpdatedMarkdown(response.data.updated_markdown); //Set the updated markdown
            setIsUpdated(true); // show success tick mark
            setShowForm(true); // Display the job details save form
            // console.log("showForm:", showForm);

    } catch(error) {
        // console.error("Error updating Resume",error);
        if (error.response && error.response.data && error.response.data.detail) {
            setUploadError(error.response.data.detail); // Set the upload error with detail from response
        } else {
            setUploadError("An unknown error occurred."); // Fallback error message
        }

    } finally {
        setLoading(false);
    }
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
        Update Resume ✨
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
