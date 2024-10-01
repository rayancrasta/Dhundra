import React from 'react';
import { TextField, Button, Typography, Box, Tooltip, IconButton,Paper } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

const PersonalDetails = ({ personalDetails, onDetailChange, onSave, isEditing, onEdit,copyToClipboard }) => (
  <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
      Personal Details
    </Typography>
    {isEditing ? (
      <>
        {Object.keys(personalDetails).map((key) => (
          <TextField
            key={key}
            fullWidth
            label={key.charAt(0).toUpperCase() + key.slice(1)}
            name={key}
            value={personalDetails[key]}
            onChange={onDetailChange}
            sx={{ marginY: 1 }}
          />
        ))}
        <Button variant="contained" onClick={onSave} fullWidth sx={{ marginTop: 2 }}>
          Save
        </Button>
      </>
    ) : (
      <Box>
        {Object.keys(personalDetails).map((key) => (
          <Typography variant="body1" key={key}>
          <Typography 
            variant="body1" 
            component="span" 
            sx={{ fontWeight: 'bold', color: 'primary.main' }} // Set bold and primary color
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}:
          </Typography> 
          {' '}{personalDetails[key]} {/* Add space between key and value */}
          <Tooltip title="Copy">
            <IconButton onClick={() => copyToClipboard(personalDetails[key])}>
              <ContentCopy />  {/* the content copy button */}
            </IconButton>
          </Tooltip>
        </Typography>
        ))}
        <Button variant="contained" onClick={onEdit} fullWidth sx={{ marginTop: 2 }}>
          Edit
        </Button>
      </Box>
    )}
  </Paper>
);

export default PersonalDetails;
