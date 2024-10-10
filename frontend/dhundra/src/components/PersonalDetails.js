import React , { useEffect, useState } from 'react';
import axios from 'axios';
import { TextField, Button, Typography, Box, Tooltip, IconButton,Paper } from "@mui/material";
import { ContentCopy } from "@mui/icons-material";

const PersonalDetailsComp = ({ copyToClipboard }) => {

  const [personalDetails,setPersonalDetails] = useState({
    github: "",
    linkedin: "",
    website: "",
    medium: "",
  });

  const [isEditing,setIsEditing] = useState(false);
  const onEdit = () => setIsEditing(!isEditing);


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



  return (
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
            onChange={handlePersonalDetailChange}
            sx={{ marginY: 1 }}
          />
        ))}
        <Button variant="contained" onClick={handleSavePersonalDetails} fullWidth sx={{ marginTop: 2 }}>
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
        { personalDetaileError && (
          <Typography variant="body1" sx={{ color: 'red', marginBottom: 2 }}>
            {personalDetaileError}
          </Typography>
        )}
      </Box>
    )}
  </Paper>
)
};

export default PersonalDetailsComp;
