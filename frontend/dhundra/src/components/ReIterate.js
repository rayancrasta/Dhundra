import React, { useState } from 'react'
import axios from "axios";
import { TextField, Button, Typography, Box, CircularProgress } from "@mui/material";

const ReIterate = ({jobDescription,updatedMarkdown,setUpdatedMarkdown,aimodel}) => {
    const [userPrompt,setUserPrompt] = useState('');
    const oneUserPromptChange = (e) => setUserPrompt(e.target.value);
    const [loading,setLoading] = useState(false);
    const [regenError,setregenError] = useState(false);
    const [regenMessage,setregenMessage] = useState("");
    const [showPrompt,setShowPrompt]= useState(false);


    const onGenerateNewResume = async () => {
        if (!userPrompt || !jobDescription || !updatedMarkdown) {
            alert("Please write a prompt and enter a job description");
            return;
        }
        setregenError(false);
        setLoading(true); // opeai call made
        setregenMessage("");

        try {
            const response = await axios.post("http://localhost:8000/resume/regen-resume",{
                user_prompt: userPrompt,
                jobDescription: jobDescription,
                updated_markdown:  updatedMarkdown,
                aimodel: aimodel,
            },{ withCredentials: true });

            setUpdatedMarkdown(response.data.updated_markdown);
            setregenMessage("Resume is updated");
        } catch (error) {
            setregenError(true);
            if (error.response && error.response.data && error.response.data.detail) {
                setregenMessage(error.response.data.detail);
            } else {
                setregenMessage("Error generating cover letter"); 
            }
        } finally {
            setLoading(false); // Stop loading for PDF generation
        }
    }

    const onShowPrompt = () => setShowPrompt(!showPrompt);

    return (
        <div style={{ marginTop: '2px' }}>
            <Button variant="contained" onClick={onShowPrompt} sx={{ textTransform: 'none', borderRadius: '5px' ,
                backgroundColor: 'transparent',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',  // Optional: Add a slight hover effect
                },
                color: 'black'
                
             }}>
            🖊 Suggest Changes
            </Button>

            {showPrompt && (
                <div>
            <TextField
            fullWidth
            label="Prompt"
            value={userPrompt}
            onChange={oneUserPromptChange}
            sx={{ marginY: 1 }}
            />

            <Button variant="contained" onClick={onGenerateNewResume} sx={{ textTransform: 'none', borderRadius: '5px' }}>
            Generate
            </Button>

            {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                <CircularProgress />
            </Box>
            )}

            {regenMessage && (
            <Box sx={{ marginTop: 3 }}> {/* Adds space between sections */}
            <Typography variant="body1" sx={{ color: regenError ? 'red' : 'green', marginBottom: 2 }}>
                {regenMessage}
            </Typography>
            </Box>
            )}

            </div>
        )}
        </div>
    )
}

export default ReIterate
