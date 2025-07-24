import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  LinearProgress,
  Tooltip,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Autocomplete
} from '@mui/material';
import {
  Hotel,
  Add,
  Edit,
  Delete,
  Visibility,
  LocationCity,
  EventAvailable,
  SingleBed,
  Payment,
  CheckCircle,
  Cancel,
  Upload,
  AttachFile,
  Restaurant,
  Business,
  Phone,
  CalendarMonth,
  Info
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { glassEffect } from '../theme/modernTheme';

const HotelPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({
    package_id: '',
    hotel_name: '',
    city: '',
    check_in_date: '',
    check_out_date: '',
    rooms_quad: 0,
    rooms_double: 0,
    rooms_triple: 0,
    payment_amount: '',
    provider_name: '',
    provider_contact: '',
    meal_type: 'no_meals',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load hotels
      const hotelsResponse = await fetch('/api/hotels', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const hotelsData = await hotelsResponse.json();
      setHotels(hotelsData.hotels || []);

      // Load packages for dropdown
      const packagesResponse = await fetch('/api/packages', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const packagesData = await packagesResponse.json();
      setPackages(packagesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hotel = null) => {
    if (hotel) {
      setFormData({
        ...hotel,
        check_in_date: hotel.check_in_date?.split('T')[0] || '',
        check_out_date: hotel.check_out_date?.split('T')[0] || ''
      });
    } else {
      setFormData({
        package_id: '',
        hotel_name: '',
        city: '',
        check_in_date: '',
        check_out_date: '',
        rooms_quad: 0,
        rooms_double: 0,
        rooms_triple: 0,
        payment_amount: '',
        provider_name: '',
        provider_contact: '',
        meal_type: 'no_meals',
        notes: ''
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormData({});
  };

  const handleSubmit = async () => {
    try {
      const url = formData.id ? `/api/hotels/${formData.id}` : '/api/hotels';
      const method = formData.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        loadData();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error saving hotel:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus data hotel ini?')) {
      try {
        const response = await fetch(`/api/hotels/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          loadData();
        }
      } catch (error) {
        console.error('Error deleting hotel:', error);
      }
    }
  };

  const handleViewDetails = async (hotel) => {
    try {
      const response = await fetch(`/api/hotels/${hotel.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setSelectedHotel(data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error loading hotel details:', error);
    }
  };

  const handleFileUpload = async (hotelId, file) => {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', 'confirmation_letter');

    try {
      const response = await fetch(`/api/hotels/${hotelId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        handleViewDetails({ id: hotelId });
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'pending': return 'error';
      default: return 'default';
    }
  };

  const getVisaStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMealTypeLabel = (type) => {
    switch (type) {
      case 'international_fullboard': return 'International Fullboard';
      case 'asia': return 'Asia';
      case 'no_meals': return 'No Meals';
      default: return type;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <PageHeader
        title="Manajemen Hotel"
        subtitle="Kelola reservasi hotel untuk paket umroh"
        icon={Hotel}
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Hotel' }
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Tambah Hotel
          </Button>
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glassEffect }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Hotels
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {hotels.length}
                  </Typography>
                </Box>
                <Hotel sx={{ fontSize: 40, color: 'primary.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glassEffect }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Visa Approved
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {hotels.filter(h => h.visa_approval_status === 'approved').length}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glassEffect }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Fully Paid
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {hotels.filter(h => h.payment_status === 'paid').length}
                  </Typography>
                </Box>
                <Payment sx={{ fontSize: 40, color: 'success.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ ...glassEffect }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Rooms
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {hotels.reduce((sum, h) => sum + (h.total_rooms || 0), 0)}
                  </Typography>
                </Box>
                <SingleBed sx={{ fontSize: 40, color: 'info.main', opacity: 0.3 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hotels Table */}
      <Card sx={{ ...glassEffect }}>
        <CardContent>
          <TableContainer component={Paper} sx={{ ...glassEffect }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Hotel</TableCell>
                  <TableCell>Package</TableCell>
                  <TableCell>Check In/Out</TableCell>
                  <TableCell align="center">Rooms</TableCell>
                  <TableCell>Visa Status</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hotels.map((hotel) => (
                  <TableRow key={hotel.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {hotel.hotel_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <LocationCity sx={{ fontSize: 14, mr: 0.5 }} />
                          {hotel.city}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {hotel.package_code} - {hotel.package_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="caption" display="block">
                          In: {new Date(hotel.check_in_date).toLocaleDateString('id-ID')}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Out: {new Date(hotel.check_out_date).toLocaleDateString('id-ID')}
                        </Typography>
                        <Chip 
                          label={`${hotel.total_nights} nights`} 
                          size="small" 
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ textAlign: 'center' }}>
                        {hotel.rooms_quad > 0 && (
                          <Typography variant="caption" display="block">
                            Quad: {hotel.rooms_quad}
                          </Typography>
                        )}
                        {hotel.rooms_double > 0 && (
                          <Typography variant="caption" display="block">
                            Double: {hotel.rooms_double}
                          </Typography>
                        )}
                        {hotel.rooms_triple > 0 && (
                          <Typography variant="caption" display="block">
                            Triple: {hotel.rooms_triple}
                          </Typography>
                        )}
                        <Typography variant="caption" fontWeight={600}>
                          Total: {hotel.total_rooms}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={hotel.visa_approval_status}
                        size="small"
                        color={getVisaStatusColor(hotel.visa_approval_status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Chip
                          label={hotel.payment_status}
                          size="small"
                          color={getPaymentStatusColor(hotel.payment_status)}
                        />
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {formatCurrency(hotel.paid_amount || 0)} / {formatCurrency(hotel.payment_amount || 0)}
                        </Typography>
                        {hotel.payment_percentage > 0 && (
                          <LinearProgress 
                            variant="determinate" 
                            value={hotel.payment_percentage} 
                            sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {hotel.provider_name && (
                        <Box>
                          <Typography variant="caption" display="block">
                            {hotel.provider_name}
                          </Typography>
                          {hotel.provider_contact && (
                            <Typography variant="caption" color="text.secondary">
                              {hotel.provider_contact}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(hotel)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(hotel)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(hotel.id)}
                          >
                            <Delete />
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

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {formData.id ? 'Edit Hotel' : 'Tambah Hotel Baru'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Autocomplete
                value={packages.find(p => p.id === formData.package_id) || null}
                onChange={(e, newValue) => setFormData({ ...formData, package_id: newValue?.id || '' })}
                options={packages}
                getOptionLabel={(option) => `${option.code} - ${option.name}`}
                renderInput={(params) => (
                  <TextField {...params} label="Paket Umroh" required />
                )}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Nama Hotel"
                value={formData.hotel_name}
                onChange={(e) => setFormData({ ...formData, hotel_name: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Kota"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Check In"
                value={formData.check_in_date}
                onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Check Out"
                value={formData.check_out_date}
                onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Rooms Quad"
                value={formData.rooms_quad}
                onChange={(e) => setFormData({ ...formData, rooms_quad: parseInt(e.target.value) || 0 })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Rooms Double"
                value={formData.rooms_double}
                onChange={(e) => setFormData({ ...formData, rooms_double: parseInt(e.target.value) || 0 })}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Rooms Triple"
                value={formData.rooms_triple}
                onChange={(e) => setFormData({ ...formData, rooms_triple: parseInt(e.target.value) || 0 })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Provider Name"
                value={formData.provider_name}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Provider Contact"
                value={formData.provider_contact}
                onChange={(e) => setFormData({ ...formData, provider_contact: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Total Amount"
                value={formData.payment_amount}
                onChange={(e) => setFormData({ ...formData, payment_amount: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={formData.meal_type}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value })}
                  label="Meal Type"
                >
                  <MenuItem value="no_meals">No Meals</MenuItem>
                  <MenuItem value="international_fullboard">International Fullboard</MenuItem>
                  <MenuItem value="asia">Asia</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {formData.id ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        {selectedHotel && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{selectedHotel.hotel?.hotel_name}</Typography>
                <Chip 
                  label={selectedHotel.hotel?.city} 
                  icon={<LocationCity />}
                  color="primary"
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 2 }}>
                <Tab label="Information" />
                <Tab label="Documents" />
                <Tab label="Payments" />
              </Tabs>

              {currentTab === 0 && (
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Package"
                          secondary={`${selectedHotel.hotel?.package_code} - ${selectedHotel.hotel?.package_name}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Check In/Out"
                          secondary={`${new Date(selectedHotel.hotel?.check_in_date).toLocaleDateString('id-ID')} - ${new Date(selectedHotel.hotel?.check_out_date).toLocaleDateString('id-ID')} (${selectedHotel.hotel?.total_nights} nights)`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Room Configuration"
                          secondary={
                            <Box>
                              {selectedHotel.hotel?.rooms_quad > 0 && `Quad: ${selectedHotel.hotel.rooms_quad} `}
                              {selectedHotel.hotel?.rooms_double > 0 && `Double: ${selectedHotel.hotel.rooms_double} `}
                              {selectedHotel.hotel?.rooms_triple > 0 && `Triple: ${selectedHotel.hotel.rooms_triple} `}
                              (Total: {selectedHotel.hotel?.total_rooms})
                            </Box>
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <List>
                      <ListItem>
                        <ListItemText 
                          primary="Provider"
                          secondary={`${selectedHotel.hotel?.provider_name || '-'} ${selectedHotel.hotel?.provider_contact ? `(${selectedHotel.hotel.provider_contact})` : ''}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Meal Type"
                          secondary={getMealTypeLabel(selectedHotel.hotel?.meal_type)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Visa Approval"
                          secondary={
                            <Chip 
                              label={selectedHotel.hotel?.visa_approval_status}
                              size="small"
                              color={getVisaStatusColor(selectedHotel.hotel?.visa_approval_status)}
                            />
                          }
                        />
                      </ListItem>
                    </List>
                  </Grid>
                  {selectedHotel.hotel?.notes && (
                    <Grid item xs={12}>
                      <Alert severity="info" icon={<Info />}>
                        {selectedHotel.hotel.notes}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              )}

              {currentTab === 1 && (
                <Box>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    component="label"
                    sx={{ mb: 2 }}
                  >
                    Upload Document
                    <input
                      type="file"
                      hidden
                      onChange={(e) => handleFileUpload(selectedHotel.hotel.id, e.target.files[0])}
                    />
                  </Button>
                  <List>
                    {selectedHotel.documents?.map((doc) => (
                      <ListItem key={doc.id}>
                        <AttachFile sx={{ mr: 2 }} />
                        <ListItemText
                          primary={doc.document_name}
                          secondary={`${doc.document_type} - ${new Date(doc.uploaded_at).toLocaleDateString('id-ID')}`}
                        />
                        <ListItemSecondaryAction>
                          <Button size="small" href={`/${doc.document_url}`} target="_blank">
                            View
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {currentTab === 2 && (
                <Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">
                      Total: {formatCurrency(selectedHotel.hotel?.payment_amount || 0)}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Paid: {formatCurrency(selectedHotel.hotel?.paid_amount || 0)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedHotel.hotel?.payment_percentage || 0} 
                      sx={{ mt: 1, height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <List>
                    {selectedHotel.payments?.map((payment) => (
                      <ListItem key={payment.id}>
                        <ListItemText
                          primary={formatCurrency(payment.amount)}
                          secondary={`${new Date(payment.payment_date).toLocaleDateString('id-ID')} - ${payment.payment_method || 'Cash'}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HotelPage;