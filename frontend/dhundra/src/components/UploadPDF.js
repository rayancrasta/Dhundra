import React, { useState } from "react";
import axios from "axios";
import { Button, Paper, Typography, Box, CircularProgress, TextField } from "@mui/material";

const UploadPDF = ({aimodel}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [markdownFile, setMarkdownFile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [error, setError] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setMarkdownFile(""); // Clear any previous markdown content
    setUploadMessage(""); // Clear previous messages
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file to upload.");
      return;
    }

    setIsLoading(true);
    setError(false);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("model",aimodel);

    try {
      const response = await axios.post("http://localhost:8000/resume/get_markdown", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
        responseType: "blob", // Expecting a file (markdown) response
      });

      const blob = new Blob([response.data], { type: "text/markdown" });
      const markdownURL = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = markdownURL;
      link.setAttribute("download", "converted_markdown.md");
      document.body.appendChild(link);
      link.click();
      link.remove();

      setUploadMessage("File uploaded successfully.");
    } catch (error) {
      setError(true);
      setUploadMessage("Error uploading file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Paper elevation={3} sx={{ padding: 3, marginTop: 3 }}>
        <Typography variant="h6">Convert PDF to Markdown</Typography>

        <input type="file" accept="application/pdf" onChange={handleFileChange} />

        <Box>
            <Button
            variant="contained"
            onClick={handleUpload}
            sx={{ textTransform: "none", borderRadius: "5px", marginTop: 2 }}
            disabled={isLoading}
            >
            Upload
            </Button>
        </Box>

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {uploadMessage && (
          <Typography variant="body1" sx={{ color: error ? "red" : "green", marginTop: 2 }}>
            {uploadMessage}
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default UploadPDF;
