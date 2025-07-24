import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Tooltip,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  People,
  Phone,
  WhatsApp,
  AccessTime,
  CheckCircle,
  RadioButtonUnchecked,
  SwapHoriz,
  Visibility,
  Search,
  FilterList,
  Refresh,
  Campaign,
  Today,
  CalendarMonth,
  AttachMoney,
  Star
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { glassEffect } from '../theme/modernTheme';

const MarketingPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({});
  const [customers, setCustomers] = useState([]);
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [stageUpdateDialog, setStageUpdateDialog] = useState({ open: false, customer: null });

  useEffect(() => {
    loadData();
  }, [selectedStage, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await fetch('/api/marketing/statistics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const statsData = await statsResponse.json();
      setStatistics(statsData);

      // Load customers
      const params = new URLSearchParams();
      if (selectedStage !== 'all') params.append('stage', selectedStage);
      if (searchTerm) params.append('search', searchTerm);
      
      const customersResponse = await fetch(`/api/marketing/customers?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const customersData = await customersResponse.json();
      setCustomers(customersData.customers || []);
    } catch (error) {
      console.error('Error loading marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStageUpdate = async (customerId, newStage) => {
    try {
      const response = await fetch(`/api/marketing/customers/${customerId}/stage`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ stage: newStage })
      });

      if (response.ok) {
        loadData();
        setStageUpdateDialog({ open: false, customer: null });
      }
    } catch (error) {
      console.error('Error updating stage:', error);
    }
  };

  const openWhatsApp = (phoneNumber) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'leads': return '#3B82F6';
      case 'interest': return '#F59E0B';
      case 'booked': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'leads': return <RadioButtonUnchecked />;
      case 'interest': return <Star />;
      case 'booked': return <CheckCircle />;
      default: return <RadioButtonUnchecked />;
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Tidak diketahui';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit yang lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam yang lalu`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} hari yang lalu`;
    return new Date(date).toLocaleDateString('id-ID');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <PageHeader
        title="Marketing Dashboard"
        subtitle="Kelola leads dan customer journey"
        icon={Campaign}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Marketing' }
        ]}
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ ...glassEffect, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 32, color: '#3B82F6', mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {statistics.leads_this_year || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Leads Tahun Ini
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ ...glassEffect, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth sx={{ fontSize: 32, color: '#8B5CF6', mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {statistics.leads_this_month || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Leads Bulan Ini
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ ...glassEffect, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Today sx={{ fontSize: 32, color: '#EC4899', mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {statistics.leads_today || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Leads Hari Ini
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ ...glassEffect, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ fontSize: 32, color: '#F59E0B', mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {statistics.leads_yesterday || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Leads Kemarin
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ ...glassEffect, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AttachMoney sx={{ fontSize: 32, color: '#10B981', mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {statistics.closings_this_month || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Closing Bulan Ini
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2}>
          <Card sx={{ ...glassEffect, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle sx={{ fontSize: 32, color: '#10B981', mr: 1 }} />
                <Typography variant="h4" fontWeight={700}>
                  {statistics.closings_today || 0}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Closing Hari Ini
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pipeline Overview */}
      <Card sx={{ ...glassEffect, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pipeline Overview Tahun Ini
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" sx={{ color: '#3B82F6', fontWeight: 700 }}>
                  {statistics.year_leads_count || 0}
                </Typography>
                <Typography variant="subtitle1">Leads</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={100} 
                  sx={{ mt: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(59, 130, 246, 0.2)' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" sx={{ color: '#F59E0B', fontWeight: 700 }}>
                  {statistics.year_interest_count || 0}
                </Typography>
                <Typography variant="subtitle1">Interest</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(statistics.year_interest_count / statistics.year_leads_count) * 100 || 0} 
                  sx={{ mt: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(245, 158, 11, 0.2)' }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h3" sx={{ color: '#10B981', fontWeight: 700 }}>
                  {statistics.year_booked_count || 0}
                </Typography>
                <Typography variant="subtitle1">Booked</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(statistics.year_booked_count / statistics.year_leads_count) * 100 || 0} 
                  sx={{ mt: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card sx={{ ...glassEffect }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Customer Management</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                size="small"
                placeholder="Cari nama atau nomor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                >
                  <MenuItem value="all">Semua</MenuItem>
                  <MenuItem value="leads">Leads</MenuItem>
                  <MenuItem value="interest">Interest</MenuItem>
                  <MenuItem value="booked">Booked</MenuItem>
                </Select>
              </FormControl>
              <Button 
                variant="contained" 
                startIcon={<Refresh />}
                onClick={loadData}
              >
                Refresh
              </Button>
            </Box>
          </Box>

          <TableContainer component={Paper} sx={{ ...glassEffect }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Customer</TableCell>
                  <TableCell>WhatsApp</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Last Contact</TableCell>
                  <TableCell>Summary</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: getStageColor(customer.pipeline_stage) }}>
                          {customer.name ? customer.name.charAt(0) : 'U'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {customer.name || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.message_count || 0} messages
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<WhatsApp />}
                        onClick={() => openWhatsApp(customer.phone_number)}
                        sx={{ 
                          background: 'linear-gradient(135deg, #25D366, #128C7E)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #128C7E, #25D366)'
                          }
                        }}
                      >
                        {customer.phone_number}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStageIcon(customer.pipeline_stage)}
                        label={customer.pipeline_stage}
                        size="small"
                        sx={{
                          backgroundColor: `${getStageColor(customer.pipeline_stage)}20`,
                          color: getStageColor(customer.pipeline_stage),
                          border: `1px solid ${getStageColor(customer.pipeline_stage)}40`
                        }}
                      />
                    </TableCell>
                    <TableCell>{customer.package_code || '-'}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption">
                          {formatTimeAgo(customer.last_contact_at)}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Last: {customer.last_message_from}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="caption" noWrap>
                        {customer.summary || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Change Stage">
                          <IconButton
                            size="small"
                            onClick={() => setStageUpdateDialog({ open: true, customer })}
                          >
                            <SwapHoriz />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedCustomer(customer)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Stage Update Dialog */}
      <Dialog 
        open={stageUpdateDialog.open} 
        onClose={() => setStageUpdateDialog({ open: false, customer: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Update Pipeline Stage</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Update stage for: <strong>{stageUpdateDialog.customer?.name || 'Unknown'}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>New Stage</InputLabel>
            <Select
              defaultValue={stageUpdateDialog.customer?.pipeline_stage}
              onChange={(e) => handleStageUpdate(stageUpdateDialog.customer?.id, e.target.value)}
            >
              <MenuItem value="leads">Leads</MenuItem>
              <MenuItem value="interest">Interest</MenuItem>
              <MenuItem value="booked">Booked</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStageUpdateDialog({ open: false, customer: null })}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MarketingPage;