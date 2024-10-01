import React from 'react';
import { TextField, Paper, Typography } from "@mui/material";

const ResumePreview = ({ updatedMarkdown,onUpdatedMarkdownChange }) => (
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
  </Paper>
);

export default ResumePreview;
