import { useContext } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import { UserContext } from '../../contexts/UserContext';
import { Link } from 'react-router-dom';
import { Container, Typography, Card, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';

const BatchHistoryPage = () => {
  const { batchs, updateBatch } = useContext(BatchContext);
  const { authenticatedUser } = useContext(UserContext);

  if (!authenticatedUser) {
    return (
      <Typography variant="h6">
        Veuillez vous connecter pour voir vos lots.
      </Typography>
    );
  }

  const userBatches = batchs.filter(
    (batch) => batch.producer?.email === authenticatedUser.email,
  );
  const approvedBatches = userBatches.filter(
    (batch) => batch.status === 'approved',
  );
  const pendingBatches = userBatches.filter(
    (batch) => batch.status === 'waiting',
  );
  const refusedBatches = userBatches.filter(
    (batch) => batch.status === 'refused',
  );
  const availableBatches = userBatches.filter(
    (batch) => batch.status === 'available',
  );
  const removedBatches = userBatches.filter(
    (batch) => batch.status === 'removed',
  );

  const handleCancel = async (idBatch: number) => {
    if (!authenticatedUser) return;
    try {
      await updateBatch(idBatch, 'cancelled');
    } catch (err) {
      console.error('Erreur annulation du lot:', err);
    }
  };

  const sectionStyle = {
    backgroundColor: '#4C8C4A',
    padding: 3,
    borderRadius: 1,
    mb: 4 as const,
  };
  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    p: 1,
    backgroundColor: '#FDF6EB',
  };
  const cardContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    p: 1,
  };
  const nameDescriptionStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    pr: 1,
  };
  const infoStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1,
    justifyContent: 'flex-end',
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h5" mb={3}>
        Historique des lots
      </Typography>

      {/* Lots approuvés */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" mb={2} color="#FDF6EB">
          Lots approuvés
        </Typography>
        <Grid container spacing={2}>
          {approvedBatches.length > 0 ? (
            approvedBatches.map((batch) => (
              <Grid key={batch.idBatch} size={12}>
                <Card sx={cardStyle}>
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography fontWeight="bold">
                        {batch.product.name}
                      </Typography>
                      <Typography color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>
                    <Box sx={infoStyle}>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleCancel(batch.idBatch!)}
                      >
                        Annuler
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>Aucun lot approuvé.</Typography>
          )}
        </Grid>
      </Box>

      {/* Lots en attente d'approbation */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" mb={2} color="#FDF6EB">
          Lots en attente d'approbation
        </Typography>
        <Grid container spacing={2}>
          {pendingBatches.length > 0 ? (
            pendingBatches.map((batch) => (
              <Grid key={batch.idBatch} size={12}>
                <Link
                  to={`/batch-info/${batch.idBatch}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card sx={{ ...cardStyle, cursor: 'pointer' }}>
                    <Box sx={cardContentStyle}>
                      <Box sx={nameDescriptionStyle}>
                        <Typography fontWeight="bold">
                          {batch.product.name}
                        </Typography>
                        <Typography color="text.secondary">
                          {batch.product.description}
                        </Typography>
                      </Box>
                      <Box sx={infoStyle}>
                        <Typography variant="caption" fontWeight="bold">
                          Date ajout :
                        </Typography>
                        <Typography variant="caption">
                          {batch.receiptDate
                            ? new Date(batch.receiptDate).toLocaleDateString(
                                'fr-FR',
                              )
                            : '—'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Link>
              </Grid>
            ))
          ) : (
            <Typography>Aucun lot en attente.</Typography>
          )}
        </Grid>
      </Box>

      {/* Lots refusés */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" mb={2} color="#FDF6EB">
          Lots refusés
        </Typography>
        <Grid container spacing={2}>
          {refusedBatches.length > 0 ? (
            refusedBatches.map((batch) => (
              <Grid key={batch.idBatch} size={12}>
                <Card sx={cardStyle}>
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography fontWeight="bold">
                        {batch.product.name}
                      </Typography>
                      <Typography color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>
                    <Box sx={infoStyle}>
                      <Typography variant="caption" fontWeight="bold">
                        Raison du rejet :
                      </Typography>
                      <Typography variant="caption" color="error">
                        {batch.rejectionReason ?? 'Non spécifiée'}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>Aucun lot refusé.</Typography>
          )}
        </Grid>
      </Box>

      {/* Lots en vente actuellement (sans redirection) */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" mb={2} color="#FDF6EB">
          Lots en vente actuellement
        </Typography>
        <Grid container spacing={2}>
          {availableBatches.length > 0 ? (
            availableBatches.map((batch) => (
              <Grid key={batch.idBatch} size={12}>
                <Card sx={cardStyle}>
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography fontWeight="bold">
                        {batch.product.name}
                      </Typography>
                      <Typography color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>
                    <Box sx={infoStyle}>
                      <Typography variant="caption" fontWeight="bold">
                        Prix/unité :
                      </Typography>
                      <Typography variant="caption">
                        {batch.pricePerUnit}€
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>Aucun lot en vente actuellement.</Typography>
          )}
        </Grid>
      </Box>

      {/* Lots vendus par le passé */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" mb={2} color="#FDF6EB">
          Lots vendus par le passé
        </Typography>
        <Grid container spacing={2}>
          {removedBatches.length > 0 ? (
            removedBatches.map((batch) => (
              <Grid key={batch.idBatch} size={12}>
                <Card sx={cardStyle}>
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography fontWeight="bold">
                        {batch.product.name}
                      </Typography>
                      <Typography color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>
                    <Box sx={infoStyle}>
                      <Typography variant="caption" fontWeight="bold">
                        Prix/unité :
                      </Typography>
                      <Typography variant="caption">
                        {batch.pricePerUnit}€
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography>Aucun lot vendu par le passé.</Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default BatchHistoryPage;
