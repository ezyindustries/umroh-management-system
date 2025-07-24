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
  InputAdornment,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Divider,
  Badge,
  LinearProgress,
  Menu,
  MenuItem,
  Tooltip,
  Skeleton,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  WhatsApp,
  Phone,
  Email,
  Search,
  FilterList,
  MoreVert,
  TrendingUp,
  PersonAdd,
  AttachMoney,
  Campaign,
  Timeline,
  Assignment,
  CheckCircle,
  RadioButtonUnchecked,
  AccessTime,
  StarBorder,
  Star,
  Send,
  Refresh,
  CalendarToday,
  Groups,
  TrendingDown
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { toast } from 'react-hot-toast';
import ModernStatCard from '../components/ModernStatCard';
import { marketingAPI } from '../services/api';

const MarketingPage = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch statistics
  const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useQuery(
    'marketingStatistics',
    marketingAPI.getStatistics,
    {
      refetchInterval: 30000 // Refresh every 30 seconds
    }
  );

  // Fetch customers
  const { data: customers, isLoading: customersLoading, refetch: refetchCustomers } = useQuery(
    ['marketingCustomers', selectedStage, searchQuery],
    () => marketingAPI.getCustomers({
      pipeline_stage: selectedStage === 'all' ? undefined : selectedStage,
      search: searchQuery
    }),
    {
      keepPreviousData: true
    }
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, customer) => {
    setAnchorEl(event.currentTarget);
    setSelectedCustomer(customer);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCustomer(null);
  };

  const handleWhatsAppClick = (phoneNumber) => {
    const waNumber = phoneNumber.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${waNumber}`;
    window.open(waLink, '_blank');
  };

  const handleStageChange = async (customerId, newStage) => {
    try {
      await marketingAPI.updateCustomerStage(customerId, { stage: newStage });
      toast.success(`Status berhasil diubah ke ${newStage}`);
      refetchCustomers();
      refetchStats();
    } catch (error) {
      toast.error('Gagal mengubah status');
    }
  };

  const getStageColor = (stage) => {
    switch(stage) {
      case 'leads': return '#3B82F6';
      case 'interest': return '#F59E0B';
      case 'booked': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return <Star sx={{ color: '#F59E0B' }} />;
      case 'medium': return <StarBorder sx={{ color: '#F59E0B' }} />;
      default: return null;
    }
  };

  const formatPhoneNumber = (phone) => {
    // Format Indonesian phone number
    if (phone.startsWith('0')) {
      return '+62' + phone.substring(1);
    }
    return phone.startsWith('+') ? phone : '+' + phone;
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
              background: 'linear-gradient(135deg, #EC4899 0%, #F472B6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 1
            }}
          >
            Marketing Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola leads, customer journey, dan WhatsApp marketing
          </Typography>
        </Box>

        {/* Detailed Statistics Cards */}
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
            {/* Yearly Leads */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Leads Tahun Ini"
                value={statistics.yearly?.leads || 0}
                subtitle="Total tahun ini"
                icon={<Groups />}
                gradientColors={['#3B82F6', '#60A5FA']}
              />
            </Grid>

            {/* Monthly Leads */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Leads Bulan Ini"
                value={statistics.monthly?.leads || 0}
                subtitle="Total bulan ini"
                icon={<PersonAdd />}
                gradientColors={['#8B5CF6', '#A78BFA']}
              />
            </Grid>

            {/* Today Leads */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Leads Hari Ini"
                value={statistics.daily?.today?.leads || 0}
                subtitle="Hari ini"
                icon={<CalendarToday />}
                gradientColors={['#EC4899', '#F472B6']}
              />
            </Grid>

            {/* Yesterday Leads */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Leads Kemarin"
                value={statistics.daily?.yesterday?.leads || 0}
                subtitle="Kemarin"
                icon={<AccessTime />}
                gradientColors={['#F59E0B', '#FCD34D']}
              />
            </Grid>

            {/* Monthly Closings */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Closing Bulan Ini"
                value={statistics.monthly?.closings || 0}
                subtitle="Total closing"
                icon={<CheckCircle />}
                gradientColors={['#10B981', '#34D399']}
              />
            </Grid>

            {/* Today Closings */}
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <ModernStatCard
                title="Closing Hari Ini"
                value={statistics.daily?.today?.closings || 0}
                subtitle="Hari ini"
                icon={<TrendingUp />}
                gradientColors={['#10B981', '#34D399']}
              />
            </Grid>
          </Grid>
        ) : null}

        {/* Pipeline Overview */}
        <Card sx={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7))',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          borderRadius: 2,
          mb: 4,
          overflow: 'visible'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Sales Pipeline Overview
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Conversion Rate:
                </Typography>
                <Chip
                  label={`${statistics?.conversionRate || 0}%`}
                  color="success"
                  size="small"
                  icon={statistics?.conversionRate > 15 ? <TrendingUp /> : <TrendingDown />}
                />
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              {statistics?.pipeline && (
                <>
                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: alpha('#3B82F6', 0.1),
                        border: '1px solid',
                        borderColor: alpha('#3B82F6', 0.3),
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 10px 30px ${alpha('#3B82F6', 0.3)}`
                        }
                      }}
                      onClick={() => setSelectedStage('leads')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, #3B82F6, #60A5FA)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            mr: 2
                          }}
                        >
                          <PersonAdd />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {statistics.pipeline.leads}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Leads
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: alpha('#F59E0B', 0.1),
                        border: '1px solid',
                        borderColor: alpha('#F59E0B', 0.3),
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 10px 30px ${alpha('#F59E0B', 0.3)}`
                        }
                      }}
                      onClick={() => setSelectedStage('interest')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, #F59E0B, #FCD34D)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            mr: 2
                          }}
                        >
                          <StarBorder />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {statistics.pipeline.interest}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Interest
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: alpha('#10B981', 0.1),
                        border: '1px solid',
                        borderColor: alpha('#10B981', 0.3),
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: `0 10px 30px ${alpha('#10B981', 0.3)}`
                        }
                      }}
                      onClick={() => setSelectedStage('booked')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, #10B981, #34D399)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            mr: 2
                          }}
                        >
                          <CheckCircle />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {statistics.pipeline.booked}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Booked
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                </>
              )}
            </Grid>
          </CardContent>
        </Card>

        {/* Customer Management */}
        <Card sx={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.7))',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          borderRadius: 2
        }}>
          <CardContent>
            {/* Search and Filter */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Cari nama atau nomor telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  flex: 1,
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    background: alpha(theme.palette.background.paper, 0.5),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    '& fieldset': {
                      borderColor: alpha(theme.palette.divider, 0.2),
                    },
                    '&:hover fieldset': {
                      borderColor: alpha('#EC4899', 0.5),
                    }
                  }
                }}
              />
              <Button
                variant={selectedStage === 'all' ? 'contained' : 'outlined'}
                onClick={() => setSelectedStage('all')}
                sx={{
                  background: selectedStage === 'all' ? 'linear-gradient(135deg, #EC4899, #F472B6)' : 'transparent',
                  borderColor: alpha(theme.palette.divider, 0.2),
                  '&:hover': {
                    borderColor: alpha('#EC4899', 0.5),
                    background: selectedStage === 'all' ? 'linear-gradient(135deg, #EC4899, #F472B6)' : alpha('#EC4899', 0.1)
                  }
                }}
              >
                Semua ({statistics?.pipeline?.leads + statistics?.pipeline?.interest + statistics?.pipeline?.booked || 0})
              </Button>
              <Button
                variant={selectedStage === 'leads' ? 'contained' : 'outlined'}
                onClick={() => setSelectedStage('leads')}
                sx={{
                  borderColor: alpha('#3B82F6', 0.5),
                  color: '#3B82F6',
                  '&:hover': {
                    background: alpha('#3B82F6', 0.1)
                  }
                }}
              >
                Leads ({statistics?.pipeline?.leads || 0})
              </Button>
              <Button
                variant={selectedStage === 'interest' ? 'contained' : 'outlined'}
                onClick={() => setSelectedStage('interest')}
                sx={{
                  borderColor: alpha('#F59E0B', 0.5),
                  color: '#F59E0B',
                  '&:hover': {
                    background: alpha('#F59E0B', 0.1)
                  }
                }}
              >
                Interest ({statistics?.pipeline?.interest || 0})
              </Button>
              <Button
                variant={selectedStage === 'booked' ? 'contained' : 'outlined'}
                onClick={() => setSelectedStage('booked')}
                sx={{
                  borderColor: alpha('#10B981', 0.5),
                  color: '#10B981',
                  '&:hover': {
                    background: alpha('#10B981', 0.1)
                  }
                }}
              >
                Booked ({statistics?.pipeline?.booked || 0})
              </Button>
              <IconButton
                onClick={() => {
                  refetchCustomers();
                  refetchStats();
                }}
                sx={{
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.2),
                  '&:hover': {
                    borderColor: alpha('#EC4899', 0.5),
                    background: alpha('#EC4899', 0.1)
                  }
                }}
              >
                <Refresh />
              </IconButton>
            </Box>

            {/* Customer List */}
            {customersLoading ? (
              <Box>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 2 }} />
                ))}
              </Box>
            ) : customers && customers.length > 0 ? (
              <List>
                {customers.map((customer, index) => (
                  <React.Fragment key={customer.id}>
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        background: alpha(theme.palette.background.paper, 0.3),
                        backdropFilter: 'blur(10px)',
                        border: '1px solid',
                        borderColor: alpha(theme.palette.divider, 0.1),
                        borderLeft: `4px solid ${getStageColor(customer.pipeline_stage)}`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          background: alpha(theme.palette.background.paper, 0.5),
                          borderColor: alpha(getStageColor(customer.pipeline_stage), 0.5),
                          transform: 'translateX(8px)'
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            customer.unread_count > 0 ? (
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '50%',
                                  backgroundColor: '#EF4444',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 10,
                                  fontWeight: 700,
                                  border: '2px solid',
                                  borderColor: theme.palette.background.paper
                                }}
                              >
                                {customer.unread_count}
                              </Box>
                            ) : null
                          }
                        >
                          <Avatar
                            sx={{
                              background: `linear-gradient(135deg, ${getStageColor(customer.pipeline_stage)}, ${alpha(getStageColor(customer.pipeline_stage), 0.7)})`,
                              fontWeight: 600
                            }}
                          >
                            {customer.name ? customer.name.substring(0, 2).toUpperCase() : 'NA'}
                          </Avatar>
                        </Badge>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {customer.name || 'No Name'}
                            </Typography>
                            <Chip
                              label={customer.pipeline_stage}
                              size="small"
                              sx={{
                                backgroundColor: alpha(getStageColor(customer.pipeline_stage), 0.2),
                                color: getStageColor(customer.pipeline_stage),
                                border: '1px solid',
                                borderColor: alpha(getStageColor(customer.pipeline_stage), 0.3),
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />
                            {customer.package_name && (
                              <Chip
                                label={customer.package_name}
                                size="small"
                                variant="outlined"
                                sx={{
                                  borderColor: alpha(theme.palette.divider, 0.3),
                                  fontSize: '0.75rem'
                                }}
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                <WhatsApp sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                                {formatPhoneNumber(customer.phone_number)}
                              </Typography>
                              {customer.pax_count && (
                                <Typography variant="body2" color="text.secondary">
                                  {customer.pax_count} orang
                                </Typography>
                              )}
                              {customer.agreed_price && (
                                <Typography variant="body2" sx={{ color: '#F59E0B', fontWeight: 600 }}>
                                  Rp {(customer.agreed_price / 1000000).toFixed(1)}M
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                <AccessTime sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5 }} />
                                Kontak terakhir: {new Date(customer.last_contact_at).toLocaleDateString('id-ID')}
                              </Typography>
                              {customer.summary && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                  "{customer.summary}"
                                </Typography>
                              )}
                              {customer.last_message_from && (
                                <Chip
                                  label={`Last: ${customer.last_message_from}`}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.7rem',
                                    backgroundColor: customer.last_message_from === 'customer' 
                                      ? alpha('#EF4444', 0.1) 
                                      : alpha('#10B981', 0.1),
                                    color: customer.last_message_from === 'customer' ? '#EF4444' : '#10B981'
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Buka WhatsApp">
                          <IconButton
                            edge="end"
                            onClick={() => handleWhatsAppClick(customer.phone_number)}
                            sx={{
                              background: 'linear-gradient(135deg, #25D366, #128C7E)',
                              color: 'white',
                              mr: 1,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #128C7E, #075E54)',
                              }
                            }}
                          >
                            <WhatsApp />
                          </IconButton>
                        </Tooltip>
                        <IconButton edge="end" onClick={(e) => handleMenuOpen(e, customer)}>
                          <MoreVert />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < customers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Alert severity="info">
                Belum ada customer untuk ditampilkan
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.9))',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.2),
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
            }
          }}
        >
          <MenuItem onClick={() => {
            handleWhatsAppClick(selectedCustomer?.phone_number);
            handleMenuClose();
          }}>
            <WhatsApp sx={{ mr: 2 }} />
            Open WhatsApp
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => {
            handleStageChange(selectedCustomer?.id, 'leads');
            handleMenuClose();
          }}>
            <RadioButtonUnchecked sx={{ mr: 2, color: '#3B82F6' }} />
            Set as Leads
          </MenuItem>
          <MenuItem onClick={() => {
            handleStageChange(selectedCustomer?.id, 'interest');
            handleMenuClose();
          }}>
            <Star sx={{ mr: 2, color: '#F59E0B' }} />
            Set as Interest
          </MenuItem>
          <MenuItem onClick={() => {
            handleStageChange(selectedCustomer?.id, 'booked');
            handleMenuClose();
          }}>
            <CheckCircle sx={{ mr: 2, color: '#10B981' }} />
            Set as Booked
          </MenuItem>
        </Menu>
      </Box>
    </motion.div>
  );
};

export default MarketingPage;