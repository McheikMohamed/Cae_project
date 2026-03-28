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

const UpdateBatchQuantityPage = () => {
  const {
    batchs,
    setBatchs,
    cart,
    addToCart,
    removeFromCart,
    setCart,
    addRemovedQuantity,
    subRemovedQuantity,
  } = useContext(BatchContext);

  // Charger tous les lots au montage de la page
  useEffect(() => {
    (async () => {
      const all = await fetchAllBatches();
      setBatchs(all);
    })();
  }, [setBatchs]);

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [quantities, setQuantities] = useState<{ [id: number]: number }>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const handleClose = () => setSnackbar((s) => ({ ...s, open: false }));

  // Calcul de la quantité restante
  const enriched = batchs.map((b) => ({
    ...b,
    remaining:
      (b.quantity ?? 0) -
      (b.soldQuantity ?? 0) -
      (b.removedQuantity ?? 0) -
      (b.reservedQuantity ?? 0),
  }));

  // Filtre, tri et suppression des lots épuisés
  const filtered = enriched
    .filter((b) => b.status === 'available' && b.remaining > 0)
    .filter((b) =>
      filterType ? b.product.productType.libelle === filterType : true,
    )
    .filter((b) =>
      search
        ? b.product.name.toLowerCase().includes(search.toLowerCase()) ||
          b.product.description.toLowerCase().includes(search.toLowerCase())
        : true,
    )
    .sort(
      (a, b) =>
        new Date(b.receiptDate || 0).getTime() -
        new Date(a.receiptDate || 0).getTime(),
    );

  const productTypes = Array.from(
    new Set(batchs.map((b) => b.product.productType.libelle)),
  );

  const handleQuantityChange = (id: number, value: string) => {
    const q = Math.max(1, parseInt(value, 10) || 1);
    setQuantities((prev) => ({ ...prev, [id]: q }));
  };

  const handleAddToCart = async (batch: (typeof filtered)[0]) => {
    const qty = Math.min(quantities[batch.idBatch!] || 1, batch.remaining);
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

  const handleSubmitRemove = async () => {
    if (!cart.length) {
      setSnackbar({
        open: true,
        message: 'Le panier est vide.',
        severity: 'error',
      });
      return;
    }
    try {
      await subRemovedQuantity(cart);
      setCart([]);
      setSnackbar({
        open: true,
        message: 'Quantités retirées.',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour.',
        severity: 'error',
      });
    }
  };

  const handleSubmitAdd = async () => {
    if (!cart.length) {
      setSnackbar({
        open: true,
        message: 'Le panier est vide.',
        severity: 'error',
      });
      return;
    }
    try {
      await addRemovedQuantity(cart);
      setCart([]);
      setSnackbar({
        open: true,
        message: 'Quantités ajoutées.',
        severity: 'success',
      });
    } catch {
      setSnackbar({
        open: true,
        message: 'Erreur lors de la mise à jour.',
        severity: 'error',
      });
    }
  };

  // Vérifications de dépassement
  const exceedingRemoved = cart.filter((batch) => {
    const b = enriched.find((x) => x.idBatch === batch.idBatch);
    return (batch.quantity || 0) > (b?.remaining ?? 0);
  });
  const exceedingAdded = cart.filter((batch) => {
    const b = enriched.find((x) => x.idBatch === batch.idBatch);
    return (batch.quantity || 0) > (b?.removedQuantity ?? 0);
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Barre de recherche */}
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
      <Box sx={{ bgcolor: '#4C8C4A', p: 3, borderRadius: 1, mb: 4 }}>
        <Typography variant="h6" color="#FDF6EB" mb={2}>
          Filtrer par type
        </Typography>
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          displayEmpty
          sx={{ bgcolor: '#FFF', borderRadius: 1, px: 1 }}
        >
          <MenuItem value="">Tous</MenuItem>
          {productTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Grille de lots */}
      <Grid container spacing={2} sx={{ width: '100%' }}>
        {filtered.length ? (
          filtered.map((batch) => {
            const inCart = cart.some((c) => c.idBatch === batch.idBatch);
            return (
              <Grid key={batch.idBatch} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    '&:hover': { boxShadow: 6 },
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
                    <Typography variant="body2" color="text.secondary">
                      {batch.product.description}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Prix : {batch.pricePerUnit}€
                    </Typography>
                    <Typography variant="body2">
                      Disponible : {batch.remaining} {batch.product.unit.name}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={2} gap={1}>
                      <IconButton
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [batch.idBatch!]: Math.max(
                              1,
                              (prev[batch.idBatch!] || 1) - 1,
                            ),
                          }))
                        }
                        disabled={(quantities[batch.idBatch!] || 1) <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        type="number"
                        value={quantities[batch.idBatch!] || 1}
                        onChange={(e) =>
                          handleQuantityChange(batch.idBatch!, e.target.value)
                        }
                        inputProps={{ min: 1, max: batch.remaining }}
                        sx={{ width: 80 }}
                      />
                      <IconButton
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [batch.idBatch!]: Math.min(
                              batch.remaining,
                              (prev[batch.idBatch!] || 1) + 1,
                            ),
                          }))
                        }
                        disabled={
                          (quantities[batch.idBatch!] || 1) >= batch.remaining
                        }
                      >
                        <Add />
                      </IconButton>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{ mt: 2 }}
                      onClick={() => handleAddToCart(batch)}
                    >
                      {inCart ? 'Modifier' : 'Ajouter'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Typography>Aucun lot disponible.</Typography>
        )}
      </Grid>

      {/* Panier */}
      <Box sx={{ mt: 4, p: 2, bgcolor: '#FDF6EB', borderRadius: 1 }}>
        <Typography variant="h5" gutterBottom>
          Panier
        </Typography>
        {cart.length === 0 ? (
          <Typography>Vide.</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              {cart.map((b) => (
                <Grid key={b.idBatch} size={12}>
                  <Card
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography fontWeight="bold">
                        {b.product.name}
                      </Typography>
                      <Typography>
                        Qté : {b.quantity} {b.product.unit.name}
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
            <Box display="flex" gap={2} mt={2}>
              <Button
                variant="contained"
                sx={{ flex: 1 }}
                onClick={handleSubmitRemove}
                disabled={exceedingAdded.length > 0}
              >
                Retirer Qté
              </Button>
              <Button
                variant="outlined"
                sx={{ flex: 1 }}
                onClick={handleSubmitAdd}
                disabled={exceedingRemoved.length > 0}
              >
                Ajouter Qté
              </Button>
            </Box>
            {exceedingAdded.length > 0 && (
              <Typography color="error" mt={1}>
                Dépassement ajout :{' '}
                {exceedingAdded.map((b) => b.product.name).join(', ')}
              </Typography>
            )}
            {exceedingRemoved.length > 0 && (
              <Typography color="error" mt={1}>
                Dépassement retrait :{' '}
                {exceedingRemoved.map((b) => b.product.name).join(', ')}
              </Typography>
            )}
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

export default UpdateBatchQuantityPage;
