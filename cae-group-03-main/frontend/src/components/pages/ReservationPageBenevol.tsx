import { useContext, useState, useEffect, useCallback } from 'react';
import { BatchContext } from '../../contexts/BatchContext';
import { ReservationLine, ReservationUser } from '../../types';
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
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ReservationPage = () => {
  const {
    getReservationLines,
    getReservation,
    changeStatusAsRetrieved,
    changeStatusAsAbandoned,
  } = useContext(BatchContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationsUser, setReservationsUser] = useState<ReservationUser[]>(
    [],
  );
  const [reservationLines, setReservationLines] = useState<{
    [key: number]: ReservationLine[];
  }>({});
  const [expandedReservation, setExpandedReservation] = useState<number | null>(
    null,
  );

  // Function to fetch reservations
  const fetchReservations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reservationsData = await getReservation();
      console.log('Réservations récupérées:', reservationsData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sortedReservations = [...reservationsData].filter((reservation) => {
        const recoveryDate = new Date(reservation.reservation.recoveryDate);
        recoveryDate.setHours(0, 0, 0, 0);
        return recoveryDate.getTime() === today.getTime();
      });
      setReservationsUser(sortedReservations);
      console.log('reservations cote front: ', sortedReservations);
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      setError(
        'Impossible de récupérer vos réservations. Veuillez réessayer plus tard.',
      );
    } finally {
      setLoading(false);
    }
  }, [getReservation]); // Add getReservation to the dependency array

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // Function to fetch reservation lines
  const fetchReservationLines = async (reservationId: number) => {
    try {
      //  Verify if the lines are already fetched
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

  // Fonction pour annuler une réservation
  const handleMarkAsRetrieved = async (reservationId: number) => {
    setLoading(true);
    try {
      await changeStatusAsRetrieved(reservationId);
      // Refresh reservations after cancellation
      fetchReservations();
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation:", error);
      setError(
        "Impossible d'annuler la réservation. Veuillez réessayer plus tard.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsAbandoned = async (reservationId: number) => {
    setLoading(true);
    try {
      await changeStatusAsAbandoned(reservationId);
      // Refresh reservations after cancellation
      fetchReservations();
    } catch (error) {
      console.error("Erreur lors de l'annulation de la réservation:", error);
      setError(
        "Impossible d'annuler la réservation. Veuillez réessayer plus tard.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate the total price of a reservation line
  const calculateLineTotal = (line: ReservationLine): number => {
    return line.quantity * line.batch.pricePerUnit;
  };

  // Function to calculate the total price of all lines in a reservation
  const calculateReservationTotal = (lines: ReservationLine[]): number => {
    return lines.reduce((total, line) => total + calculateLineTotal(line), 0);
  };

  // Render a line of reservation
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
                  {line.batch.product.unit.name}
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

  // Rendu d'une section de réservations
  const renderReservationsSection = (
    reservationsUser: ReservationUser[],
    showCancelButton: boolean,
  ) => {
    if (reservationsUser.length === 0) {
      return (
        <div>
          <Typography variant="body1" color="text.secondary">
            Aucune réservation à afficher.
          </Typography>
        </div>
      );
    }

    return (
      <div>
        <Grid container spacing={2}>
          {reservationsUser.map((reservation) => (
            <Grid size={{ xs: 12 }} key={reservation.reservation.idReservation}>
              <Card
                sx={{
                  borderRadius: '15px',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Accordion
                  expanded={
                    expandedReservation ===
                    reservation.reservation.idReservation
                  }
                  onChange={() =>
                    handleAccordionToggle(reservation.reservation.idReservation)
                  }
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${reservation.reservation.idReservation}-content`}
                    id={`panel-${reservation.reservation.idReservation}-header`}
                  >
                    <Typography variant="h6">
                      commande n° {reservation.reservation.idReservation}
                      <Typography
                        component="span"
                        sx={{ marginLeft: 8, display: 'inline' }}
                      >
                        client: {reservation.honorific} {reservation.name}
                      </Typography>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {expandedReservation ===
                    reservation.reservation.idReservation ? (
                      reservationLines[
                        reservation.reservation.idReservation
                      ] ? (
                        renderReservationLines(
                          reservation.reservation.idReservation,
                        )
                      ) : (
                        <CircularProgress size={24} />
                      )
                    ) : null}

                    {showCancelButton && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '16px',
                        }}
                      >
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() =>
                            handleMarkAsRetrieved(
                              reservation.reservation.idReservation,
                            )
                          }
                        >
                          Récupérée
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            handleMarkAsAbandoned(
                              reservation.reservation.idReservation,
                            )
                          }
                        >
                          Abandonnée
                        </Button>
                      </div>
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
        Commandes du jour
      </Typography>

      {loading && <CircularProgress />}

      {error && (
        <Alert severity="error" sx={{ marginY: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <>{renderReservationsSection(reservationsUser, true)}</>
      )}
    </Container>
  );
};

export default ReservationPage;
