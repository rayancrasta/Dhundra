import React, { useState } from 'react';
import axios from "axios";
import { ContentCopy, ExpandMore } from "@mui/icons-material";
import { TextField, Button, Paper, Typography, Box, CircularProgress, Tooltip, IconButton } from "@mui/material";

const CoverLetter = ({ jobDescription, updatedMarkdown, aimodel, copyToClipboard }) => {
    const [coverLetter, setCoverLetter] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [coverLetterMessage, setCoverLetterMessage] = useState("");
    const [coverLetterError, setCoverLetterError] = useState(false);
    const [isVisible, setIsVisible] = useState(false); 

    const handleGenerateCoverLetter = async () => {
        if (!updatedMarkdown || !jobDescription) {
            alert("Please provide an updated resume and job description");
            return;
        }

        setCoverLetter("");
        setCoverLetterError(false);
        setIsLoading(true);
        setCoverLetterMessage("");

        try {
            const response = await axios.post("http://localhost:8000/resume/generate_cover_letter", {
                resume_markdown: updatedMarkdown,
                job_description: jobDescription,
                aimodel: aimodel
            }, { withCredentials: true });
            setCoverLetter(response.data.cover_letter);
            setCoverLetterMessage("Cover Letter generated");
        } catch (error) {
            setCoverLetterError(true);
            if (error.response && error.response.data && error.response.data.detail) {
                setCoverLetterMessage(error.response.data.detail);
            } else {
                setCoverLetterMessage("Error generating cover letter");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const response = await axios.post("http://localhost:8000/resume/download_cover_letter_pdf", 
                { cover_letter: coverLetter }, 
                { responseType: 'blob' } // Important for handling binary data
            );
            // Create a URL and link to trigger the download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'cover_letter.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading PDF:", error);
        }
    };

    const onCoverLetterChange = (e) => setCoverLetter(e.target.value);

    return (
        <div>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Cover Letter</Typography>
                    <IconButton onClick={() => setIsVisible(!isVisible)}>
                        <ExpandMore />
                    </IconButton>
                </Box>

                {isVisible && (
                    <>
                        <Button variant="contained" onClick={handleGenerateCoverLetter} sx={{ textTransform: 'none', borderRadius: '5px', marginY: 2 }}>
                            Generate ✨
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

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Tooltip title="Copy">
                                <IconButton onClick={() => copyToClipboard(coverLetter)}>
                                    <ContentCopy />
                                </IconButton>
                            </Tooltip>

                            <Button
                                variant="outlined"
                                onClick={handleDownloadPDF}
                                sx={{ textTransform: 'none', marginLeft: 2 }}
                                disabled={!coverLetter}
                            >
                                Download as PDF
                            </Button>
                        </Box>

                        {coverLetterMessage && (
                            <Box sx={{ marginTop: 3 }}>
                                <Typography variant="body1" sx={{ color: coverLetterError ? 'red' : 'green', marginBottom: 2 }}>
                                    {coverLetterMessage}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}
            </Paper>
        </div>
    );
};

export default CoverLetter;
