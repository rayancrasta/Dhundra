import React from 'react'
import { TextField, Button, Paper, Typography, Box, MenuItem, CircularProgress } from "@mui/material";
import DownloadIcon from '@mui/icons-material/Download';

const UpdateDetailsForm = ({ companyName, onCompanyNameChange, jobUrl, onJobUrlChange, role, onRoleChange, dropdownValue, onDropdownChange, onGeneratePdf, pdfLoading, pdfGenerationMessage, onDownloadResume ,pdfError }) => {
    return (
    <Paper elevation={3} sx={{ padding: 3, flex: '1 1 auto', marginBottom: 3 }}>
        <Typography variant="h6">Save Details</Typography>
        <TextField
        fullWidth
        label="Company Name"
        value={companyName}
        onChange={onCompanyNameChange}
        sx={{ marginY: 1 }}
        />

        <TextField
        fullWidth
        label="Job URL"
        value={jobUrl}
        onChange={onJobUrlChange}
        sx={{ marginY: 1 }}
        />

        <TextField
        fullWidth
        label="Role"
        value={role}
        onChange={onRoleChange}
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
