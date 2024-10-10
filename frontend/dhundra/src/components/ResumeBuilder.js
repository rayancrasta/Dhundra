import React, { useEffect, useState } from 'react'
import axios from "axios";
import AuthNavbar from './AuthNavbar';
import UpdateDetailsForm from './UpdateDetailsForm';
import PersonalDetails from './PersonalDetails';
import ResumeUpload from './ResumeUpload';
import ResumePreview from './ResumePreview';
import SnackbarAlert from './SnackbarAlert';
import { Container, Grid } from "@mui/material";
import CoverLetter from './CoverLetter';
import { UploadFile } from '@mui/icons-material';
import UploadPDF from './UploadPDF';


const ResumeBuilder = () => {

    // State to manage
    const [resumeFile,setResumeFile] = useState(null);
    const [jobDescription,setJobDescription] = useState("");
    const [selectedModel,setSelectedModel] = useState("gpt-4o-mini");

    //Form to fill save the job resume
    const [companyName,setCompanyName] = useState("");
    const [jobUrl,setjobURl] = useState("");
    const [role,setRole] = useState("");

    //Loading animations
    const [isUpdated,setIsUpdated] = useState(false); //while openai call
    const [pdfLoading,setpdfLoading] = useState(false);  // while pdf generation
    const [isEditing,setIsEditing] = useState(false);
    const [loading,setLoading] = useState(false); // When resume is updating


    // Conditional states
    const [showForm,setShowForm] = useState(false); // after updated resume generated

    //Results
    const [updatedMarkdown,setUpdatedMarkdown] = useState("");
    const [pdfPath,setPdfPath] = useState(""); // pdf generated path

    const [pdfError, setpdfError] = useState(false);

    const [dropdownValue,setDropdownValue] = useState("");

    // Shortcut copy menu
    const [snackbarOpen,setSnackbarOpen] = useState(false);  // Copied message
    const [snackbarMessage,setSnackbarMessage] = useState("");
    const [personalDetails,setPersonalDetails] = useState({
        github: "",
        linkedin: "",
        website: "",
        medium: "",
    });
    const [personalDetaileError,setPersonalDetailsError] = useState("");
    // const navigate = useNavigate();

    useEffect(() => {
        const fetchPersonalDetails = async () => {
            try {
                const response = await axios.get("http://localhost:8000/user/personal-details",{ withCredentials: true });
                setPersonalDetails(response.data);
            } catch (err) {
                setPersonalDetailsError(err.response ? err.response.data.detail : 'Error fetching Shortcuts')
            }
        }
        fetchPersonalDetails();
    },[]); // run once

    //Upload part
    const handleResumeUpload = (e) => setResumeFile(e.target.files[0]);
    const [uploadError,setUploadError] = useState("");


    //Form change
    const handleJobDescriptionChange = (e) => {
        setJobDescription(e.target.value);
    }
    const handleCompanyNameChange = (e) => setCompanyName(e.target.value);
    const handleJobUrlChange = (e) => setjobURl(e.target.value);
    const handleRoleChange = (e) => setRole(e.target.value);

    //OpenAI call
    const handleUpdateResume = async () => {
        if (!resumeFile || !jobDescription) {
            alert("Please upload a resume and enter a job description");
            return;
        }

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
        if (error.response && error.response.data) {
            setUploadError(error.response.data.detail); // Set the upload error with detail from response
        } else {
            setUploadError("An unknown error occurred."); // Fallback error message
        }

    } finally {
        setLoading(false);
    }
    };

    //PDF generation part
    const [pdfGenerationMessage,setPdfGenerationMessage] = useState("");

    const handleGeneratePdf = async () => {
        setpdfLoading(true); // loading circle
        setPdfGenerationMessage(""); //Reset the message
        setpdfError(false);
        try {
            const response = await axios.post("http://localhost:8000/resume/generate-pdf",{
                markdown_content: updatedMarkdown,
                company_name: companyName,
                job_url: jobUrl,
                role: role,
                posting_type: dropdownValue,
                jobDescription: jobDescription
            },{ withCredentials: true });

            setPdfPath(response.data.pdf_name);
            setPdfGenerationMessage("PDF is ready to be downloaded");
        } catch (error) {
            setpdfError(true);
            if (error.response && error.response.detail) {
                setPdfGenerationMessage(error.response.detail);
            } else {
                setPdfGenerationMessage("Error Generating PDF"); // Fallback error message
            }
        } finally {
            setpdfLoading(false); // Stop loading for PDF generation
        }
    };

    // Download Resume button
    const handleDownloadResume = async () => {
        try {
            setpdfError(false);
            const response = await axios.get(`http://localhost:8000/resume/download-resume/${pdfPath}`,{withCredentials: true,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf"}));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download",`Resume.pdf`);

            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setpdfError(true)
            if (error.response && error.response.status === 404) {
                setPdfGenerationMessage("File not found");
            } else {
                setPdfGenerationMessage("Error downloading PDF"); // Fallback error message
            }
            // console.error("Error downloading PDF",error);
        }
    };

    // Personal details section
    const handlePersonalDetailChange = (e) => setPersonalDetails({...personalDetails, [e.target.name]: e.target.value});
    
    const handleSavePersonalDetails = async () => {
        try {
            await axios.post("http://localhost:8000/user/personal-details",personalDetails, {withCredentials: true});
            setIsEditing(false);
            // alert("Personal details updated succesfully");
        } catch (error) {
            console.error("Error updating personal details",error)
        }
    };

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
                        resumeFile={resumeFile}
                        onResumeUpload={handleResumeUpload}
                        jobDescription={jobDescription}
                        onJobDescriptionChange={handleJobDescriptionChange}
                        loading={loading}
                        isUpdated={isUpdated}
                        handleUpdateResume={handleUpdateResume}
                        uploadError={uploadError}
                        selectedModel={selectedModel}
                        setSelectedModel={setSelectedModel}
                    />

                    <UploadPDF 
                        aimodel={selectedModel}/>

                    <PersonalDetails
                        personalDetails={personalDetails}
                        onDetailChange={handlePersonalDetailChange}
                        onSave={handleSavePersonalDetails}
                        isEditing={isEditing}
                        onEdit={() => setIsEditing(!isEditing)}
                        copyToClipboard={copyToClipboard}
                        personalDetaileError={personalDetaileError}
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
                                companyName={companyName}
                                onCompanyNameChange={handleCompanyNameChange}
                                jobUrl={jobUrl}
                                onJobUrlChange={handleJobUrlChange}
                                role={role}
                                onRoleChange={handleRoleChange}
                                dropdownValue={dropdownValue}
                                onDropdownChange={(e) => setDropdownValue(e.target.value)}
                                onGeneratePdf={handleGeneratePdf}
                                pdfLoading={pdfLoading}
                                pdfGenerationMessage={pdfGenerationMessage}
                                onDownloadResume={handleDownloadResume}
                                pdfError={pdfError}
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
