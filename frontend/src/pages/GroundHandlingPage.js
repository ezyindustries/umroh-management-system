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
  InputLabel,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Badge,
  LinearProgress,
  Tooltip,
  Skeleton,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Collapse,
  Avatar,
  AvatarGroup,
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
  CheckCircle,
  Schedule,
  LocationOn,
  Phone,
  People,
  Luggage,
  MoreVert,
  Add,
  Edit,
  Delete,
  Visibility,
  ExpandMore,
  ExpandLess,
  Assignment,
  AttachFile,
  LocalAirport,
  DirectionsBus,
  Timer,
  EventAvailable,
  PendingActions,
  TaskAlt,
  Cancel,
  Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import { format, formatDistanceToNow, differenceInDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import ModernStatCard from '../components/ModernStatCard';
import { groundHandlingAPI } from '../services/api';

const GroundHandlingPage = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedHandling, setSelectedHandling] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch statistics
  const { data: statistics, isLoading: statsLoading } = useQuery(
    'groundHandlingStatistics',
    groundHandlingAPI.getStatistics,
    {
      refetchInterval: 60000 // Refresh every minute
    }
  );

  // Fetch upcoming handlings
  const { data: handlings, isLoading: handlingsLoading } = useQuery(
    ['groundHandlings', filterUrgency, searchQuery],
    () => groundHandlingAPI.getUpcoming({
      urgency: filterUrgency === 'all' ? undefined : filterUrgency,
      search: searchQuery
    }),
    {
      keepPreviousData: true
    }
  );

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleExpandCard = (handlingId) => {
    setExpandedCard(expandedCard === handlingId ? null : handlingId);
  };

  const openAddDialog = (type, handling = null) => {
    setDialogType(type);
    setSelectedHandling(handling);
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setSelectedHandling(null);
  };

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'urgent': return '#EF4444';
      case 'soon': return '#F59E0B';
      case 'upcoming': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'scheduled': return '#3B82F6';
      case 'preparing': return '#F59E0B';
      case 'in_progress': return '#8B5CF6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDateTime = (datetime) => {
    return format(parseISO(datetime), "dd MMM yyyy, HH:mm", { locale: id });
  };

  const getDaysUntil = (datetime) => {
    const days = differenceInDays(parseISO(datetime), new Date());
    if (days < 0) return 'Past';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `${days} days`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 1
            }}
          >
            Ground Handling Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola operasional ground handling, reservasi, dan dokumentasi penerbangan
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {statsLoading ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : statistics ? (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Scheduled"
                value={statistics.scheduled_count || 0}
                subtitle="Terjadwal"
                icon={<Schedule />}
                gradientColors={['#3B82F6', '#60A5FA']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Preparing"
                value={statistics.preparing_count || 0}
                subtitle="Persiapan"
                icon={<PendingActions />}
                gradientColors={['#F59E0B', '#FCD34D']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="In Progress"
                value={statistics.in_progress_count || 0}
                subtitle="Berlangsung"
                icon={<FlightTakeoff />}
                gradientColors={['#8B5CF6', '#A78BFA']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Completed"
                value={statistics.completed_count || 0}
                subtitle="Selesai"
                icon={<TaskAlt />}
                gradientColors={['#10B981', '#34D399']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Urgent"
                value={statistics.urgent_count || 0}
                subtitle="H-3 atau kurang"
                icon={<Warning />}
                gradientColors={['#EF4444', '#F87171']}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Soon"
                value={statistics.soon_count || 0}
                subtitle="H-7 atau kurang"
                icon={<Timer />}
                gradientColors={['#EC4899', '#F472B6']}
              />
            </Grid>
          </Grid>
        ) : null}

        {/* Filter and Actions */}
        <Card sx={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7))',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          borderRadius: 2,
          mb: 3,
          overflow: 'visible'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  placeholder="Cari flight code, route, atau paket..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocalAirport />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: 300,
                    '& .MuiOutlinedInput-root': {
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                    }
                  }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    sx={{
                      background: alpha(theme.palette.background.paper, 0.5),
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <MenuItem value="all">Semua</MenuItem>
                    <MenuItem value="urgent">Urgent (H-3)</MenuItem>
                    <MenuItem value="soon">Soon (H-7)</MenuItem>
                    <MenuItem value="upcoming">Upcoming</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<CalendarMonth />}
                  onClick={() => openAddDialog('calendar')}
                  sx={{
                    background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                    }
                  }}
                >
                  View Calendar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => openAddDialog('new')}
                  sx={{
                    background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    }
                  }}
                >
                  New Handling
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Ground Handling Cards */}
        {handlingsLoading ? (
          <Grid container spacing={3}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} key={i}>
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        ) : handlings && handlings.length > 0 ? (
          <Grid container spacing={3}>
            {handlings.map((handling) => (
              <Grid item xs={12} key={handling.id}>
                <Card sx={{
                  background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.1),
                  borderRadius: 2,
                  borderLeft: `4px solid ${getUrgencyColor(handling.urgency_level)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 10px 30px ${alpha(getUrgencyColor(handling.urgency_level), 0.3)}`,
                  }
                }}>
                  <CardContent>
                    {/* Header Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h5" sx={{ fontWeight: 700, color: getUrgencyColor(handling.urgency_level) }}>
                            {handling.flight_code}
                          </Typography>
                          <Chip 
                            label={handling.route} 
                            size="small"
                            sx={{
                              background: alpha(theme.palette.primary.main, 0.2),
                              border: '1px solid',
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                            }}
                          />
                          <Chip 
                            label={handling.airline} 
                            size="small"
                            variant="outlined"
                          />
                          <Chip 
                            label={`Terminal ${handling.terminal}`} 
                            size="small"
                            icon={<LocationOn sx={{ fontSize: 16 }} />}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {handling.package_name} - {handling.group_name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={getDaysUntil(handling.departure_datetime)}
                          size="small"
                          sx={{
                            background: alpha(getUrgencyColor(handling.urgency_level), 0.2),
                            color: getUrgencyColor(handling.urgency_level),
                            border: '1px solid',
                            borderColor: alpha(getUrgencyColor(handling.urgency_level), 0.3),
                            fontWeight: 600,
                          }}
                        />
                        <Chip 
                          label={handling.status}
                          size="small"
                          sx={{
                            background: alpha(getStatusColor(handling.status), 0.2),
                            color: getStatusColor(handling.status),
                            border: '1px solid',
                            borderColor: alpha(getStatusColor(handling.status), 0.3),
                            fontWeight: 600,
                          }}
                        />
                        <IconButton
                          onClick={() => handleExpandCard(handling.id)}
                          sx={{ ml: 1 }}
                        >
                          {expandedCard === handling.id ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Key Information Grid */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlightTakeoff sx={{ color: theme.palette.primary.main }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Departure</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDateTime(handling.departure_datetime)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FlightLand sx={{ color: theme.palette.success.main }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Arrival</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {formatDateTime(handling.arrival_datetime)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <People sx={{ color: theme.palette.info.main }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Total PAX</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {handling.total_pax} orang
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Luggage sx={{ color: theme.palette.warning.main }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Total Baggage</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {handling.total_baggage || 0} pcs
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* PIC Information */}
                    {handling.pic_team && (
                      <Box sx={{ 
                        p: 2, 
                        background: alpha(theme.palette.background.paper, 0.3),
                        borderRadius: 1,
                        mb: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ background: 'linear-gradient(135deg, #3B82F6, #60A5FA)' }}>
                            <Assignment />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">PIC Team</Typography>
                            <Typography variant="body1" fontWeight={600}>{handling.pic_team}</Typography>
                            {handling.pic_phone && (
                              <Typography variant="body2" color="primary.main">
                                <Phone sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                {handling.pic_phone}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Status Indicators */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<EventSeat />}
                        label={`${handling.lounge_count || 0} Lounge`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Hotel />}
                        label={`${handling.hotel_count || 0} Hotel`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Restaurant />}
                        label={`${handling.meal_count || 0} Meal`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        icon={<Accessible />}
                        label={`${handling.request_count || 0} Special Request`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Expanded Details */}
                    <Collapse in={expandedCard === handling.id}>
                      <Box sx={{ mt: 3 }}>
                        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                          <Tab label="Schedule" />
                          <Tab label="Reservations" />
                          <Tab label="Requests" />
                          <Tab label="Documents" />
                        </Tabs>

                        {/* Tab Content */}
                        <Box sx={{ mt: 2 }}>
                          {selectedTab === 0 && (
                            <Box>
                              <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => openAddDialog('schedule', handling)}
                                sx={{ mb: 2 }}
                              >
                                Add Schedule
                              </Button>
                              {/* Schedule timeline would go here */}
                              <Alert severity="info">Schedule timeline akan ditampilkan di sini</Alert>
                            </Box>
                          )}
                          {selectedTab === 1 && (
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={4}>
                                <Button
                                  variant="outlined"
                                  startIcon={<EventSeat />}
                                  onClick={() => openAddDialog('lounge', handling)}
                                  fullWidth
                                  sx={{ mb: 2 }}
                                >
                                  Book Lounge
                                </Button>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Button
                                  variant="outlined"
                                  startIcon={<Hotel />}
                                  onClick={() => openAddDialog('hotel', handling)}
                                  fullWidth
                                  sx={{ mb: 2 }}
                                >
                                  Book Hotel
                                </Button>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Button
                                  variant="outlined"
                                  startIcon={<Restaurant />}
                                  onClick={() => openAddDialog('meal', handling)}
                                  fullWidth
                                  sx={{ mb: 2 }}
                                >
                                  Order Meal
                                </Button>
                              </Grid>
                            </Grid>
                          )}
                          {selectedTab === 2 && (
                            <Box>
                              <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => openAddDialog('request', handling)}
                                sx={{ mb: 2 }}
                              >
                                Add Request
                              </Button>
                              <Alert severity="info">Special requests akan ditampilkan di sini</Alert>
                            </Box>
                          )}
                          {selectedTab === 3 && (
                            <Box>
                              <Button
                                variant="outlined"
                                startIcon={<Upload />}
                                onClick={() => openAddDialog('document', handling)}
                                sx={{ mb: 2 }}
                              >
                                Upload Document
                              </Button>
                              <Alert severity="info">Documents akan ditampilkan di sini</Alert>
                            </Box>
                          )}
                        </Box>

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                          <Button
                            variant="contained"
                            startIcon={<Edit />}
                            sx={{
                              background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #D97706, #F59E0B)',
                              }
                            }}
                          >
                            Edit Details
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<CalendarMonth />}
                            sx={{
                              background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #7C3AED, #9333EA)',
                              }
                            }}
                          >
                            View in Calendar
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<Description />}
                          >
                            Generate Report
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="info">
            Belum ada ground handling yang terjadwal
          </Alert>
        )}

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={closeDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {dialogType === 'new' && 'Add New Ground Handling'}
            {dialogType === 'lounge' && 'Book Lounge'}
            {dialogType === 'hotel' && 'Book Hotel'}
            {dialogType === 'meal' && 'Order Meal Box'}
            {dialogType === 'schedule' && 'Add Schedule'}
            {dialogType === 'request' && 'Add Special Request'}
            {dialogType === 'document' && 'Upload Document'}
            {dialogType === 'calendar' && 'Calendar View'}
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mt: 2 }}>
              Form untuk {dialogType} akan diimplementasikan di sini
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog}>Cancel</Button>
            <Button variant="contained" onClick={closeDialog}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default GroundHandlingPage;