import React from 'react';
import { TextField, Paper, Typography } from "@mui/material";
import ReIterate from './ReIterate';

const ResumePreview = ({ updatedMarkdown,onUpdatedMarkdownChange , jobDescription, showForm, aimodel }) => (
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

    { showForm && (
      <ReIterate
        jobDescription={jobDescription}
        updatedMarkdown={updatedMarkdown}
        setUpdatedMarkdown={onUpdatedMarkdownChange}
        aimodel={aimodel}
      />
    )}
  </Paper>
);

export default ResumePreview;
