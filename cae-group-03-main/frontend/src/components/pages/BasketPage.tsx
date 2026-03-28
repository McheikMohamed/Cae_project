import { useContext, useState } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { fr as frLocale } from 'date-fns/locale';

const BasketPage = () => {
  const {
    cart,
    reserveCart,
    removeFromCart,
    updateCartQuantity,
    batchs,
    fetchCart,
    setCart,
  } = useContext(BatchContext);

  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState<boolean>(false);
  const [editingQuantities, setEditingQuantities] = useState<{
    [idBatch: number]: number;
  }>({});
  const [successMessageOpen, setSuccessMessageOpen] = useState(false);

  const handleRemoveFromCart = (idBatch: number) => {
    removeFromCart(idBatch);
  };

  const handleQuantityChange = (idBatch: number, value: string) => {
    const raw = parseInt(value, 10) || 1;
    const batchInStore = batchs.find((b) => b.idBatch === idBatch);
    const maxAvailable = batchInStore?.quantity ?? raw;
    const quantity = Math.min(Math.max(1, raw), maxAvailable);
    setEditingQuantities((prev) => ({
      ...prev,
      [idBatch]: quantity,
    }));
  };

  const handleSaveQuantity = async (idBatch: number) => {
    const newQuantity = editingQuantities[idBatch];
    if (newQuantity !== undefined) {
      try {
        await updateCartQuantity(idBatch, newQuantity);
        setEditingQuantities((prev) => {
          const updated = { ...prev };
          delete updated[idBatch];
          return updated;
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de la quantité :', error);
      }
    }
  };

  const handleCommand = async () => {
    if (!selectedDate || dateError) return;
    setLoading(true);
    try {
      await reserveCart(cart, selectedDate);
      // on rafraîchit uniquement le panier et on le vide
      await fetchCart();
      setCart([]);
      setSuccessMessageOpen(true);
    } catch (error) {
      console.error('Erreur lors de la commande :', error);
      setSuccessMessageOpen(true); // on peut passer severity="error" si on le souhaite
    } finally {
      setLoading(false);
    }
  };

  const total = cart.reduce(
    (acc, batch) => acc + batch.pricePerUnit * (batch.quantity || 1),
    0,
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Votre panier
      </Typography>

      {cart.length === 0 ? (
        <Typography variant="h4" align="center" sx={{ my: 8 }}>
          Panier vide
        </Typography>
      ) : (
        <>
          <Grid container spacing={2}>
            {cart.map((batch) => {
              const storeBatch = batchs.find(
                (b) => b.idBatch === batch.idBatch,
              );
              const availableQty = storeBatch?.quantity ?? 0;
              const currentQty =
                editingQuantities[batch.idBatch!] ?? batch.quantity ?? 1;
              return (
                <Grid key={batch.idBatch} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card sx={{ borderRadius: 2, p: 2, boxShadow: 1 }}>
                    <CardContent>
                      <Typography variant="h6">{batch.product.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batch.product.description}
                      </Typography>
                      <Typography variant="body2" color="text.primary">
                        Prix/unité : {batch.pricePerUnit}€
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Quantité dispo : {availableQty}
                      </Typography>

                      <TextField
                        label="Quantité"
                        type="number"
                        value={currentQty}
                        onChange={(e) =>
                          handleQuantityChange(batch.idBatch!, e.target.value)
                        }
                        sx={{ mt: 2, width: '100%' }}
                        inputProps={{ min: 1, max: availableQty }}
                      />

                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ mt: 2 }}
                        onClick={() => handleSaveQuantity(batch.idBatch!)}
                        disabled={
                          editingQuantities[batch.idBatch!] === undefined ||
                          currentQty > availableQty
                        }
                      >
                        Valider
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ mt: 2 }}
                        onClick={() => handleRemoveFromCart(batch.idBatch!)}
                      >
                        Retirer
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Choisissez une date
            </Typography>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={frLocale}
            >
              <DatePicker
                label="Date"
                value={selectedDate}
                onChange={(newDate) => {
                  setSelectedDate(newDate);
                  if (newDate) {
                    const day = newDate.getDay();
                    setDateError(!(day === 2 || day === 4));
                  } else {
                    setDateError(true);
                  }
                }}
                shouldDisableDate={(date) => {
                  const day = date.getDay();
                  return !(day === 2 || day === 4);
                }}
                minDate={new Date()}
                maxDate={
                  new Date(new Date().setMonth(new Date().getMonth() + 1))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: dateError,
                    helperText: dateError
                      ? 'Sélectionnez un mardi ou jeudi'
                      : '',
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          <Typography variant="h6" sx={{ marginTop: 4, textAlign: 'right' }}>
            Total : {total.toFixed(2)}€
          </Typography>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleCommand}
            disabled={loading || !selectedDate || dateError}
          >
            {loading ? 'En cours…' : 'Commander'}
          </Button>
        </>
      )}

      <Snackbar
        open={successMessageOpen}
        autoHideDuration={4000}
        onClose={() => setSuccessMessageOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSuccessMessageOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Commande validée !
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BasketPage;
