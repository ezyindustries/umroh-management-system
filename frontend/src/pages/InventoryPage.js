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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Warning as WarningIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  AttachMoney as AttachMoneyIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const InventoryPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [slayerColors, setSlayerColors] = useState([]);
  const [earphoneMappings, setEarphoneMappings] = useState([]);
  const [salesRecap, setSalesRecap] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [openAddItem, setOpenAddItem] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openSlayerColor, setOpenSlayerColor] = useState(false);
  const [openEarphoneMapping, setOpenEarphoneMapping] = useState(false);

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    unit: 'pcs',
    minimum_stock: 50,
    last_purchase_price: '',
    selling_price: '',
    description: ''
  });

  const [newTransaction, setNewTransaction] = useState({
    item_id: '',
    transaction_type: '',
    quantity: '',
    reference_type: '',
    reference_id: '',
    price_per_unit: '',
    notes: ''
  });

  const [newSlayerColor, setNewSlayerColor] = useState({
    color_name: '',
    color_code: '#000000',
    current_stock: 0
  });

  const [newEarphoneMapping, setNewEarphoneMapping] = useState({
    group_id: '',
    quantity: '',
    serial_numbers: '',
    distribution_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const categories = [
    { value: 'slayer', label: 'Slayer' },
    { value: 'tas_serut', label: 'Tas Serut' },
    { value: 'tas_tenteng', label: 'Tas Tenteng' },
    { value: 'koper', label: 'Koper' },
    { value: 'seragam', label: 'Seragam' },
    { value: 'mukenah', label: 'Mukenah' },
    { value: 'ihram', label: 'Ihram' },
    { value: 'earphone', label: 'Earphone' },
    { value: 'other', label: 'Lainnya' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [itemsRes, alertsRes, transRes, slayerRes, earphoneRes, salesRes, groupsRes] = await Promise.all([
        axios.get('/api/inventory/items', config),
        axios.get('/api/inventory/alerts', config),
        axios.get('/api/inventory/transactions?limit=50', config),
        axios.get('/api/inventory/slayer-colors', config),
        axios.get('/api/inventory/earphone-mappings', config),
        axios.get('/api/inventory/sales-recap', config),
        axios.get('/api/groups', config).catch(() => ({ data: [] }))
      ]);

      setItems(itemsRes.data);
      setAlerts(alertsRes.data);
      setTransactions(transRes.data);
      setSlayerColors(slayerRes.data);
      setEarphoneMappings(earphoneRes.data);
      setSalesRecap(salesRes.data);
      setGroups(groupsRes.data || []);
    } catch (error) {
      setError('Gagal memuat data inventory');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/inventory/items', newItem, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Item berhasil ditambahkan');
      setOpenAddItem(false);
      setNewItem({
        name: '',
        category: '',
        unit: 'pcs',
        minimum_stock: 50,
        last_purchase_price: '',
        selling_price: '',
        description: ''
      });
      loadData();
    } catch (error) {
      setError('Gagal menambahkan item');
    }
  };

  const handleRecordTransaction = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/inventory/transactions', newTransaction, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Transaksi berhasil dicatat');
      setOpenTransaction(false);
      setNewTransaction({
        item_id: '',
        transaction_type: '',
        quantity: '',
        reference_type: '',
        reference_id: '',
        price_per_unit: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      setError(error.response?.data?.error || 'Gagal mencatat transaksi');
    }
  };

  const handleAddSlayerColor = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/inventory/slayer-colors', newSlayerColor, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Warna slayer berhasil ditambahkan');
      setOpenSlayerColor(false);
      setNewSlayerColor({
        color_name: '',
        color_code: '#000000',
        current_stock: 0
      });
      loadData();
    } catch (error) {
      setError('Gagal menambahkan warna slayer');
    }
  };

  const handleMapEarphone = async () => {
    try {
      const token = localStorage.getItem('token');
      const serialNumbers = newEarphoneMapping.serial_numbers 
        ? newEarphoneMapping.serial_numbers.split(',').map(s => s.trim())
        : [];
      
      await axios.post('/api/inventory/earphone-mappings', {
        ...newEarphoneMapping,
        serial_numbers: serialNumbers
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Earphone berhasil dipetakan ke grup');
      setOpenEarphoneMapping(false);
      setNewEarphoneMapping({
        group_id: '',
        quantity: '',
        serial_numbers: '',
        distribution_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadData();
    } catch (error) {
      setError('Gagal memetakan earphone');
    }
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      default: return 'success';
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'in': return 'success';
      case 'out': return 'error';
      case 'adjustment': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manajemen Perlengkapan
      </Typography>

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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Items
                  </Typography>
                  <Typography variant="h4">
                    {items.length}
                  </Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Stok Kritis
                  </Typography>
                  <Typography variant="h4" color="error">
                    {alerts.length}
                  </Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Transaksi Hari Ini
                  </Typography>
                  <Typography variant="h4">
                    {transactions.filter(t => 
                      new Date(t.transaction_date).toDateString() === new Date().toDateString()
                    ).length}
                  </Typography>
                </Box>
                <LocalShippingIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Penjualan
                  </Typography>
                  <Typography variant="h5">
                    Rp {salesRecap.reduce((sum, item) => sum + parseFloat(item.total_revenue || 0), 0).toLocaleString('id-ID')}
                  </Typography>
                </Box>
                <AttachMoneyIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ⚠️ Peringatan Stok Rendah
          </Typography>
          {alerts.map(alert => (
            <Typography key={alert.id} variant="body2">
              • {alert.name} - Stok: {alert.current_stock} pcs (Minimum: {alert.minimum_stock} pcs)
            </Typography>
          ))}
        </Alert>
      )}

      {/* Main Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Inventory" />
          <Tab label="Transaksi" />
          <Tab label="Slayer" />
          <Tab label="Earphone" />
          <Tab label="Checklist" />
          <Tab label="Recap Penjualan" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Daftar Perlengkapan</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddItem(true)}
            >
              Tambah Item
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nama</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell align="right">Stok</TableCell>
                  <TableCell align="right">Min. Stok</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Harga Jual</TableCell>
                  <TableCell>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{categories.find(c => c.value === item.category)?.label}</TableCell>
                    <TableCell align="right">{item.current_stock} {item.unit}</TableCell>
                    <TableCell align="right">{item.minimum_stock} {item.unit}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.stock_status} 
                        color={getStockStatusColor(item.stock_status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {item.selling_price ? `Rp ${parseFloat(item.selling_price).toLocaleString('id-ID')}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          setNewTransaction({ ...newTransaction, item_id: item.id });
                          setOpenTransaction(true);
                        }}
                      >
                        Transaksi
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Riwayat Transaksi</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTransaction(true)}
            >
              Catat Transaksi
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Tipe</TableCell>
                  <TableCell align="right">Jumlah</TableCell>
                  <TableCell align="right">Harga/Unit</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell>Keterangan</TableCell>
                  <TableCell>Oleh</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map(trans => (
                  <TableRow key={trans.id}>
                    <TableCell>{new Date(trans.transaction_date).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>{trans.item_name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={trans.transaction_type} 
                        color={getTransactionTypeColor(trans.transaction_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{trans.quantity}</TableCell>
                    <TableCell align="right">
                      {trans.price_per_unit ? `Rp ${parseFloat(trans.price_per_unit).toLocaleString('id-ID')}` : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {trans.total_amount ? `Rp ${parseFloat(trans.total_amount).toLocaleString('id-ID')}` : '-'}
                    </TableCell>
                    <TableCell>{trans.notes || '-'}</TableCell>
                    <TableCell>{trans.created_by_name || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Manajemen Warna Slayer</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenSlayerColor(true)}
            >
              Tambah Warna
            </Button>
          </Box>

          <Grid container spacing={2}>
            {slayerColors.map(color => (
              <Grid item xs={12} sm={6} md={3} key={color.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: color.color_code,
                          borderRadius: 1,
                          mr: 2,
                          border: '1px solid #ccc'
                        }}
                      />
                      <Typography variant="h6">{color.color_name}</Typography>
                    </Box>
                    <Typography color="textSecondary">
                      Stok: {color.current_stock} pcs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Mapping Earphone ke Grup</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenEarphoneMapping(true)}
            >
              Mapping Earphone
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Grup</TableCell>
                  <TableCell>Tanggal Berangkat</TableCell>
                  <TableCell align="right">Jumlah</TableCell>
                  <TableCell>Serial Numbers</TableCell>
                  <TableCell>Tanggal Distribusi</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {earphoneMappings.map(mapping => (
                  <TableRow key={mapping.id}>
                    <TableCell>{mapping.group_name}</TableCell>
                    <TableCell>
                      {new Date(mapping.departure_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell align="right">{mapping.quantity}</TableCell>
                    <TableCell>
                      {mapping.serial_numbers?.join(', ') || '-'}
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.distribution_date).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Chip label={mapping.status} color="primary" size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom>
            Checklist Perlengkapan
          </Typography>
          <Typography color="textSecondary">
            Fitur checklist perlengkapan jamaah dan TL akan tersedia di halaman detail grup keberangkatan
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Typography variant="h6" gutterBottom>
            Recap Penjualan
          </Typography>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bulan</TableCell>
                  <TableCell>Item</TableCell>
                  <TableCell>Kategori</TableCell>
                  <TableCell align="right">Transaksi</TableCell>
                  <TableCell align="right">Qty Terjual</TableCell>
                  <TableCell align="right">Total Revenue</TableCell>
                  <TableCell align="right">Harga Rata-rata</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesRecap.map((recap, index) => (
                  <TableRow key={index}>
                    <TableCell>{recap.month}</TableCell>
                    <TableCell>{recap.item_name}</TableCell>
                    <TableCell>{categories.find(c => c.value === recap.category)?.label}</TableCell>
                    <TableCell align="right">{recap.total_transactions}</TableCell>
                    <TableCell align="right">{recap.total_quantity_sold}</TableCell>
                    <TableCell align="right">
                      Rp {parseFloat(recap.total_revenue || 0).toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell align="right">
                      Rp {parseFloat(recap.avg_price || 0).toLocaleString('id-ID')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>

      {/* Add Item Dialog */}
      <Dialog open={openAddItem} onClose={() => setOpenAddItem(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Item Perlengkapan</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nama Item"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Kategori</InputLabel>
              <Select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                label="Kategori"
              >
                {categories.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Satuan"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Minimum Stok"
              type="number"
              value={newItem.minimum_stock}
              onChange={(e) => setNewItem({ ...newItem, minimum_stock: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Harga Beli Terakhir"
              type="number"
              value={newItem.last_purchase_price}
              onChange={(e) => setNewItem({ ...newItem, last_purchase_price: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Harga Jual"
              type="number"
              value={newItem.selling_price}
              onChange={(e) => setNewItem({ ...newItem, selling_price: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Deskripsi"
              multiline
              rows={3}
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddItem(false)}>Batal</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={!newItem.name || !newItem.category}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={openTransaction} onClose={() => setOpenTransaction(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Catat Transaksi</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Pilih Item</InputLabel>
              <Select
                value={newTransaction.item_id}
                onChange={(e) => setNewTransaction({ ...newTransaction, item_id: e.target.value })}
                label="Pilih Item"
              >
                {items.map(item => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} (Stok: {item.current_stock})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Tipe Transaksi</InputLabel>
              <Select
                value={newTransaction.transaction_type}
                onChange={(e) => setNewTransaction({ ...newTransaction, transaction_type: e.target.value })}
                label="Tipe Transaksi"
              >
                <MenuItem value="in">Masuk</MenuItem>
                <MenuItem value="out">Keluar</MenuItem>
                <MenuItem value="adjustment">Penyesuaian</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Jumlah"
              type="number"
              value={newTransaction.quantity}
              onChange={(e) => setNewTransaction({ ...newTransaction, quantity: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Referensi</InputLabel>
              <Select
                value={newTransaction.reference_type}
                onChange={(e) => setNewTransaction({ ...newTransaction, reference_type: e.target.value })}
                label="Referensi"
              >
                <MenuItem value="purchase">Pembelian</MenuItem>
                <MenuItem value="group_distribution">Distribusi Grup</MenuItem>
                <MenuItem value="jamaah_sale">Penjualan Jamaah</MenuItem>
                <MenuItem value="adjustment">Penyesuaian</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Harga per Unit"
              type="number"
              value={newTransaction.price_per_unit}
              onChange={(e) => setNewTransaction({ ...newTransaction, price_per_unit: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Keterangan"
              multiline
              rows={2}
              value={newTransaction.notes}
              onChange={(e) => setNewTransaction({ ...newTransaction, notes: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransaction(false)}>Batal</Button>
          <Button 
            onClick={handleRecordTransaction} 
            variant="contained" 
            disabled={!newTransaction.item_id || !newTransaction.transaction_type || !newTransaction.quantity}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Slayer Color Dialog */}
      <Dialog open={openSlayerColor} onClose={() => setOpenSlayerColor(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tambah Warna Slayer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nama Warna"
              value={newSlayerColor.color_name}
              onChange={(e) => setNewSlayerColor({ ...newSlayerColor, color_name: e.target.value })}
              margin="normal"
            />
            <Box display="flex" alignItems="center" gap={2} mt={2}>
              <Typography>Kode Warna:</Typography>
              <input
                type="color"
                value={newSlayerColor.color_code}
                onChange={(e) => setNewSlayerColor({ ...newSlayerColor, color_code: e.target.value })}
                style={{ width: 50, height: 40 }}
              />
              <TextField
                value={newSlayerColor.color_code}
                onChange={(e) => setNewSlayerColor({ ...newSlayerColor, color_code: e.target.value })}
                size="small"
              />
            </Box>
            <TextField
              fullWidth
              label="Stok Awal"
              type="number"
              value={newSlayerColor.current_stock}
              onChange={(e) => setNewSlayerColor({ ...newSlayerColor, current_stock: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSlayerColor(false)}>Batal</Button>
          <Button 
            onClick={handleAddSlayerColor} 
            variant="contained" 
            disabled={!newSlayerColor.color_name}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      {/* Earphone Mapping Dialog */}
      <Dialog open={openEarphoneMapping} onClose={() => setOpenEarphoneMapping(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mapping Earphone ke Grup</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Pilih Grup</InputLabel>
              <Select
                value={newEarphoneMapping.group_id}
                onChange={(e) => setNewEarphoneMapping({ ...newEarphoneMapping, group_id: e.target.value })}
                label="Pilih Grup"
              >
                {groups.map(group => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name} - {new Date(group.departure_date).toLocaleDateString('id-ID')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Jumlah"
              type="number"
              value={newEarphoneMapping.quantity}
              onChange={(e) => setNewEarphoneMapping({ ...newEarphoneMapping, quantity: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Serial Numbers (pisahkan dengan koma)"
              value={newEarphoneMapping.serial_numbers}
              onChange={(e) => setNewEarphoneMapping({ ...newEarphoneMapping, serial_numbers: e.target.value })}
              margin="normal"
              helperText="Contoh: EP001, EP002, EP003"
            />
            <TextField
              fullWidth
              label="Tanggal Distribusi"
              type="date"
              value={newEarphoneMapping.distribution_date}
              onChange={(e) => setNewEarphoneMapping({ ...newEarphoneMapping, distribution_date: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Keterangan"
              multiline
              rows={2}
              value={newEarphoneMapping.notes}
              onChange={(e) => setNewEarphoneMapping({ ...newEarphoneMapping, notes: e.target.value })}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEarphoneMapping(false)}>Batal</Button>
          <Button 
            onClick={handleMapEarphone} 
            variant="contained" 
            disabled={!newEarphoneMapping.group_id || !newEarphoneMapping.quantity}
          >
            Simpan
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryPage;