import { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Paper, LinearProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DataGrid, esES } from '@mui/x-data-grid';

import { api } from './api';

function KPICard({ title, value, color = 'primary' }) {
  return (
    <Paper sx={{ p: 2, textAlign: 'center' }}>
      <Typography color="textSecondary" gutterBottom>{title}</Typography>
      <Typography variant="h4" color={color}>{value}</Typography>
    </Paper>
  );
}

function Dashboard() {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.kpi();
        setKpi(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!kpi) return <Typography>No data</Typography>;

  const kpiData = [
    { name: 'Total', value: kpi.total_revenue },
    { name: 'Apple', value: kpi.apple_revenue },
    { name: 'Android', value: kpi.android_revenue },
    { name: 'Accessories', value: kpi.accessories_revenue },
    { name: 'VAS', value: kpi.vas_revenue },
  ];

  const revenueByBrand = [
    { name: 'iPhone', value: kpi.iphone_revenue },
    { name: 'iPad', value: kpi.ipad_revenue },
    { name: 'Mac', value: kpi.mac_revenue },
    { name: 'Apple Watch', value: kpi.apple_watch_revenue },
    { name: 'Samsung', value: kpi.samsung_revenue },
    { name: 'Oppo', value: kpi.oppo_revenue },
    { name: 'Xiaomi', value: kpi.xiaomi_revenue },
    { name: 'Huawei', value: kpi.huawei_revenue },
    { name: 'Infinix', value: kpi.infinix_revenue },
    { name: 'Motorola', value: kpi.motorola_revenue },
    { name: 'Amazfit', value: kpi.amazfit_revenue },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>Sales Dashboard</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>KPI Overview</Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Revenue by Brand</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByBrand}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Recent Store Transactions</Typography>
        <DataGrid
          rows={[]}
          columns={[]}
          pageSize={5}
          rowsPerPageOptions={[5]}
          loading={false}
          localeText={esES.components.defaultProps.localeText}
          sx={{ height: 300 }}
        />
      </Box>
    </Container>
  );
}

export default function App() {
  return <Dashboard />;
}
