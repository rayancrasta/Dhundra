import React, { useState } from 'react'
import axios from "axios";
import { ContentCopy } from "@mui/icons-material";
import { TextField, Button, Paper, Typography, Box, CircularProgress, Tooltip, IconButton } from "@mui/material";

const CoverLetter = ({jobDescription,updatedMarkdown,aimodel,copyToClipboard}) => {

    const [coverLetter,setCoverLetter] = useState("");
    const [isLoading,setisLoading] = useState(false);
    const [coverLetterMessage,setCoverLetterMessage] = useState("");
    const [coverLetterError,setCoverLetterError] = useState(false);
    
    
    const handleGenerateCoverLetter = async () => {
        if (!updatedMarkdown || !jobDescription ) {
            alert("Please provide an updated resume and job description");
            return;
        }

        setCoverLetter("");
        setCoverLetterError(false);
        setisLoading(true);
        setCoverLetterMessage("");

        try {
            const response = await axios.post("http://localhost:8000/resume/generate_cover_letter", {
              resume_markdown: updatedMarkdown,
              job_description: jobDescription,
              aimodel: aimodel
            },{ withCredentials: true });
            setCoverLetter(response.data.cover_letter);  
            setCoverLetterMessage("Cover Letter generated")
        } catch (error) {
            setCoverLetterError(true);
            if (error.response && error.response.data && error.response.data.detail) {
                setCoverLetterMessage(error.response.data.detail);
            } else {
                setCoverLetterMessage("Error generating cover letter"); 
            }
        } finally {
            setisLoading(false);  
        }
    }

    const onCoverLetterChange = (e) => setCoverLetter(e.target.value);

    return (
        <div>
            <Paper elevation={3} sx={{ padding: 3 }}>
            <Typography variant="h6">Cover Letter</Typography>

            <Button variant="contained" onClick={handleGenerateCoverLetter} sx={{ textTransform: 'none', borderRadius: '5px' }}>
            Generate
            </Button>
            {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <CircularProgress />
            </Box>
            )}

            <TextField
            fullWidth
            multiline
            rows={5}
            placeholder="Enter job description"
            value={coverLetter}
            onChange={onCoverLetterChange}
            sx={{ marginY: 2 }}
            />

            <Tooltip title="Copy">
                <IconButton onClick={() => copyToClipboard(coverLetter)}>
                    <ContentCopy />  
                </IconButton>
            </Tooltip>


            {coverLetterMessage && (
                <Box sx={{ marginTop: 3 }}> {/* Adds space between sections */}
                <Typography variant="body1" sx={{ color: coverLetterError ? 'red' : 'green', marginBottom: 2 }}>
                    {coverLetterMessage}
                </Typography>
                </Box>
            )}

        </Paper>
        </div>
    )
    }

export default CoverLetter
