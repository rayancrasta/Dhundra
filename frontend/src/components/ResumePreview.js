import React, { useState } from 'react';
import { TextField, Paper, Typography, Button, Box } from "@mui/material";
import ReIterate from './ReIterate';
import axios from 'axios';

const ResumePreview = ({ updatedMarkdown, onUpdatedMarkdownChange, jobDescription, showForm, aimodel,
  relevancyScore,setRelevancyScore,reasoning,setReasoning
 }) => {
  const [loading, setLoading] = useState(false);

  const checkRelevancy = async () => {
    if (!jobDescription || !updatedMarkdown) {
      alert("Enter a job description and resume");
      return;
    }

    setLoading(true);
    setRelevancyScore(''); // Reset relevancy score
    setReasoning(''); // Reset reasoning

    try {
      const response = await axios.post('http://localhost:8000/resume/check_relevancy', {
        jobDescription,
        updatedMarkdown,
        aimodel
      }, { withCredentials: true });

      const { score, summary } = response.data;
      setRelevancyScore(score);
      setReasoning(summary);
    } catch (error) {
      console.error("Error checking relevancy:", error);
      setRelevancyScore('Error');
      setReasoning('Unable to fetch relevancy.');
    } finally {
      setLoading(false);
    }
  };

  // Function to determine fill percentage based on score
  const getScorePercentage = (score) => {
    switch (score) {
      case "Not Relevant":
        return 0;
      case "Little Relevant":
        return 25;
      case "Relevant":
        return 50;
      case "Very Relevant":
        return 75;
      case "Perfect Match":
        return 100;
      default:
        return 0;
    }
  };

  const fillPercentage = getScorePercentage(relevancyScore);

  return (
    <Paper elevation={3} sx={{ padding: 3, flex: '1 1 auto', marginBottom: 3 }}>
      <Typography variant="h6">Updated Resume</Typography>
      <TextField
        fullWidth
        multiline
        rows={10}
        value={updatedMarkdown}
        sx={{ marginTop: 2 }}
        placeholder="Updated resume content will appear here"
        onChange={(e) => onUpdatedMarkdownChange(e.target.value)}
      />

      {showForm && (
        <ReIterate
          jobDescription={jobDescription}
          updatedMarkdown={updatedMarkdown}
          setUpdatedMarkdown={onUpdatedMarkdownChange}
          aimodel={aimodel}
        />
      )}

      {updatedMarkdown && (
        <Button
          variant="contained"
          onClick={checkRelevancy}
          sx={{ marginTop: 2 ,textTransform: "none" }}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Relevancy ✨'}
        </Button>
      )}

      {relevancyScore && (
        <Box sx={{ marginTop: 2, width: '100%' }}>
          <Typography variant="body1">
            <strong>Relevancy Score:</strong> {relevancyScore}</Typography>
          
          {/* Spectrum bar with color fill */}
          <Box 
            sx={{ 
              position: 'relative', 
              height: '20px', 
              width: '100%', 
              background: 'white',
              borderRadius: '4px', 
              overflow: 'hidden',
              border: '1px solid #ddd',
              marginTop: 1
            }}
          >
            <Box 
              sx={{
                height: '100%',
                width: `${fillPercentage}%`,
                background: 'linear-gradient(90deg, red, orange, yellow, green, #4CAF50)',
                transition: 'width 0.5s ease',
              }}
            />
          </Box>

          {/* Labels under the bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 0.5 }}>
            <Typography variant="caption">Not Relevant</Typography>
            <Typography variant="caption">Little Relevant</Typography>
            <Typography variant="caption">Relevant</Typography>
            <Typography variant="caption">Very Relevant</Typography>
            <Typography variant="caption">Perfect Match</Typography>
          </Box>
        </Box>
      )}

      {reasoning && (
        <Typography variant="body2" sx={{ marginTop: 1, fontStyle: 'italic' }}>
          {reasoning}
        </Typography>
      )}
    </Paper>
  );
};

export default ResumePreview;
