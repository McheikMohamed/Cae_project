import { useContext } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import { UserContext } from '../../contexts/UserContext';
import { Container, Typography, Card, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Link } from 'react-router-dom';

const AllBatchesPage = () => {
  const { batchs, updateBatch } = useContext(BatchContext);
  const { authenticatedUser } = useContext(UserContext);

  if (!authenticatedUser) {
    return (
      <Typography variant="h6">
        Veuillez vous connecter pour voir vos lots.
      </Typography>
    );
  }

  const refusedBatches = batchs.filter((batch) => batch.status === 'refused');
  const approvedBatches = batchs.filter((batch) => batch.status === 'approved');
  const availableBatches = batchs.filter(
    (batch) => batch.status === 'available',
  );
  const removedBatches = batchs.filter((batch) => batch.status === 'removed');
  const pendingBatches = batchs.filter((batch) => batch.status === 'waiting');

  const sectionStyle = {
    backgroundColor: '#4C8C4A',
    padding: '30px',
    borderRadius: '8px',
    marginBottom: '20px',
  };

  const cardStyle = {
    display: 'flex',
    flexDirection: 'column',
    padding: 1,
    backgroundColor: '#FDF6EB',
  };

  const cardContentStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px',
  };

  const nameDescriptionStyle = {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    paddingRight: '10px',
  };

  const infoStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  };

  const handleReception = (idBatch: number) => {
    updateBatch(idBatch, 'available');
  };

  return (
    <Container maxWidth="xl" sx={{ paddingY: 4 }}>
      <Typography variant="h5" sx={{ marginBottom: 3 }}>
        Historique des lots
      </Typography>

      {/* approved batches */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#FDF6EB' }}>
          Lots approuvés
        </Typography>
        <Grid container spacing={2}>
          {approvedBatches.length > 0 ? (
            approvedBatches.map((batch) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={batch.idBatch}>
                <Card sx={cardStyle}>
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {batch.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>
                    <Box sx={infoStyle}>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => handleReception(batch.idBatch!)}
                      >
                        livré
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body2">Aucun lot approuvé.</Typography>
          )}
        </Grid>
      </Box>

      {/* Refused batches */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#FDF6EB' }}>
          Lots refusés
        </Typography>
        <Grid container spacing={2}>
          {refusedBatches.length > 0 ? (
            refusedBatches.map((batch) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={batch.idBatch}>
                <Card sx={cardStyle}>
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {batch.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>
                    <Box sx={infoStyle}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        Raison du rejet:
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
            <Typography variant="body2">Aucun lot refusé.</Typography>
          )}
        </Grid>
      </Box>

      {/* Batch waiting for approbation */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#FDF6EB' }}>
          Lots en attente d'approbation
        </Typography>
        <Grid container spacing={2}>
          {pendingBatches.length > 0 ? (
            pendingBatches.map((batch) => (
              <Grid size={{ xs: 12 }} key={batch.idBatch}>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 1,
                    backgroundColor: '#FDF6EB',
                  }}
                >
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {batch.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>

                    <Box sx={infoStyle}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                        }}
                      >
                        Date ajout du lot:{' '}
                      </Typography>
                      <Typography variant="caption">
                        {batch.receiptDate
                          ? new Date(batch.receiptDate).toLocaleDateString(
                              'fr-FR',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              },
                            )
                          : 'Date non disponible'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                        }}
                      >
                        Prix/unité:{' '}
                      </Typography>
                      <Typography variant="caption">
                        {batch.pricePerUnit}€
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 'bold',
                          textDecoration: 'underline',
                        }}
                      >
                        Quantité :{' '}
                      </Typography>
                      <Typography variant="caption">
                        {batch.quantity}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))
          ) : (
            <Typography variant="body2">Aucun lot en attente.</Typography>
          )}
        </Grid>
      </Box>

      {/* Batches to sell */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#FDF6EB' }}>
          Lots mis en vente actuellement
        </Typography>
        <Grid container spacing={2}>
          {availableBatches.length > 0 ? (
            availableBatches.map((batch) => (
              <Grid size={{ xs: 12 }} key={batch.idBatch}>
                <Link
                  to={`/batch-info/${batch.idBatch}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 1,
                      backgroundColor: '#FDF6EB',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        boxShadow: '0 4px 20px rgba(164, 121, 4, 0.85)',
                      },
                    }}
                  >
                    <Box sx={cardContentStyle}>
                      <Box sx={nameDescriptionStyle}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {batch.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {batch.product.description}
                        </Typography>
                      </Box>

                      <Box sx={infoStyle}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                          }}
                        >
                          Date ajout du lot:{' '}
                        </Typography>
                        <Typography variant="caption">
                          {batch.receiptDate
                            ? new Date(batch.receiptDate).toLocaleDateString(
                                'fr-FR',
                                {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                },
                              )
                            : 'Date non disponible'}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                          }}
                        >
                          Prix/unité:{' '}
                        </Typography>
                        <Typography variant="caption">
                          {batch.pricePerUnit}€
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            textDecoration: 'underline',
                          }}
                        >
                          Quantité restante:{' '}
                        </Typography>
                        <Typography variant="caption">
                          {batch.quantity! - (batch.reservedQuantity ?? 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Link>
              </Grid>
            ))
          ) : (
            <Typography variant="body2">
              Aucun lot en vente actuellement.
            </Typography>
          )}
        </Grid>
      </Box>

      {/* Batches removed */}
      <Box sx={sectionStyle}>
        <Typography variant="h6" sx={{ marginBottom: 2, color: '#FDF6EB' }}>
          Lots mis en vente dans le passé
        </Typography>
        <Grid container spacing={2}>
          {removedBatches.length > 0 ? (
            removedBatches.map((batch) => (
              <Grid size={{ xs: 12 }} key={batch.idBatch}>
                <Card sx={cardStyle}>
                  <Box sx={cardContentStyle}>
                    <Box sx={nameDescriptionStyle}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {batch.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {batch.product.description}
                      </Typography>
                    </Box>

                    <Box sx={infoStyle}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 'bold', textDecoration: 'underline' }}
                      >
                        Date ajout du lot:{' '}
                      </Typography>
                      <Typography variant="caption">
                        {batch.receiptDate
                          ? new Date(batch.receiptDate).toLocaleDateString(
                              'fr-FR',
                              {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              },
                            )
                          : 'Date non disponible'}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 'bold', textDecoration: 'underline' }}
                      >
                        Prix/unité:{' '}
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
            <Typography variant="body2">
              Aucun lot vendu par le passé.
            </Typography>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default AllBatchesPage;
