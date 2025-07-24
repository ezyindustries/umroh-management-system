import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tab,
  Tabs,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Alert,
  LinearProgress,
  Skeleton,
  useTheme,
  alpha
} from '@mui/material';
import {
  FlightTakeoff,
  FlightLand,
  Hotel,
  Restaurant,
  EventSeat,
  Accessible,
  CalendarMonth,
  Description,
  Upload,
  Warning,
  Search,
  FilterList,
  People,
  Luggage,
  Visibility,
  Close,
  LocalAirport,
  Edit
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import { format, differenceInDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { groundHandlingAPI } from '../services/api';
import { glassEffect } from '../theme/modernTheme';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const GroundHandlingPage = () => {
  const theme = useTheme();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('week');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialRequestsModal, setSpecialRequestsModal] = useState(false);
  const [currentRequests, setCurrentRequests] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  // Mock data for demonstration
  const mockFlights = [
    {
      id: 1,
      flightCode: 'GA-897',
      departureAirport: 'CGK',
      arrivalAirport: 'JED',
      airline: 'Garuda',
      terminal: 3,
      packageName: 'Paket Umroh Eksekutif',
      groupName: 'Grup Al-Barokah',
      departureTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000).toISOString(),
      totalPassengers: 225,
      totalBaggage: 450,
      status: 'preparing',
      services: {
        loungeCount: 2,
        loungeCompleted: false,
        hotelCount: 1,
        hotelCompleted: true,
        mealCount: 3,
        mealCompleted: false
      },
      specialRequests: [
        { type: 'Wheelchair', description: '15 kursi roda untuk jamaah lansia' },
        { type: 'Special Meal', description: '25 makanan diet khusus' },
        { type: 'Medical', description: '5 jamaah dengan oxygen portable' }
      ]
    },
    {
      id: 2,
      flightCode: 'SV-815',
      departureAirport: 'JED',
      arrivalAirport: 'MED',
      airline: 'Saudia',
      terminal: 1,
      packageName: 'Paket Umroh Reguler',
      groupName: 'Grup Al-Hikmah',
      departureTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
      totalPassengers: 180,
      totalBaggage: 360,
      status: 'scheduled',
      services: {
        loungeCount: 0,
        hotelCount: 2,
        hotelCompleted: false,
        mealCount: 0
      },
      specialRequests: [
        { type: 'Bus Transfer', description: 'Perlu 4 bus dari airport ke hotel' }
      ]
    },
    {
      id: 3,
      flightCode: 'QR-955',
      departureAirport: 'CGK',
      arrivalAirport: 'DOH',
      airline: 'Qatar',
      terminal: 2,
      packageName: 'Paket Umroh VIP',
      groupName: 'Grup Al-Amin',
      departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      arrivalTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000).toISOString(),
      totalPassengers: 45,
      totalBaggage: 90,
      status: 'scheduled',
      services: {
        loungeCount: 0,
        hotelCount: 0,
        mealCount: 0
      },
      specialRequests: []
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFlights(mockFlights);
      setLoading(false);
    }, 1000);
  }, [filterPeriod, filterStatus, filterService]);

  const handleViewRequests = (requests) => {
    setCurrentRequests(requests || []);
    setSpecialRequestsModal(true);
  };

  const calculateDaysUntilEvent = (eventDate) => {
    const now = new Date();
    const event = new Date(eventDate);
    const diffTime = event - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEventLabel = (flight) => {
    const departureDays = calculateDaysUntilEvent(flight.departureTime);
    const arrivalDays = calculateDaysUntilEvent(flight.arrivalTime);
    
    if (Math.abs(departureDays) < Math.abs(arrivalDays)) {
      return {
        type: 'departure',
        days: departureDays,
        date: flight.departureTime,
        label: departureDays === 0 ? 'HARI INI' : `H${departureDays > 0 ? '-' : '+'}${Math.abs(departureDays)}`
      };
    } else {
      return {
        type: 'arrival',
        days: arrivalDays,
        date: flight.arrivalTime,
        label: arrivalDays === 0 ? 'HARI INI' : `H${arrivalDays > 0 ? '-' : '+'}${Math.abs(arrivalDays)}`
      };
    }
  };

  const getServiceColor = (isCompleted) => {
    return isCompleted ? '#10B981' : '#EF4444';
  };

  const FlightCard = ({ flight }) => {
    const eventInfo = getEventLabel(flight);
    const isUrgent = Math.abs(eventInfo.days) <= 2;

    return (
      <MotionCard
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        sx={{
          ...glassEffect,
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
          p: 1.5,
          height: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: 4,
            height: '100%',
            backgroundColor: isUrgent ? '#EF4444' : '#3B82F6',
          }
        }}
      >
        {/* Header with Flight Info and Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} color={isUrgent ? 'error.main' : 'primary.main'}>
              {flight.flightCode}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
              <Chip label={`${flight.departureAirport}-${flight.arrivalAirport}`} size="small" />
              <Chip label={flight.airline} size="small" />
              <Chip label={`T${flight.terminal}`} size="small" />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip 
              label={eventInfo.label} 
              size="small" 
              color={isUrgent ? 'error' : 'primary'}
              sx={{ fontWeight: 600 }}
            />
            <Chip 
              label={flight.status} 
              size="small" 
              variant="outlined"
              color={flight.status === 'completed' ? 'success' : 'warning'}
            />
          </Box>
        </Box>

        {/* Nearest Event Alert */}
        {isUrgent && (
          <Alert 
            severity="warning" 
            icon={<Warning fontSize="small" />}
            sx={{ 
              mb: 1, 
              py: 0.5,
              '& .MuiAlert-message': { width: '100%' }
            }}
          >
            <Box>
              <Typography variant="caption" fontWeight={600}>
                {eventInfo.type === 'departure' ? 'KEBERANGKATAN' : 'KEDATANGAN'} {eventInfo.label}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {format(new Date(eventInfo.date), 'dd MMM yyyy, HH:mm', { locale: id })}
              </Typography>
            </Box>
          </Alert>
        )}

        {/* Package Info */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {flight.packageName} • {flight.groupName}
        </Typography>

        {/* Key Metrics Grid */}
        <Grid container spacing={1} sx={{ mb: 1.5 }}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <People sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">PAX</Typography>
                <Typography variant="subtitle2" fontWeight={600}>{flight.totalPassengers}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Luggage sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Bagasi</Typography>
                <Typography variant="subtitle2" fontWeight={600}>{flight.totalBaggage} pcs</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Service Indicators */}
        {(flight.services?.loungeCount > 0 || 
          flight.services?.hotelCount > 0 || 
          flight.services?.mealCount > 0 || 
          flight.specialRequests?.length > 0) && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
            {flight.services?.loungeCount > 0 && (
              <Chip
                icon={<EventSeat sx={{ fontSize: 16 }} />}
                label={`${flight.services.loungeCount} Lounge`}
                size="small"
                sx={{ 
                  backgroundColor: alpha(getServiceColor(flight.services.loungeCompleted), 0.1),
                  color: getServiceColor(flight.services.loungeCompleted),
                  borderColor: getServiceColor(flight.services.loungeCompleted)
                }}
                variant="outlined"
              />
            )}
            {flight.services?.hotelCount > 0 && (
              <Chip
                icon={<Hotel sx={{ fontSize: 16 }} />}
                label={`${flight.services.hotelCount} Hotel`}
                size="small"
                sx={{ 
                  backgroundColor: alpha(getServiceColor(flight.services.hotelCompleted), 0.1),
                  color: getServiceColor(flight.services.hotelCompleted),
                  borderColor: getServiceColor(flight.services.hotelCompleted)
                }}
                variant="outlined"
              />
            )}
            {flight.services?.mealCount > 0 && (
              <Chip
                icon={<Restaurant sx={{ fontSize: 16 }} />}
                label={`${flight.services.mealCount} Meal`}
                size="small"
                sx={{ 
                  backgroundColor: alpha(getServiceColor(flight.services.mealCompleted), 0.1),
                  color: getServiceColor(flight.services.mealCompleted),
                  borderColor: getServiceColor(flight.services.mealCompleted)
                }}
                variant="outlined"
              />
            )}
            {flight.specialRequests?.length > 0 && (
              <Chip
                icon={<Accessible sx={{ fontSize: 16 }} />}
                label={`${flight.specialRequests.length} Request`}
                size="small"
                color="warning"
                variant="outlined"
                onClick={() => handleViewRequests(flight.specialRequests)}
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Box>
        )}

        {/* No Services Message */}
        {!flight.services?.loungeCount && 
         !flight.services?.hotelCount && 
         !flight.services?.mealCount && 
         !flight.specialRequests?.length && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Tidak ada layanan tambahan yang diminta
          </Typography>
        )}

        {/* Action Button */}
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<Visibility />}
          onClick={() => setSelectedFlight(flight)}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
            '&:hover': {
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
            }
          }}
        >
          View Details
        </Button>
      </MotionCard>
    );
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ground Handling Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola tugas dan kewajiban tim ground handling untuk setiap penerbangan
        </Typography>
      </Box>


      {/* Filter Card */}
      <Card sx={{ ...glassEffect, mb: 3, p: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder="Cari flight code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Periode"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <MenuItem value="today">Hari Ini</MenuItem>
              <MenuItem value="week">Minggu Ini</MenuItem>
              <MenuItem value="month">Bulan Ini</MenuItem>
              <MenuItem value="all">Semua</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="all">Semua Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              size="small"
              label="Layanan"
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
            >
              <MenuItem value="all">Semua Layanan</MenuItem>
              <MenuItem value="lounge">Lounge</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="meal">Meal</MenuItem>
              <MenuItem value="special">Special Request</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<CalendarMonth />}
                sx={{ textTransform: 'none' }}
              >
                Calendar View
              </Button>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                sx={{ textTransform: 'none' }}
              >
                Upload Docs
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>

      {/* Flight Cards Grid */}
      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={2}>
          {flights
            .filter(flight => 
              flight.flightCode.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((flight) => (
              <Grid item xs={12} md={6} lg={3} key={flight.id}>
                <FlightCard flight={flight} />
              </Grid>
            ))}
        </Grid>
      )}

      {/* Special Requests Modal */}
      <Dialog 
        open={specialRequestsModal} 
        onClose={() => setSpecialRequestsModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: glassEffect
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Special Requests
            </Typography>
            <IconButton onClick={() => setSpecialRequestsModal(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {currentRequests.map((request, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={request.type}
                  secondary={request.description}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSpecialRequestsModal(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flight Details Modal */}
      {selectedFlight && (
        <Dialog
          open={Boolean(selectedFlight)}
          onClose={() => setSelectedFlight(null)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: glassEffect
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={600}>
                Flight Details - {selectedFlight.flightCode}
              </Typography>
              <IconButton onClick={() => setSelectedFlight(null)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
              <Tab label="Schedule" />
              <Tab label="Reservations" />
              <Tab label="Requests" />
              <Tab label="Documents" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Flight Schedule</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <FlightTakeoff color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Departure</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {format(new Date(selectedFlight.departureTime), 'dd MMM yyyy, HH:mm', { locale: id })}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <FlightLand color="primary" />
                      <Box>
                        <Typography variant="caption" color="text.secondary">Arrival</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {format(new Date(selectedFlight.arrivalTime), 'dd MMM yyyy, HH:mm', { locale: id })}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Reservations</Typography>
                <Typography variant="body2" color="text.secondary">
                  Reservation details and proof documents will be shown here
                </Typography>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>Special Requests</Typography>
                <List>
                  {selectedFlight.specialRequests?.map((request, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={request.type}
                        secondary={request.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
            
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>Documents</Typography>
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  sx={{ textTransform: 'none' }}
                >
                  Upload Document
                </Button>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedFlight(null)}>Close</Button>
            <Button variant="contained" startIcon={<Edit />}>
              Edit Details
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </MotionBox>
  );
};

export default GroundHandlingPage;