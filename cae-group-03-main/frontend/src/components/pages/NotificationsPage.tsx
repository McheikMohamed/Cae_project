import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { BatchContext } from '../../contexts/BatchContext';
import {
  fetchNotificationsAPI,
  markNotificationAsRead,
} from '../../services/notificationApi';
import { Notification } from '../../types';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import Grid from '@mui/material/Grid';

const NotificationsPage = () => {
  const { authenticatedUser } = useContext(UserContext);
  const { batchs } = useContext(BatchContext);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      if (!authenticatedUser) return;
      try {
        const data = await fetchNotificationsAPI(authenticatedUser.token);
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };
    loadNotifications();
  }, [authenticatedUser]);

  useEffect(() => {
    console.log('Notifications state updated:', notifications);
  }, [notifications]);

  const handleReadToggle = async (id: number) => {
    console.log('Toggling read status for notification ID:', id);
    const notif = notifications.find((n) => n.id === id);
    if (!notif) return;
    const newRead = !notif.read;

    try {
      if (newRead) {
        await markNotificationAsRead(id, authenticatedUser!.token);
      }
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: newRead } : n)),
      );
    } catch (err) {
      console.error('Failed to update read status:', err);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mes Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Typography variant="body1">Aucune notification disponible.</Typography>
      ) : (
        <Grid container spacing={2}>
          {notifications.map((notification) => {
            const batch = batchs.find(
              (b) => b.idBatch === notification.batchId,
            );
            return (
              <Grid item xs={12} key={notification.id}>
                <Card>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: notification.read ? 'normal' : 'bold',
                          }}
                        >
                          {notification.message}
                        </Typography>
                        {notification.read && (
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{ marginLeft: 1 }}
                          >
                            Lu
                          </Typography>
                        )}
                      </Box>
                      <Checkbox
                        checked={notification.read}
                        onChange={() => handleReadToggle(notification.id)}
                        disabled={notification.read}
                        inputProps={{
                          'aria-label': 'Marquer comme lue',
                        }}
                      />
                    </Box>

                    {notification.reasonOfReject && (
                      <Typography variant="body2" color="error">
                        Raison du rejet : {notification.reasonOfReject}
                      </Typography>
                    )}

                    {batch ? (
                      <Typography variant="body2">
                        Produit : {batch.product.name}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        Lot introuvable
                      </Typography>
                    )}

                    <Typography variant="body2" color="textSecondary">
                      Date :{' '}
                      {new Date(notification.date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default NotificationsPage;
