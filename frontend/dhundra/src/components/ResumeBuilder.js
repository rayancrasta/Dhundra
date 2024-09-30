import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

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

    // Shortcut copy menu
    const [snackbarOpen,setSnackbarOpen] = useState(false);  // Copied message
    const [snackbarMessage,setSnackbarMessage] = useState("");
    const [personalDetails,setPersonalDetails] = useState({
        github: "",
        linkedin: "",
        website: "",
        medium: "",
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPersonalDetails = async () => {
            
        }
    })

    return (
        <div>
        
        </div>
    )
}

export default ResumeBuilder
