import { useState, useContext, useEffect } from 'react';
import {
  Container,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  InputBase,
  Paper,
  Box,
  CardMedia,
  Button,
  TextField,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import SearchIcon from '@mui/icons-material/Search';
import { Add, Remove } from '@mui/icons-material';
import { BatchContext } from '../../contexts/BatchContext';
import { fetchAllBatches } from '../../services/batchApi';
import { Batch } from '../../types';

const sectionStyle = {
  backgroundColor: '#4C8C4A',
  padding: '30px',
  borderRadius: '8px',
  marginBottom: '20px',
};

const VenteLibre = () => {
  const {
    batchs,
    setBatchs,
    cart,
    addToCart,
    removeFromCart,
    freeSale,
    setCart,
  } = useContext(BatchContext);

  useEffect(() => {
    (async () => {
      const all = await fetchAllBatches();
      setBatchs(all);
    })();
  }, [setBatchs]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [quantities, setQuantities] = useState<{ [idBatch: number]: number }>(
    {},
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleClose = () => setSnackbar((s) => ({ ...s, open: false }));

  const filteredBatchs = batchs
    .filter((batch) => batch.status === 'available')
    .map((batch) => {
      const remaining =
        (batch.quantity ?? 0) -
        (batch.soldQuantity ?? 0) -
        (batch.removedQuantity ?? 0) -
        (batch.reservedQuantity ?? 0);
      return { batch, remaining };
    })
    .filter(({ remaining }) => remaining > 0)
    .filter(({ batch }) =>
      filterType ? batch.product.productType.libelle === filterType : true,
    )
    .filter(({ batch }) =>
      search
        ? batch.product.name.toLowerCase().includes(search.toLowerCase()) ||
          batch.product.description.toLowerCase().includes(search.toLowerCase())
        : true,
    );

  const productTypes = Array.from(
    new Set(batchs.map((b) => b.product.productType.libelle)),
  );

  const handleAddToCart = async (batch: Batch) => {
    if (!batch.idBatch) return;
    const qty = quantities[batch.idBatch] || 1;
    await addToCart(batch, qty);
    setSnackbar({
      open: true,
      message: 'Lot ajouté au panier',
      severity: 'success',
    });
  };

  const handleRemoveFromCart = (id: number) => {
    removeFromCart(id);
    setSnackbar({
      open: true,
      message: 'Lot retiré du panier',
      severity: 'success',
    });
  };

  const cartTotal = cart.reduce(
    (sum, b) => sum + b.pricePerUnit * (b.quantity || 1),
    0,
  );

  const handleSubmit = async () => {
    if (cart.length === 0) {
      setSnackbar({
        open: true,
        message: 'Le panier est vide.',
        severity: 'error',
      });
      return;
    }
    try {
      await freeSale(cart);
      setCart([]);
      setSnackbar({
        open: true,
        message: 'Commande réussie !',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la commande.',
        severity: 'error',
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Recherche */}
      <Paper
        component="form"
        sx={{
          display: 'flex',
          alignItems: 'center',
          mb: 4,
          p: '4px 8px',
          borderRadius: 2,
          bgcolor: '#D67F65',
          '&:hover': { bgcolor: '#C66B58' },
        }}
      >
        <SearchIcon sx={{ mr: 1 }} />
        <InputBase
          fullWidth
          placeholder="Recherche..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      {/* Filtre par type */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" color="#FDF6EB" mb={2}>
          Trier par type
        </Typography>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          displayEmpty
          sx={{ bgcolor: '#FFF', borderRadius: 1, px: 1 }}
        >
          <MenuItem value="">Tous</MenuItem>
          {productTypes.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Liste des lots */}
      <Grid container spacing={2}>
        {filteredBatchs.map(({ batch, remaining }) => {
          const inCart = cart.some((c) => c.idBatch === batch.idBatch);
          const qty = quantities[batch.idBatch!] || 1;
          return (
            <Grid key={batch.idBatch} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card
                sx={{
                  bgcolor: '#FDF6EB',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'scale(1.05)', boxShadow: 6 },
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={batch.imageLocation}
                  alt={batch.product.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{batch.product.name}</Typography>
                  <Typography color="text.secondary">
                    {batch.product.description}
                  </Typography>
                  <Typography color="text.primary">
                    {batch.pricePerUnit}€ / {batch.product.unit.name}
                  </Typography>
                  <Typography color="text.secondary">
                    Dispo : {remaining} {batch.product.unit.name}
                  </Typography>

                  <Box display="flex" alignItems="center" mt={2} gap={1}>
                    <IconButton
                      onClick={() =>
                        setQuantities((p) => ({
                          ...p,
                          [batch.idBatch!]: Math.max(1, qty - 1),
                        }))
                      }
                      disabled={qty <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      type="number"
                      value={qty}
                      onChange={(e) =>
                        setQuantities((p) => ({
                          ...p,
                          [batch.idBatch!]: Math.min(
                            remaining,
                            Math.max(1, parseInt(e.target.value, 10) || 1),
                          ),
                        }))
                      }
                      inputProps={{ min: 1, max: remaining }}
                      sx={{ width: 64 }}
                    />
                    <IconButton
                      onClick={() =>
                        setQuantities((p) => ({
                          ...p,
                          [batch.idBatch!]: Math.min(remaining, qty + 1),
                        }))
                      }
                      disabled={qty >= remaining}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => handleAddToCart(batch)}
                  >
                    {inCart ? 'Modifier' : 'Ajouter'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Panier */}
      <Box sx={{ mt: 4, p: 2, bgcolor: '#FDF6EB', borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom>
          Panier ({cart.length})
        </Typography>
        {cart.length === 0 ? (
          <Typography>Vide</Typography>
        ) : (
          <>
            <Grid container spacing={1}>
              {cart.map((b) => (
                <Grid key={b.idBatch} size={12}>
                  <Card
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      p: 1,
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography>{b.product.name}</Typography>
                      <Typography>
                        {b.quantity} {b.product.unit.name}
                      </Typography>
                    </Box>
                    <Button
                      color="error"
                      onClick={() => handleRemoveFromCart(b.idBatch!)}
                    >
                      Retirer
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Typography align="right" mt={2}>
              Total : {cartTotal}€
            </Typography>
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleSubmit}
            >
              Vendre
            </Button>
          </>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default VenteLibre;
