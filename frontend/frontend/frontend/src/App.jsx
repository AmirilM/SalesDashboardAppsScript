import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Tabs, Tab,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  TextField, MenuItem, CircularProgress, Alert
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, CartesianGrid
} from 'recharts';
import { api } from './api';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: '20px' }}>
      {value === index && children}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [kpi, setKpi] = useState(null);
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [error, setError] = useState(null);

  // Transactions state
  const [storeTx, setStoreTx] = useState([]);
  const [storeTxTotal, setStoreTxTotal] = useState(0);
  const [storeTxPage, setStoreTxPage] = useState(0);
  const [storeTxRowsPerPage, setStoreTxRowsPerPage] = useState(10);
  const [loadingStoreTx, setLoadingStoreTx] = useState(false);

  // Staff Transactions state
  const [staffTx, setStaffTx] = useState([]);
  const [staffTxTotal, setStaffTxTotal] = useState(0);
  const [staffTxPage, setStaffTxPage] = useState(0);
  const [staffTxRowsPerPage, setStaffTxRowsPerPage] = useState(10);
  const [loadingStaffTx, setLoadingStaffTx] = useState(false);

  // Filters
  const [searchStore, setSearchStore] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await api.kpi();
        setKpi(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingKpi(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (tab === 1) {
      loadStoreTransactions(storeTxPage + 1, storeTxRowsPerPage);
    } else if (tab === 2) {
      loadStaffTransactions(staffTxPage + 1, staffTxRowsPerPage);
    }
  }, [tab, storeTxPage, storeTxRowsPerPage, staffTxPage, staffTxRowsPerPage]);

  const loadStoreTransactions = async (page, pageSize) => {
    setLoadingStoreTx(true);
    try {
      const res = await api.storeTransactions(page, pageSize);
      setStoreTx(res.rows || []);
      setStoreTxTotal(res.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStoreTx(false);
    }
  };

  const loadStaffTransactions = async (page, pageSize) => {
    setLoadingStaffTx(true);
    try {
      const res = await api.staffTransactions(page, pageSize);
      setStaffTx(res.rows || []);
      setStaffTxTotal(res.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingStaffTx(false);
    }
  };

  if (loadingKpi) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  const kpiData = kpi ? [
    { name: 'Total', value: kpi.total_revenue },
    { name: 'Apple', value: kpi.apple_revenue },
    { name: 'Android', value: kpi.android_revenue },
    { name: 'Accessories', value: kpi.accessories_revenue },
    { name: 'VAS', value: kpi.vas_revenue },
  ] : [];

  const brandData = kpi ? [
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
  ] : [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Sales Dashboard Enterprise</Typography>
      
      <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tab label="Overview & KPI" />
        <Tab label="Store Transactions" />
        <Tab label="Staff Transactions" />
      </Tabs>

      {/* TAB 0: OVERVIEW */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Category Revenue Breakdown</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={kpiData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Brand Revenue Share</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={brandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#dc004e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* TAB 1: STORE TRANSACTIONS */}
      <TabPanel value={tab} index={1}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Store Transactions</Typography>
          {loadingStoreTx ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Store Name</TableCell>
                      <TableCell>Region</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                      <TableCell align="right">Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {storeTx.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.date || row.Date || '-'}</TableCell>
                        <TableCell>{row.store_name || row.Store || '-'}</TableCell>
                        <TableCell>{row.region || row.Region || '-'}</TableCell>
                        <TableCell align="right">{row.revenue || row.Revenue || 0}</TableCell>
                        <TableCell align="right">{row.qty || row.Qty || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={storeTxTotal}
                page={storeTxPage}
                onPageChange={(e, newPage) => setStoreTxPage(newPage)}
                rowsPerPage={storeTxRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setStoreTxRowsPerPage(parseInt(e.target.value, 10));
                  setStoreTxPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </>
          )}
        </Paper>
      </TabPanel>

      {/* TAB 2: STAFF TRANSACTIONS */}
      <TabPanel value={tab} index={2}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>Staff Transactions</Typography>
          {loadingStaffTx ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Staff Name</TableCell>
                      <TableCell>Store Name</TableCell>
                      <TableCell align="right">Revenue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffTx.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.date || row.Date || '-'}</TableCell>
                        <TableCell>{row.staff_name || row.Staff || '-'}</TableCell>
                        <TableCell>{row.store_name || row.Store || '-'}</TableCell>
                        <TableCell align="right">{row.revenue || row.Revenue || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={staffTxTotal}
                page={staffTxPage}
                onPageChange={(e, newPage) => setStaffTxPage(newPage)}
                rowsPerPage={staffTxRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setStaffTxRowsPerPage(parseInt(e.target.value, 10));
                  setStaffTxPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50]}
              />
            </>
          )}
        </Paper>
      </TabPanel>
    </Container>
  );
}
