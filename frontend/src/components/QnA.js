import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Box, CircularProgress, Tooltip, IconButton } from "@mui/material";
import { ContentCopy, ExpandMore } from "@mui/icons-material"; // Import ExpandMore icon
import axios from 'axios';

const QnA = ({ jobDescription, updatedMarkdown, aimodel, copyToClipboard }) => {
    const [question, setQuestion] = useState("");
    const onQuestionChange = (e) => setQuestion(e.target.value);

    const [isLoading, setIsLoading] = useState(false);
    const [answer, setAnswer] = useState("");
    const [answerError, setAnswerError] = useState(false);
    const [answerStatus, setAnswerStatus] = useState("");
    const onAnswerChange = (e) => setAnswer(e.target.value);

    const [isVisible, setIsVisible] = useState(false); // State to control visibility

    const handleGenerateAnswer = async () => {
        if (!updatedMarkdown || !jobDescription) {
            alert("Please provide an updated resume and job description");
            return;
        }

        setAnswer("");
        setAnswerError(false);
        setAnswerStatus("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:8000/resume/qna", {
                resume_markdown: updatedMarkdown,
                job_description: jobDescription,
                aimodel: aimodel,
                question: question,
            }, { withCredentials: true });
            setAnswer(response.data.answer);
            setAnswerStatus("Answer ready");
        } catch (error) {
            setAnswerError(true);
            if (error.response && error.response.data && error.response.data.detail) {
                setAnswerStatus(error.response.data.detail);
            } else {
                setAnswerStatus("Error generating answer");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Paper elevation={3} sx={{ padding: 3, marginTop: 2, marginBottom: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">QnA</Typography>
                <IconButton onClick={() => setIsVisible(!isVisible)}>
                    <ExpandMore />
                </IconButton>
            </Box>

            {isVisible && ( // Conditionally render the fields based on isVisible state
                <>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Enter an employer question"
                        value={question}
                        onChange={onQuestionChange}
                        sx={{ marginY: 2 }}
                    />
                    <Button variant="contained" onClick={handleGenerateAnswer} sx={{ textTransform: 'none', borderRadius: '5px' }}>
                        Answer ✨
                    </Button>

                    {isLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {answerStatus && (
                        <Box sx={{ marginTop: 1 }}> {/* Adds space between sections */}
                            <Typography variant="body1" sx={{ color: answerError ? 'red' : 'green', marginBottom: 2 }}>
                                {answerStatus}
                            </Typography>
                        </Box>
                    )}

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Answer will appear here"
                        value={answer}
                        onChange={onAnswerChange}
                        sx={{ marginY: 2 }}
                    />
                    <Tooltip title="Copy">
                        <IconButton onClick={() => copyToClipboard(answer)}>
                            <ContentCopy />
                        </IconButton>
                    </Tooltip>
                </>
            )}
        </Paper>
    );
};

export default QnA;
