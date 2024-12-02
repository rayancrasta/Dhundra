import React ,{ useState }from 'react';
import axios from 'axios';
import { TextField, Button, Paper, Typography, Box, MenuItem, CircularProgress, Radio, RadioGroup, FormControlLabel } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';
import { useUserContext } from './UserContext';

const UpdateDetailsForm = ({ updatedMarkdown,jobDescription }) => {
    const [companyName,setCompanyName] = useState("");
    const [jobUrl,setjobURl] = useState("");
    const [role,setRole] = useState("");
    const [dropdownValue,setDropdownValue] = useState("");
    const [pdfLoading,setpdfLoading] = useState(false);  
    const [pdfGenerationMessage,setPdfGenerationMessage] = useState("");
    const [pdfError, setpdfError] = useState(false);
    const [pdfPath,setPdfPath] = useState(""); // pdf generated path
    const [additionalData,setadditionalData] = useState("");
    const { userFullName } = useUserContext();
    const [style, setStyle] = useState("style1");

    const handleCompanyNameChange = (e) => setCompanyName(e.target.value);
    const handleJobUrlChange = (e) => setjobURl(e.target.value);
    const handleRoleChange = (e) => setRole(e.target.value);
    const onDropdownChange = (e) => setDropdownValue(e.target.value);
    const handleadditionalDataChange = (e) => setadditionalData(e.target.value);
    
    const onGeneratePdf = async () => {
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
                jobDescription: jobDescription,
                additionalData : additionalData,
                style: style
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
    const onDownloadResume = async () => {
        try {
            setpdfError(false);
            const response = await axios.get(`http://localhost:8000/resume/download-resume/${pdfPath}`,{withCredentials: true,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf"}));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download",`${userFullName} Resume ${companyName}.pdf`);

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

    const onStyleChange = (e) => setStyle(e.target.value);

    
    return (
    <Paper elevation={3} sx={{ padding: 3, flex: '1 1 auto', marginBottom: 3 }}>
        <Typography variant="h6">Save Details</Typography>
        <TextField
        fullWidth
        label="Company Name"
        value={companyName}
        onChange={handleCompanyNameChange}
        sx={{ marginY: 1 }}
        />

        <TextField
        fullWidth
        label="Job URL"
        value={jobUrl}
        onChange={handleJobUrlChange}
        sx={{ marginY: 1 }}
        />

        <TextField
        fullWidth
        label="Role"
        value={role}
        onChange={handleRoleChange}
        sx={{ marginY: 1 }}
        />

        <TextField
        fullWidth
        label="Additional Data"
        value={additionalData}
        onChange={handleadditionalDataChange}
        sx={{ marginY: 1 }}
        />

        <TextField
        fullWidth
        select
        label="Company or Recruitment"
        value={dropdownValue}
        onChange={onDropdownChange}
        sx={{ marginY: 1 }}
        >
            <MenuItem value="company">Company</MenuItem>
            <MenuItem MenuItem value="recruitment">Recruitment</MenuItem>
        </TextField>

        {/* Radio buttons for style selection */}
        <Box sx={{ marginY: 2 }}>
                <Typography variant="body1">Select Style:</Typography>
                <RadioGroup
                    row
                    value={style}
                    onChange={onStyleChange}
                >
                    <FormControlLabel value="style1" control={<Radio />} label="Style 1 (Blue)" />
                    <FormControlLabel value="style2" control={<Radio />} label="Style 2 (B/W)" />
                </RadioGroup>
        </Box>

        <Button variant="contained" onClick={onGeneratePdf} sx={{ textTransform: 'none', borderRadius: '5px' , marginTop: 2}}>
        Generate PDF
        </Button>

        {pdfLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <CircularProgress />
        </Box>
        )}


        {pdfGenerationMessage && (
        <Box sx={{ marginTop: 3 }}> {/* Adds space between sections */}
        <Typography variant="body1" sx={{ color: pdfError ? 'red' : 'green', marginBottom: 2 }}>
            {pdfGenerationMessage}
        </Typography>

            <Button 
            variant="contained" 
            onClick={onDownloadResume} 
            sx={{ textTransform: 'none', display: 'flex', alignItems: 'center' }} // Align icon and text
            >
            <DownloadIcon sx={{ marginRight: 1 }} /> {/* Adds download icon */}
            Download
            </Button>
        </Box>
        )}
    </Paper>
    )
}

export default UpdateDetailsForm
