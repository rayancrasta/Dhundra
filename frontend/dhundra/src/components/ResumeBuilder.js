import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import AuthNavbar from './AuthNavbar';
import UpdateDetailsForm from './UpdateDetailsForm';
import PersonalDetails from './PersonalDetails';
import ResumeUpload from './ResumeUpload';
import ResumePreview from './ResumePreview';
import SnackbarAlert from './SnackbarAlert';
import { Container, Grid } from "@mui/material";


const ResumeBuilder = () => {

    // State to manage
    const [resumeFile,setResumeFile] = useState(null);
    const [jobDescription,setJobDescription] = useState("");
    
    //Form to fill save the job resume
    const [companyName,setCompanyName] = useState("");
    const [jobUrl,setjobURl] = useState("");
    const [role,setRole] = useState("");

    //Loading animations
    const [isUpdated,setIsUpdated] = useState(false); //while openai call
    const [pdfLoading,setpdfLoading] = useState(false);  // while pdf generation
    const [isGeneratingCoverLetter,setIsGeneratingCoverLetter] = useState(false);
    const [isEditing,setIsEditing] = useState(false);
    const [loading,setLoading] = useState(false); // When resume is updating


    // Conditional states
    const [showForm,setShowForm] = useState(false); // after updated resume generated

    //Results
    const [updatedMarkdown,setUpdatedMarkdown] = useState("");
    const [pdfPath,setPdfPath] = useState(""); // pdf generated path
    const [timestamp,setTimestamp] = useState(""); //timestamp for the pdf
    const [coverLetter,setCoverLetter] = useState(""); //generated cover letter
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

    // const navigate = useNavigate();

    useEffect(() => {
        const fetchPersonalDetails = async () => {
            try {
                const response = await axios.get("http://localhost:8000/personal_details");
                setPersonalDetails(response.data);
            } catch (error) {
                console.error("Error fetching personal details",error);
            }
        }
        fetchPersonalDetails();
    },[]); // run once

    //Upload part
    const handleResumeUpload = (e) => setResumeFile(e.target.files[0]);
    const [uploadError,setUploadError] = useState("");


    //Form change
    const handleJobDescriptionChange = (e) => setJobDescription(e.target.value);
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
        
        try {
            const response = await axios.post("http://localhost:8000/resume/update_resume", formData, {withCredentials: true},
                { headers: { "Content-Type": "multipart/form-data"},
        });

        setUpdatedMarkdown(response.data.updated_markdown); //Set the updated markdown
        setIsUpdated(true); // show success tick mark
        setShowForm(true); // Display the job details save form
        

    } catch(error) {
        console.error("Error updating Resume",error);
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

        try {
            const response = await axios.post("http://localhost:8000/generate_pdf",{
                markdown_content: updatedMarkdown,
                company_name: companyName,
                job_url: jobUrl,
                role: role,
                type: dropdownValue,
                jobDescription: jobDescription
            });

            setPdfPath(response.data.pdf_path);
            setTimestamp(response.data.pdf_path.split("/").pop().replace("resume_","").split(".")[0]);
            setPdfGenerationMessage("PDF is ready to be downloaded");
        } catch (error) {
            console.error("Error generating PDF",error);
        } finally {
            setpdfLoading(false); // Stop loading for PDF generation
        }
    };

    // Download Resume button
    const handleDownloadResume = async () => {
        try {
            const response = await axios.post(`http://localhost:8000/download_resume/${timestamp}`,{
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf"}));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download",`Rayan Crasta resume ${timestamp}.pdf`);

            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading PDF",error);
        }
    };

    // Personal details section
    const handlePersonalDetailChange = (e) => setPersonalDetails({...personalDetails, [e.target.name]: e.target.value});
    
    const handleSavePersonalDetails = async () => {
        try {
            await axios.post("http://localhost:8000/update_personal_details",personalDetails);
            setIsEditing(false);
            alert("Personal details updated succesfully");
        } catch (error) {
            console.error("Error updating personal details",error)
        }
    };

    const handleCopyToClipboard = (text) => {  //Clipboard
        navigator.clipboard.writeText(text);
        setSnackbarMessage("Copied to clipboard!");
        setSnackbarOpen(true);
    }

    const handleSnackbarClose = () => {
        setSnackbarMessage(false);
    }

    const copyToClipboard = (text) => {
        handleCopyToClipboard(text);
    }

    // Generate cover letter
    const handleGenerateCoverLetter = async () => {
        if(!updatedMarkdown || !jobDescription) {
            alert("Please provide an updated resume and job description");
            return;
        }

        setCoverLetter("");
        setIsGeneratingCoverLetter(true);  // Loading animation

        try {
            const response = await axios.post("http://localhost:8000/generate_cover_letter",{
                resume_markdown: updatedMarkdown,
                job_description: jobDescription,
            });
            setCoverLetter(response.data.cover_letter); // Set the generated cover letter
        } catch (error) {
            console.error("Error generating cover letter: ",error);
        } finally {
            setIsGeneratingCoverLetter(false); // loading animation ends
        }
    };

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
                    />

                    <PersonalDetails
                        personalDetails={personalDetails}
                        onDetailChange={handlePersonalDetailChange}
                        jobDescription={jobDescription}
                        onJobDescriptionChange={handleJobDescriptionChange}
                        loading={loading}
                        isUpdated={isUpdated}
                        copyToClipboard={copyToClipboard}
                    />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ResumePreview updatedMarkdown={updatedMarkdown} onUpdatedMarkdownChange={setUpdatedMarkdown} />

                        {showForm && (
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
                                />
                                )}
                    </Grid>
                </Grid>
            </Container>

            <SnackbarAlert
                open={snackbarOpen}
                onClose={() => setSnackbarOpen(false)}
                message="PDF generated succesfully! "
            />

        </div>
    );
};

export default ResumeBuilder
