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
import QnA from './QnA';
import Footer from './Footer';


const ResumeBuilder = () => {

    // State to manage via multiple components
    const [jobDescription,setJobDescription] = useState("");
    const [selectedModel,setSelectedModel] = useState("gpt-4o-mini");

    // Company Details form
    const [showForm,setShowForm] = useState(false);

    //Results
    const [updatedMarkdown,setUpdatedMarkdown] = useState("");
    const [relevancyScore, setRelevancyScore] = useState('');
    const [reasoning, setReasoning] = useState('');
    
    // Shortcut copy menu
    const [snackbarOpen,setSnackbarOpen] = useState(false);  // Copied message
    const [snackbarMessage,setSnackbarMessage] = useState("");

    // Company name
    const [company_name_g,setCompanyNameG] = useState('');

    
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
                        setRelevancyScore={setRelevancyScore}
                        setReasoning={setReasoning}
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
                        aimodel={selectedModel}
                        relevancyScore={relevancyScore} setRelevancyScore={setRelevancyScore}
                        reasoning={reasoning} setReasoning={setReasoning}
                        />

                        {showForm && (
                            <div>
                            <UpdateDetailsForm
                                updatedMarkdown={updatedMarkdown}
                                jobDescription={jobDescription}
                                setCompanyNameG={setCompanyNameG}
                                />
                            
                            <CoverLetter
                                jobDescription={jobDescription}
                                updatedMarkdown={updatedMarkdown}
                                aimodel={selectedModel}
                                copyToClipboard={copyToClipboard}
                                company_name_g={company_name_g}
                            />

                            <QnA 
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
            <Footer />
        </div>
    );
};

export default ResumeBuilder
