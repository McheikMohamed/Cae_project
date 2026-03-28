import { Box, Container, Typography } from '@mui/material';
import { Copyright } from '@mui/icons-material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        backgroundColor: '#2E5635',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          <Copyright /> {new Date().getFullYear()} L'Atelier du Goût. Tous
          droits réservés.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
