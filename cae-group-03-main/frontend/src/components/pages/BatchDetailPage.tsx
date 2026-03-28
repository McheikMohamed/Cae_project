import { useParams } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

const BatchDetailPage = () => {
  const { batchId } = useParams();
  const { cart, batchs, addToCart } = useContext(BatchContext);

  // Find batch in context array
  const batch = batchs.find(
    (batch) => batch.idBatch === parseInt(batchId || '', 10),
  );

  // find batch in the cart
  const cartItem = cart.find(
    (item) => item.idBatch === parseInt(batchId || '', 10),
  );

  // Use cart qantity or default to 1
  const [localQuantity, setLocalQuantity] = useState(
    cartItem ? cartItem.quantity || 1 : 1,
  );
  const [successMessageOpen, setSuccessMessageOpen] = useState(false);

  // update local quantity when cartItem changes
  useEffect(() => {
    if (cartItem) {
      setLocalQuantity(cartItem.quantity || 1);
    }
  }, [cartItem]);

  if (!batch) {
    return (
      <Container maxWidth="md" sx={{ paddingY: 4 }}>
        <Typography variant="h5" color="error">
          Lot introuvable
        </Typography>
      </Container>
    );
  }

  const availableQuantity =
    (batch.quantity ?? 0) -
    (batch.soldQuantity ?? 0) -
    (batch.removedQuantity ?? 0) -
    (batch.reservedQuantity ?? 0);

  const handleAddToCart = async () => {
    try {
      // use the local quantity to add to cart
      await addToCart(batch, localQuantity);
      setSuccessMessageOpen(true); // Afficher le message de succès
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Typography variant="h4" gutterBottom>
        {batch.product.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {batch.product.description}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Type : {batch.product.productType.libelle}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Unité : {batch.product.unit.name}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Prix par unité : {batch.pricePerUnit}€
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Quantité disponible :
        {(batch.quantity ?? 0) -
          (batch.soldQuantity ?? 0) -
          (batch.removedQuantity ?? 0) -
          (batch.reservedQuantity ?? 0)}{' '}
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mt={2}>
        <IconButton
          onClick={() => setLocalQuantity((prev) => Math.max(1, prev - 1))}
          disabled={localQuantity <= 1}
          color="primary"
        >
          <Remove />
        </IconButton>

        <TextField
          label="Quantité"
          type="number"
          value={localQuantity}
          onChange={(e) =>
            setLocalQuantity(
              Math.min(
                availableQuantity,
                Math.max(1, parseInt(e.target.value, 10) || 1),
              ),
            )
          }
          inputProps={{ min: 1, max: availableQuantity }}
          sx={{ width: '100px' }}
        />

        <IconButton
          onClick={() =>
            setLocalQuantity((prev) => Math.min(batch.quantity ?? 0, prev + 1))
          }
          disabled={localQuantity >= (batch.quantity ?? 0)}
          color="primary"
        >
          <Add />
        </IconButton>
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{
          marginTop: 4,
          borderRadius: '15px',
          backgroundColor: '#4CAF50',
          '&:hover': { backgroundColor: '#45A049' },
        }}
        onClick={handleAddToCart}
        disabled={!!cartItem && localQuantity === cartItem.quantity}
      >
        {cartItem ? 'Mettre à jour le panier' : 'Ajouter au panier'}
      </Button>

      {/* Message de confirmation de mise à jour */}
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
          Quantité mise à jour avec succès !
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BatchDetailPage;
