import React, { useEffect, useState } from 'react'
import axios from "axios";
import AuthNavbar from './AuthNavbar';
import UpdateDetailsForm from './UpdateDetailsForm';
import PersonalDetailsComp from './PersonalDetails';
import ResumeUpload from './ResumeUpload';
import ResumePreview from './ResumePreview';
import SnackbarAlert from './SnackbarAlert';
import { Container, Grid } from "@mui/material";
import CoverLetter from './CoverLetter';
import { UploadFile } from '@mui/icons-material';
import UploadPDF from './UploadPDF';


const ResumeBuilder = () => {

    // State to manage via multiple components
    const [jobDescription,setJobDescription] = useState("");
    const [selectedModel,setSelectedModel] = useState("gpt-4o-mini");

    // Company Details form
    const [showForm,setShowForm] = useState(false);

    //Results
    const [updatedMarkdown,setUpdatedMarkdown] = useState("");
    
    // Shortcut copy menu
    const [snackbarOpen,setSnackbarOpen] = useState(false);  // Copied message
    const [snackbarMessage,setSnackbarMessage] = useState("");
    
    const handleCopyToClipboard = (text) => {  //Clipboard
        navigator.clipboard.writeText(text);
        setSnackbarMessage("Copied to clipboard!");
        setSnackbarOpen(true);
    }

    const copyToClipboard = (text) => {
        handleCopyToClipboard(text);
    }

    return (
        <div>
            <AuthNavbar/>
            <Container maxWidth="lg">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                    <ResumeUpload
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                        setShowForm={setShowForm}
                        setUpdatedMarkdown={setUpdatedMarkdown}
                    />

                    <UploadPDF 
                        aimodel={selectedModel}/>

                    <PersonalDetailsComp    
                        copyToClipboard={copyToClipboard}
                    />

                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ResumePreview updatedMarkdown={updatedMarkdown} 
                        onUpdatedMarkdownChange={setUpdatedMarkdown} 
                        jobDescription={jobDescription} showForm={showForm} 
                        aimodel={selectedModel}/>

                        {showForm && (
                            <div>
                            <UpdateDetailsForm
                                updatedMarkdown={updatedMarkdown}
                                jobDescription={jobDescription}
                                />
                            
                            <CoverLetter
                                jobDescription={jobDescription}
                                updatedMarkdown={updatedMarkdown}
                                aimodel={selectedModel}
                                copyToClipboard={copyToClipboard}
                            />
                                </div>
                                )}
                    </Grid>
                </Grid>
            </Container>

            <SnackbarAlert
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />

        </div>
    );
};

export default ResumeBuilder
