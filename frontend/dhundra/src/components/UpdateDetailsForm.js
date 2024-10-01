import React from 'react'
import { TextField, Button, Paper, Typography, Box, MenuItem, CircularProgress } from "@mui/material";

const UpdateDetailsForm = ({ companyName, onCompanyNameChange, jobUrl, onJobUrlChange, role, onRoleChange, dropdownValue, onDropdownChange, onGeneratePdf, pdfLoading }) => {
    <Paper elevation={3} sx={{ padding: 3, flex: '1 1 auto', marginBottom: 3 }}>
        <Typography variant="h6">Update Details</Typography>
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

        <Button variant="contained" onClick={onGeneratePdf} fullWidth>
            Save PDF
        </Button>

        {pdfLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <CircularProgress />
        </Box>
        )}
    </Paper>
}

export default UpdateDetailsForm
