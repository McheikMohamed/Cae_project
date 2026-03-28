import { useContext, useState } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import { createNotification } from '../../services/notificationApi';
import { UserContext } from '../../contexts/UserContext';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
} from '@mui/material';
import Grid from '@mui/material/Grid2';

const ManageBatchesPage = () => {
  const { batchs, acceptBatch, rejectBatch } = useContext(BatchContext);
  const [rejectionReasons, setRejectionReasons] = useState<{
    [key: number]: string;
  }>({});
  const { authenticatedUser } = useContext(UserContext);

  const handleAccept = async (idBatch: number) => {
    await acceptBatch(idBatch);

    if (authenticatedUser) {
      const notification = {
        batchId: idBatch,
        message: 'Le lot a été accepté',
        // reasonOfReject is not needed here, so we can omit it
      };
      console.log('Notification construite :', notification);
      try {
        await createNotification(notification, authenticatedUser.token);
        console.log('Notification envoyée avec succès');
      } catch (err) {
        console.error("Erreur lors de l'envoi de la notification :", err);
      }
    }
  };

  const handleReject = async (idBatch: number) => {
    const reason = rejectionReasons[idBatch] || 'Aucune raison spécifiée';
    console.log(
      `handleReject déclenché pour le batch ID: ${idBatch} avec raison: ${reason}`,
    );
    await rejectBatch(idBatch, reason);

    if (authenticatedUser) {
      const notification = {
        batchId: idBatch,
        message: 'Le lot a été refusé',
        reasonOfReject: reason,
      };
      console.log('Notification construite :', notification);
      try {
        await createNotification(notification, authenticatedUser.token);
        console.log('Notification envoyée avec succès');
      } catch (err) {
        console.error("Erreur lors de l'envoi de la notification :", err);
      }
    }
  };

  const handleReasonChange = (idBatch: number, value: string) => {
    if (value.length <= 255) {
      setRejectionReasons({ ...rejectionReasons, [idBatch]: value });
    }
  };

  const waitingBatches = batchs.filter((batch) => batch.status === 'waiting');

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Gérer les lots en attente
      </Typography>
      <Grid container spacing={2}>
        {waitingBatches.map((batch) => (
          <Grid key={batch.idBatch} size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6">{batch.product.name}</Typography>
                <Typography>
                  Description : {batch.product.description}
                </Typography>
                <Typography>
                  Quantité : {batch.quantity} {batch.product.unit.name}
                </Typography>
                <Typography>Prix : {batch.pricePerUnit}€</Typography>
                <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => handleAccept(batch.idBatch!)}
                  >
                    Accepter
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleReject(batch.idBatch!)}
                  >
                    Refuser
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  label="Raison du rejet (optionnel)"
                  variant="outlined"
                  value={rejectionReasons[batch.idBatch!] || ''}
                  onChange={(e) =>
                    handleReasonChange(batch.idBatch!, e.target.value)
                  }
                  sx={{ marginTop: 2 }}
                  helperText={`${rejectionReasons[batch.idBatch!]?.length || 0}/255 caractères`}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ManageBatchesPage;
