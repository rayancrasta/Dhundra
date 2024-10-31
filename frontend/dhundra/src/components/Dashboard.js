import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUserContext } from './UserContext';
import {
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from '@mui/material';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import AuthNavbar from './AuthNavbar';
import { Tooltip } from 'react-tooltip';
import './Dashboard.css';

const API_BASE_URL = 'http://localhost:8000';

function Dashboard() {
  const [jobCount, setJobCount] = useState(0);
  const [heatmapData, setHeatmapData] = useState([]);
  const [topRoles, setTopRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userFullName } = useUserContext();
  // console.log("Full Name: " ,userFullName)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [countRes, heatmapRes, rolesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/dashboard/jobs-count`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/dashboard/jobs-heatmap`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/dashboard/jobs-top-roles`, { withCredentials: true }),
        ]);

        setJobCount(countRes.data.total_jobs_applied);
        setHeatmapData(heatmapRes.data);
        setTopRoles(rolesRes.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('No job applications found. Click on Resume in the top right to get started');
        } else {
          setError('Error fetching job applications.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const endDate = new Date(); // Today
  const startDate = new Date(); 
  startDate.setMonth(endDate.getMonth() - 2); // Set start date to 3 months ago
  startDate.setDate(1); // First day of the month

  const prepareHeatmapData = (data) => {
    const heatmapData = [];

    // Create a copy of the start date to avoid mutating it
    let currentDate = new Date(startDate);

    // Loop through each date from startDate to endDate
    while (currentDate <= endDate) {
      // Format the current date as YYYY-MM-DD
      const dateString = currentDate.toISOString().split('T')[0];

      // Find if there is a corresponding entry in the data
      const entry = data.find(item => item.date === dateString);

      // Push the date and count (0 if not found) into the heatmapData array
      heatmapData.push({
        date: dateString,
        count: entry ? entry.count : 0, // Use entry count or 0 if not found
      });

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return heatmapData;
};


  const preparedData = prepareHeatmapData(heatmapData);

  const splitDataByMonth = (data) => {
    const months = {};
    data.forEach((entry) => {
      const date = new Date(entry.date);
      const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!months[monthKey]) {
        months[monthKey] = [];
      }
      months[monthKey].push(entry);
    });
    return months;
  };

  const monthlyData = splitDataByMonth(preparedData);

  return (
    <div>
      <AuthNavbar />
      <Container>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <>
            <Card style={{ marginTop: '20px' }}>
              <CardContent>

              <Typography variant="h5">
                  Welcome <span className="gradient-box">{userFullName}</span>
                </Typography>
              

                <Typography variant="h5">
                  You have applied for <span className="gradient-box"><strong>{jobCount}</strong></span> jobs 
                </Typography>
              </CardContent>
            </Card>

            <Card style={{ marginTop: '20px' }}>
              <CardContent>
                <div className="heatmap-container">
                  {Object.entries(monthlyData).map(([month, data]) => {
                    const monthDate = new Date(data[0].date);
                    const monthStartDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
                    const monthEndDate =
                      monthDate.getMonth() === new Date().getMonth() && monthDate.getFullYear() === new Date().getFullYear()
                        ? endDate
                        : new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

                    return (
                      <div key={month} className="heatmap-item">
                        <Typography variant="h6">{month}</Typography>
                        <CalendarHeatmap
                          startDate={monthStartDate}
                          endDate={monthEndDate}
                          values={data}
                          classForValue={(value) => {
                            if (!value || value.count == 0) {
                              return 'color-empty'; // No data
                            }
                            // Define your colors based on count ranges
                            if (value.count >= 50) return 'color-high'; // High count
                            if (value.count >= 20) return 'color-medium'; // Medium count
                            return 'color-low'; // Low count
                          }}
                          tooltipDataAttrs={(value) => {
                            if (!value || !value.date) {
                              return { 'data-tooltip-id': 'heatmap-tooltip', 'data-tooltip-content': 'No data' };
                            }
                            const date = new Date(value.date);
                            return {
                              'data-tooltip-id': 'heatmap-tooltip',
                              'data-tooltip-content': `Date: ${date.toLocaleDateString()}, Applications: ${value.count}`,
                            };
                          }}
                        />

                        <Tooltip id="heatmap-tooltip" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card style={{ marginTop: '20px' }}>
              <CardContent>
                <Typography variant="h5">Top 10 Roles Applied For</Typography>
                <List>
                  {topRoles.map((role, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={`${role.role}`} secondary={`Applications: ${role.count}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
}

export default Dashboard;
