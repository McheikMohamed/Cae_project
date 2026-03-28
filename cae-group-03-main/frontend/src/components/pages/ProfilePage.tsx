import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import { Email, Phone, Home, Edit, Business } from '@mui/icons-material';
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../contexts/UserContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  // get user from context
  const [loading, setLoading] = useState(true); // handle loading state
  const [error, setError] = useState<string | null>(null); // errors

  useEffect(() => {
    if (user) {
      setLoading(false); // if user is defined, set loading to false
    } else {
      setError('Utilisateur non authentifié. Veuillez vous connecter.');
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h6">Chargement...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="md"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '80%',
          maxWidth: '600px',
          minHeight: '70vh',
          padding: 5,
          borderRadius: '20px',
          textAlign: 'center',
          backgroundColor: '#f9f9f9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Avatar
          sx={{ width: 120, height: 120, bgcolor: '#2E5635', fontSize: 50 }}
        >
          {user?.firstName.charAt(0)}.{user?.lastName.charAt(0)}
        </Avatar>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="h4" sx={{ color: '#2E5635' }}>
            {user?.honorific} {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {user?.email}
          </Typography>

          {/* display company */}
          {user?.role === 'PRODUCER' && (
            <Box sx={{ textAlign: 'left', width: '100%' }}>
              <Typography
                variant="h6"
                sx={{ color: '#D67F65', display: 'flex', alignItems: 'center' }}
              >
                Entreprise
              </Typography>
              <Business sx={{ verticalAlign: 'middle', color: '#2E5635' }} />{' '}
              {user?.company}
            </Box>
          )}
        </Box>

        <Divider sx={{ width: '100%', my: 2 }} />

        <Box sx={{ textAlign: 'left', width: '100%' }}>
          <Typography variant="h6" sx={{ color: '#D67F65', mb: 1 }}>
            Contact
          </Typography>
          <Typography>
            <Phone sx={{ verticalAlign: 'middle', color: '#2E5635' }} />{' '}
            {user?.phoneNumber}
          </Typography>
          <Typography>
            <Email sx={{ verticalAlign: 'middle', color: '#2E5635' }} />{' '}
            {user?.email}
          </Typography>
        </Box>

        <Divider sx={{ width: '100%', my: 2 }} />

        <Box sx={{ textAlign: 'left', width: '100%' }}>
          <Typography variant="h6" sx={{ color: '#D67F65', mb: 1 }}>
            Adresse
          </Typography>
          <Typography>
            <Home sx={{ verticalAlign: 'middle', color: '#2E5635' }} />{' '}
            {user?.address.street}, {user?.address.number}, {user?.address.box}
          </Typography>
          <Typography>
            {user?.address.postalCode} {user?.address.city},{' '}
            {user?.address.country.name}
          </Typography>
        </Box>

        <Button
          variant="contained"
          sx={{
            bgcolor: '#D67F65',
            '&:hover': { backgroundColor: '#C66B58' },
            mt: 3,
            borderRadius: '20px',
            width: '80%',
          }}
          startIcon={<Edit />}
          onClick={() => navigate('/change-password')}
        >
          Changer de mot de passe
        </Button>
      </Paper>
    </Container>
  );
};
export default Profile;
