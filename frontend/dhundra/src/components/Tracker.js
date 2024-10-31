import React, { useEffect, useState } from 'react';
import AuthNavbar from './AuthNavbar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { Container, Typography, Table, Box, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, TextField, Grid2, TablePagination, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useUserContext } from './UserContext';

const Tracker = () => {
    // Data 
    const [history, setHistory] = useState([]);

    // Search parameters
    const [searchQuery, setSearchQuery] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    // Pagination 
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);
    const [totalRecords, setTotalRecords] = useState(0);

    // Editing records
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null); // record to edit
    const navigate = useNavigate();

    //Error pages
    const [findError,setfindError] = useState("");
    const [saveError,setsaveError] = useState("");

    // Get global user full name
    const { userFullName } = useUserContext();


    const fetchHistory = async () => {
        try {
            setfindError("");
            const response = await axios.get("http://localhost:8000/resume/history", {
                params: {
                    page: page,
                    size: rowsPerPage,
                    query: searchQuery,
                    fromDate: fromDate,
                    toDate: toDate,
                } , withCredentials: true });

            const sortedData = response.data.history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setHistory(sortedData);
            //Pagination 
            setTotalRecords(response.data.total);

        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setfindError(error.response.data.detail); // Set the upload error with detail from response
            } else {
                setfindError("Error finding records"); // Fallback error message
            }

            console.error("Error fetching history: ", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [page, rowsPerPage, searchQuery, fromDate, toDate]);

    const handleEdit = (record) => {
        setSelectedRecord(record);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedRecord(null);
    };

    const handleSaveRecord = async () => {
        if (selectedRecord) {
            try {
                await axios.put(`http://localhost:8000/resume/history/${selectedRecord.id}`, selectedRecord , { withCredentials: true });
                handleCloseEditDialog();
                fetchHistory();
            } catch (error) {
                if (error.response && error.response.data && error.response.data.detail) {
                    setsaveError(error.response.data.detail); // Set the upload error with detail from response
                } else {
                    setsaveError("Error finding resources"); // Fallback error message
                }
            }
        }
    };

    const truncateJobDescription = (description) => {
        return description ? `${description.substring(0, 10)}...` : "";
    };

    const handleDownload = async (pdfPath) => {
        try {
            const response = await axios.get(`http://localhost:8000/resume/download-resume/${pdfPath}`,{ withCredentials: true,
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute("download",`${userFullName} Resume.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setfindError(error.response.data.detail); // Set the upload error with detail from response
            } else {
                setfindError("Error downloading PDF"); // Fallback error message
            }
            console.error("Error downloading PDF:", error);
        }
    };

    const handleDelete = async (pdfPath) => {
        try {
            await axios.delete(`http://localhost:8000/resume/delete_resume/${pdfPath}`,{ withCredentials: true });
            setHistory(history.filter(entry => entry.pdfname !== pdfPath));
        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setfindError(error.response.data.detail); // Set the upload error with detail from response
            } else {
                setfindError("Error deleting entry"); // Fallback error message
            }
            console.error("Error deleting entry:", error);
        }
    };

    // Handle pagination change
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to the first page when changing rows per page
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString(); // Converts to a human-readable string
    };

    return (
        <div>
            <AuthNavbar />
            <Container>
                <Typography variant="h6" gutterBottom>
                    Resume History
                </Typography>

                <Grid2 sx={{ marginBottom: 2 }}>
                    <TextField
                        variant="outlined"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ marginRight: 2, width: '50%' }}
                    />
                    From
                    <TextField
                        type="date"
                        variant="outlined"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        sx={{ marginRight: 2, marginLeft: 2 }}
                    />
                    To 
                    <TextField
                        type="date"
                        variant="outlined"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        sx={{ marginRight: 2, marginLeft: 2 }}
                    />


                    <Box sx={{padding: 2}}>    
                        <Typography variant="p"  sx={{ color: 'green' }}>
                        {totalRecords ? (totalRecords): ( 0 )} Records found 
                        </Typography>
                    </Box>

                    { findError && (
                    <Box sx={{padding: 2}}>    
                        <Typography variant="p"  sx={{ color: 'red' }}>
                        {findError}
                        </Typography>
                    </Box>
                    )}


                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Company Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Job URL</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Additional</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Job Description</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>

                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {history.map((entry) => (
                                    <TableRow key={entry.id}>
                                        <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
                                        <TableCell>{entry.company_name}</TableCell>
                                        <TableCell>{entry.job_url}</TableCell>
                                        <TableCell>{entry.role}</TableCell>
                                        <TableCell>{entry.additionalData}</TableCell>
                                        <TableCell>{truncateJobDescription(entry.jobDescription)}</TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleEdit(entry)}>
                                                <EditIcon />
                                            </Button>
                                            <Button onClick={() => handleDelete(entry.pdfname)}>
                                                <DeleteIcon />
                                            </Button>
                                            <Button onClick={() => handleDownload(entry.pdfname)}>
                                                <DownloadIcon />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination Controls */}
                    <TablePagination
                        rowsPerPageOptions={[10, 20, 50]}
                        component="div"
                        count={totalRecords}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />

                    {/* Edit Dialog */}
                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                        <DialogTitle>Edit Record</DialogTitle>
                        <DialogContent>
                            {selectedRecord && (
                                <div>
                                    <TextField
                                        autoFocus
                                        margin="dense"
                                        label="Company Name"
                                        type="text"
                                        fullWidth
                                        value={selectedRecord.company_name}
                                        onChange={(e) => setSelectedRecord({ ...selectedRecord, company_name: e.target.value })}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Job URL"
                                        type="text"
                                        fullWidth
                                        value={selectedRecord.job_url}
                                        onChange={(e) => setSelectedRecord({ ...selectedRecord, job_url: e.target.value })}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Role"
                                        type="text"
                                        fullWidth
                                        value={selectedRecord.role}
                                        onChange={(e) => setSelectedRecord({ ...selectedRecord, role: e.target.value })}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Additional Data"
                                        type="text"
                                        fullWidth
                                        value={selectedRecord.additionalData}
                                        onChange={(e) => setSelectedRecord({ ...selectedRecord, additionalData: e.target.value })}
                                    />
                                    <TextField
                                        margin="dense"
                                        label="Job Description"
                                        type="text"
                                        fullWidth
                                        multiline
                                        value={selectedRecord.jobDescription}
                                        onChange={(e) => setSelectedRecord({ ...selectedRecord, jobDescription: e.target.value })}
                                    />

                                    { saveError && (
                                        <Box sx={{padding: 2}}>    
                                            <Typography variant="p"  sx={{ color: 'red' }}>
                                            {saveError}
                                            </Typography>
                                        </Box>
                                    )}

                                </div>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEditDialog} color="primary">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveRecord} color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Grid2>
            </Container>
        </div>
    );
}

export default Tracker;
