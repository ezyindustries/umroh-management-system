import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  LinearProgress,
  Divider,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Badge
} from '@mui/material';
import {
  FlightTakeoff as FlightIcon,
  Add as AddIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalAirport as AirportIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

const FlightsPage = () => {
  const [pnrList, setPnrList] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog states
  const [openPnrDialog, setOpenPnrDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openJamaahDialog, setOpenJamaahDialog] = useState(false);
  const [selectedPnr, setSelectedPnr] = useState(null);
  const [availableJamaah, setAvailableJamaah] = useState([]);
  
  // Form state
  const [newPnr, setNewPnr] = useState({
    pnr_code: '',
    package_id: '',
    airline: '',
    total_pax: '',
    segments: [
      {
        flight_number: '',
        departure_city: '',
        departure_airport: '',
        departure_date: '',
        departure_time: '',
        arrival_city: '',
        arrival_airport: '',
        arrival_date: '',
        arrival_time: '',
        is_transit: false
      }
    ],
    payment_schedule: [
      {
        payment_type: 'deposit',
        amount: '',
        due_date: '',
        notes: ''
      }
    ]
  });

  const airlines = [
    'Garuda Indonesia',
    'Saudi Airlines',
    'Lion Air',
    'Etihad Airways',
    'Emirates',
    'Qatar Airways',
    'Turkish Airlines'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [pnrRes, packagesRes] = await Promise.all([
        axios.get('/api/flights/pnrs', config),
        axios.get('/api/packages', config)
      ]);
      
      setPnrList(pnrRes.data);
      setPackages(packagesRes.data);
    } catch (error) {
      setError('Gagal memuat data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePnr = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/flights/pnrs', newPnr, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('PNR berhasil dibuat');
      setOpenPnrDialog(false);
      resetForm();
      loadData();
    } catch (error) {
      setError('Gagal membuat PNR');
    }
  };

  const handleViewDetails = async (pnr) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/flights/pnrs/${pnr.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedPnr(response.data);
      setOpenDetailDialog(true);
    } catch (error) {
      setError('Gagal memuat detail PNR');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignJamaah = async (pnrId, packageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/flights/packages/${packageId}/available-jamaah`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableJamaah(response.data);
      setOpenJamaahDialog(true);
    } catch (error) {
      setError('Gagal memuat data jamaah');
    }
  };

  const resetForm = () => {
    setNewPnr({
      pnr_code: '',
      package_id: '',
      airline: '',
      total_pax: '',
      segments: [
        {
          flight_number: '',
          departure_city: '',
          departure_airport: '',
          departure_date: '',
          departure_time: '',
          arrival_city: '',
          arrival_airport: '',
          arrival_date: '',
          arrival_time: '',
          is_transit: false
        }
      ],
      payment_schedule: [
        {
          payment_type: 'deposit',
          amount: '',
          due_date: '',
          notes: ''
        }
      ]
    });
  };

  const addSegment = () => {
    setNewPnr({
      ...newPnr,
      segments: [
        ...newPnr.segments,
        {
          flight_number: '',
          departure_city: '',
          departure_airport: '',
          departure_date: '',
          departure_time: '',
          arrival_city: '',
          arrival_airport: '',
          arrival_date: '',
          arrival_time: '',
          is_transit: false
        }
      ]
    });
  };

  const addPaymentSchedule = () => {
    setNewPnr({
      ...newPnr,
      payment_schedule: [
        ...newPnr.payment_schedule,
        {
          payment_type: 'installment',
          amount: '',
          due_date: '',
          notes: ''
        }
      ]
    });
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'success';
      case 'partial': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ticketed': return 'primary';
      case 'booked': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Manajemen Tiket Penerbangan
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenPnrDialog(true)}
        >
          Buat PNR Baru
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading ? (
        <LinearProgress />
      ) : (
        <Grid container spacing={3}>
          {pnrList.map((pnr) => (
            <Grid item xs={12} md={6} lg={4} key={pnr.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  {/* PNR Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" color="primary">
                        PNR: {pnr.pnr_code}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {pnr.package_name}
                      </Typography>
                    </Box>
                    <Chip 
                      label={pnr.status} 
                      color={getStatusColor(pnr.status)}
                      size="small"
                    />
                  </Box>

                  {/* Flight Info */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <FlightIcon fontSize="small" color="action" />
                      <Typography variant="body2">{pnr.airline}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <AirportIcon fontSize="small" color="action" />
                      <Typography variant="caption" sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {pnr.route}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Passenger Info */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Penumpang: {pnr.filled_pax}/{pnr.total_pax}
                        </Typography>
                      </Box>
                      {pnr.remaining_pax > 0 && (
                        <Chip 
                          label={`${pnr.remaining_pax} kursi tersisa`}
                          size="small"
                          color="warning"
                        />
                      )}
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={(pnr.filled_pax / pnr.total_pax) * 100}
                      sx={{ mt: 1, height: 6, borderRadius: 1 }}
                    />
                  </Box>

                  {/* Payment Info */}
                  <Box mb={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PaymentIcon fontSize="small" color="action" />
                      <Typography variant="body2">Status Pembayaran</Typography>
                    </Box>
                    
                    {pnr.next_payment_date && (
                      <Alert 
                        severity={pnr.days_until_payment < 7 ? "warning" : "info"}
                        sx={{ py: 0.5, px: 1 }}
                      >
                        <Typography variant="caption">
                          Jatuh tempo: {format(new Date(pnr.next_payment_date), 'd MMM yyyy', { locale: idLocale })}
                          {pnr.days_until_payment >= 0 ? (
                            ` (H-${pnr.days_until_payment})`
                          ) : (
                            ` (Terlambat ${Math.abs(pnr.days_until_payment)} hari)`
                          )}
                        </Typography>
                        <Typography variant="caption" display="block">
                          {formatCurrency(pnr.next_payment_amount)}
                        </Typography>
                      </Alert>
                    )}
                    
                    <Box mt={1}>
                      <Typography variant="caption" color="textSecondary">
                        Total: {formatCurrency(pnr.total_amount)}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(pnr.total_paid / pnr.total_amount) * 100}
                        sx={{ mt: 0.5, height: 4, borderRadius: 1 }}
                        color={pnr.total_paid >= pnr.total_amount ? "success" : "primary"}
                      />
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box display="flex" gap={1}>
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => handleViewDetails(pnr)}
                      fullWidth
                    >
                      Details
                    </Button>
                    {pnr.remaining_pax > 0 && (
                      <Button 
                        size="small" 
                        variant="outlined"
                        onClick={() => handleAssignJamaah(pnr.id, pnr.package_id)}
                        fullWidth
                      >
                        Assign Jamaah
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create PNR Dialog */}
      <Dialog 
        open={openPnrDialog} 
        onClose={() => setOpenPnrDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Buat PNR Baru</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Kode PNR"
                  value={newPnr.pnr_code}
                  onChange={(e) => setNewPnr({ ...newPnr, pnr_code: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Paket Umroh</InputLabel>
                  <Select
                    value={newPnr.package_id}
                    onChange={(e) => setNewPnr({ ...newPnr, package_id: e.target.value })}
                    label="Paket Umroh"
                  >
                    {packages.map(pkg => (
                      <MenuItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - {format(new Date(pkg.departure_date), 'd MMM yyyy')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Maskapai</InputLabel>
                  <Select
                    value={newPnr.airline}
                    onChange={(e) => setNewPnr({ ...newPnr, airline: e.target.value })}
                    label="Maskapai"
                  >
                    {airlines.map(airline => (
                      <MenuItem key={airline} value={airline}>
                        {airline}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Kursi"
                  type="number"
                  value={newPnr.total_pax}
                  onChange={(e) => setNewPnr({ ...newPnr, total_pax: e.target.value })}
                />
              </Grid>
            </Grid>

            {/* Flight Segments */}
            <Box mt={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Rute Penerbangan</Typography>
                <Button size="small" onClick={addSegment}>
                  Tambah Segment
                </Button>
              </Box>
              
              {newPnr.segments.map((segment, index) => (
                <Box key={index} mb={2} p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="No. Penerbangan"
                        value={segment.flight_number}
                        onChange={(e) => {
                          const segments = [...newPnr.segments];
                          segments[index].flight_number = e.target.value;
                          setNewPnr({ ...newPnr, segments });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Kota Keberangkatan"
                        value={segment.departure_city}
                        onChange={(e) => {
                          const segments = [...newPnr.segments];
                          segments[index].departure_city = e.target.value;
                          setNewPnr({ ...newPnr, segments });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Bandara (Kode)"
                        value={segment.departure_airport}
                        onChange={(e) => {
                          const segments = [...newPnr.segments];
                          segments[index].departure_airport = e.target.value;
                          setNewPnr({ ...newPnr, segments });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Tanggal Berangkat"
                        type="date"
                        value={segment.departure_date}
                        onChange={(e) => {
                          const segments = [...newPnr.segments];
                          segments[index].departure_date = e.target.value;
                          setNewPnr({ ...newPnr, segments });
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Jam Berangkat"
                        type="time"
                        value={segment.departure_time}
                        onChange={(e) => {
                          const segments = [...newPnr.segments];
                          segments[index].departure_time = e.target.value;
                          setNewPnr({ ...newPnr, segments });
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Kota Tujuan"
                        value={segment.arrival_city}
                        onChange={(e) => {
                          const segments = [...newPnr.segments];
                          segments[index].arrival_city = e.target.value;
                          setNewPnr({ ...newPnr, segments });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Bandara (Kode)"
                        value={segment.arrival_airport}
                        onChange={(e) => {
                          const segments = [...newPnr.segments];
                          segments[index].arrival_airport = e.target.value;
                          setNewPnr({ ...newPnr, segments });
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>

            {/* Payment Schedule */}
            <Box mt={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Jadwal Pembayaran</Typography>
                <Button size="small" onClick={addPaymentSchedule}>
                  Tambah Termin
                </Button>
              </Box>
              
              {newPnr.payment_schedule.map((payment, index) => (
                <Box key={index} mb={2} p={2} sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Tipe</InputLabel>
                        <Select
                          value={payment.payment_type}
                          onChange={(e) => {
                            const schedule = [...newPnr.payment_schedule];
                            schedule[index].payment_type = e.target.value;
                            setNewPnr({ ...newPnr, payment_schedule: schedule });
                          }}
                          label="Tipe"
                        >
                          <MenuItem value="deposit">DP</MenuItem>
                          <MenuItem value="installment">Termin</MenuItem>
                          <MenuItem value="final">Pelunasan</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Jumlah"
                        type="number"
                        value={payment.amount}
                        onChange={(e) => {
                          const schedule = [...newPnr.payment_schedule];
                          schedule[index].amount = e.target.value;
                          setNewPnr({ ...newPnr, payment_schedule: schedule });
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Jatuh Tempo"
                        type="date"
                        value={payment.due_date}
                        onChange={(e) => {
                          const schedule = [...newPnr.payment_schedule];
                          schedule[index].due_date = e.target.value;
                          setNewPnr({ ...newPnr, payment_schedule: schedule });
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Keterangan"
                        value={payment.notes}
                        onChange={(e) => {
                          const schedule = [...newPnr.payment_schedule];
                          schedule[index].notes = e.target.value;
                          setNewPnr({ ...newPnr, payment_schedule: schedule });
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPnrDialog(false)}>Batal</Button>
          <Button onClick={handleCreatePnr} variant="contained">
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* PNR Detail Dialog */}
      <Dialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Detail PNR: {selectedPnr?.pnr_code}
            </Typography>
            <IconButton onClick={() => setOpenDetailDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPnr && (
            <Box>
              {/* Flight Segments */}
              <Typography variant="h6" gutterBottom>Rute Penerbangan</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>No. Penerbangan</TableCell>
                      <TableCell>Dari</TableCell>
                      <TableCell>Ke</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Waktu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPnr.segments?.map((segment, index) => (
                      <TableRow key={index}>
                        <TableCell>{segment.flight_number}</TableCell>
                        <TableCell>
                          {segment.departure_city} ({segment.departure_airport})
                        </TableCell>
                        <TableCell>
                          {segment.arrival_city} ({segment.arrival_airport})
                        </TableCell>
                        <TableCell>
                          {format(new Date(segment.departure_date), 'd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          {segment.departure_time} - {segment.arrival_time}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Payment Schedule */}
              <Typography variant="h6" gutterBottom>Jadwal Pembayaran</Typography>
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tipe</TableCell>
                      <TableCell>Jumlah</TableCell>
                      <TableCell>Jatuh Tempo</TableCell>
                      <TableCell>Dibayar</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Keterangan</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPnr.payment_schedule?.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Chip 
                            label={payment.payment_type} 
                            size="small"
                            color={payment.payment_type === 'deposit' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          {format(new Date(payment.due_date), 'd MMM yyyy')}
                        </TableCell>
                        <TableCell>{formatCurrency(payment.paid_amount || 0)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={payment.payment_status} 
                            size="small"
                            color={getPaymentStatusColor(payment.payment_status)}
                          />
                        </TableCell>
                        <TableCell>{payment.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Assigned Jamaah */}
              <Typography variant="h6" gutterBottom>
                Daftar Jamaah ({selectedPnr.assigned_jamaah?.length || 0}/{selectedPnr.total_pax})
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nama</TableCell>
                      <TableCell>NIK</TableCell>
                      <TableCell>No. Paspor</TableCell>
                      <TableCell>No. Kursi</TableCell>
                      <TableCell>No. Tiket</TableCell>
                      <TableCell>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPnr.assigned_jamaah?.map((jamaah) => (
                      <TableRow key={jamaah.id}>
                        <TableCell>{jamaah.name}</TableCell>
                        <TableCell>{jamaah.nik}</TableCell>
                        <TableCell>{jamaah.passport_number}</TableCell>
                        <TableCell>{jamaah.seat_number || '-'}</TableCell>
                        <TableCell>{jamaah.ticket_number || '-'}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FlightsPage;