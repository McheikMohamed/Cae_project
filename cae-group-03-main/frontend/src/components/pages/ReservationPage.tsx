import { useContext, useState, useEffect, useCallback } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import { Reservation, ReservationLine } from '../../types';
import {
  Container,
  Typography,
  Button,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ReservationPage = () => {
  const { getUserReservations, getReservationLines, cancelReservation } =
    useContext(BatchContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationLines, setReservationLines] = useState<{
    [key: number]: ReservationLine[];
  }>({});
  const [expandedReservation, setExpandedReservation] = useState<number | null>(
    null,
  );
  const [openDialog, setOpenDialog] = useState(false); // État pour gérer l'ouverture du dialog
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(
    null,
  ); // ID de la réservation à annuler

  // Functions to fetch reservations and reservation lines
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData = await getUserReservations();
      console.log('Réservations récupérées:', reservationsData);

      // Tri des réservations par date (plus récentes d'abord)
      const sortedReservations = [...reservationsData].sort(
        (a, b) =>
          new Date(b.recoveryDate).getTime() -
          new Date(a.recoveryDate).getTime(),
      );
      setReservations(sortedReservations);
      console.log('reservations cote front: ', sortedReservations);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      setError(
        'Impossible de récupérer vos réservations. Veuillez réessayer plus tard.',
      );
    } finally {
      setLoading(false);
    }
  }, [getUserReservations]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Functions to fetch reservation lines
  const fetchReservationLines = async (reservationId: number) => {
    try {
      // Verify if the lines are already fetched
      if (reservationLines[reservationId]) {
        return;
      }

      const lines = await getReservationLines(reservationId);
      setReservationLines((prev) => ({
        ...prev,
        [reservationId]: lines,
      }));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails de la réservation ${reservationId}:`,
        error,
      );
      setError(
        'Impossible de récupérer les détails de la réservation. Veuillez réessayer plus tard.',
      );
    }
  };

  // Function to handle accordion toggle
  const handleAccordionToggle = (reservationId: number) => {
    if (expandedReservation === reservationId) {
      setExpandedReservation(null);
    } else {
      setExpandedReservation(reservationId);
      fetchReservationLines(reservationId);
    }
  };

  // Fonction pour ouvrir le Dialog de confirmation d'annulation
  const handleOpenDialog = (reservationId: number) => {
    setReservationToCancel(reservationId);
    setOpenDialog(true);
  };

  // Fonction pour annuler la réservation
  const handleCancelReservation = async () => {
    if (reservationToCancel === null) return;

    setLoading(true);
    try {
      await cancelReservation(reservationToCancel);
      // Rafraîchir les réservations après l'annulation
      fetchReservations();
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation:", error);
      setError(
        "Impossible d'annuler la réservation. Veuillez réessayer plus tard.",
      );
    } finally {
      setLoading(false);
      setOpenDialog(false); // Fermer le dialog après l'annulation
      setReservationToCancel(null); // Réinitialiser l'ID de réservation à annuler
    }
  };

  // Function to format the date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Function to calculate the total price of a reservation line
  const calculateLineTotal = (line: ReservationLine): number => {
    return line.quantity * line.batch.pricePerUnit;
  };

  // Function to calculate the total price of a reservation
  const calculateReservationTotal = (lines: ReservationLine[]): number => {
    return lines.reduce((total, line) => total + calculateLineTotal(line), 0);
  };

  // filter reservations into pending and past
  const pendingReservations = reservations.filter(
    (res) => res.status === 'Pending',
  );
  const pastReservations = reservations.filter(
    (res) => res.status !== 'Pending',
  );

  // Render reservation lines in a table
  const renderReservationLines = (reservationId: number) => {
    const lines = reservationLines[reservationId] || [];
    const total = calculateReservationTotal(lines);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Produit</TableCell>
              <TableCell align="right">Quantité</TableCell>
              <TableCell align="right">Unité</TableCell>
              <TableCell align="right">Prix unitaire</TableCell>
              <TableCell align="right">Prix total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => (
              <TableRow key={line.idReservationLine}>
                <TableCell>{line.batch.product.name}</TableCell>
                <TableCell align="right">{line.quantity}</TableCell>
                <TableCell align="right">
                  {line.batch.product.unit.name === 'piece'
                    ? 'pièce'
                    : line.batch.product.unit.name === 'kg'
                      ? 'kilogramme'
                      : line.batch.product.unit.name === 'L'
                        ? 'litre'
                        : line.batch.product.unit.name}
                </TableCell>
                <TableCell align="right">
                  {line.batch.pricePerUnit.toFixed(2)}€
                </TableCell>
                <TableCell align="right">
                  {calculateLineTotal(line).toFixed(2)}€
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                Total
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                {total.toFixed(2)}€
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render the reservations section
  const renderReservationsSection = (
    title: string,
    reservations: Reservation[],
    showCancelButton: boolean,
  ) => {
    if (reservations.length === 0) {
      return (
        <div>
          <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Aucune réservation à afficher.
          </Typography>
        </div>
      );
    }

    return (
      <div>
        <Typography variant="h5" sx={{ marginTop: 4, marginBottom: 2 }}>
          {title}
        </Typography>
        <Grid container spacing={2}>
          {reservations.map((reservation) => (
            <Grid size={{ xs: 12 }} key={reservation.idReservation}>
              <Card
                sx={{
                  borderRadius: '15px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Accordion
                  expanded={expandedReservation === reservation.idReservation}
                  onChange={() =>
                    handleAccordionToggle(reservation.idReservation)
                  }
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${reservation.idReservation}-content`}
                    id={`panel-${reservation.idReservation}-header`}
                  >
                    <Typography variant="h6">
                      commande n° {reservation.idReservation} (
                      {formatDate(reservation.recoveryDate)}){' '}
                      {reservation.status === 'removed'
                        ? '(réservation annulée)'
                        : reservation.status === 'approved'
                          ? '(réservation récupérée)'
                          : reservation.status === 'abandoned'
                            ? '(réservation abandonnée)'
                            : ''}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {expandedReservation === reservation.idReservation ? (
                      reservationLines[reservation.idReservation] ? (
                        renderReservationLines(reservation.idReservation)
                      ) : (
                        <CircularProgress size={24} />
                      )
                    ) : null}

                    {showCancelButton && (
                      <Button
                        variant="outlined"
                        color="error"
                        sx={{ marginTop: 2 }}
                        onClick={() =>
                          handleOpenDialog(reservation.idReservation)
                        }
                      >
                        Annuler la réservation
                      </Button>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };

  return (
    <Container maxWidth="md" sx={{ paddingY: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mes réservations
      </Typography>

      {loading && <CircularProgress />}

      {error && (
        <Alert severity="error" sx={{ marginY: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>
          {renderReservationsSection(
            'Réservations en cours',
            pendingReservations,
            true,
          )}
          {renderReservationsSection(
            'Réservations passées',
            pastReservations,
            false,
          )}
        </>
      )}

      {/* Dialog de confirmation d'annulation */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmer l'annulation</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            Êtes-vous sûr de vouloir annuler cette réservation ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleCancelReservation} color="error">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReservationPage;
