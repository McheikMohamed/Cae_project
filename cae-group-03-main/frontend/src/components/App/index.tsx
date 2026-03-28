import { Outlet /* useLocation*/ } from 'react-router-dom';
import NavBar from '../Navbar';
import Box from '@mui/material/Box';
import { Container } from '@mui/material';
import Footer from '../Footer';
/*
import { useContext, useEffect } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';
*/

const App = () => {
  /*
  const { updateToken, authenticatedUser } = useContext(
    UserContext,
  ) as UserContextType;
  const location = useLocation();

  useEffect(() => {
    // à chaque changement de page, on met à jour le token
    if (authenticatedUser?.token) {
      updateToken();
    }
  }, [location, authenticatedUser, updateToken]);
*/
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#F5F1E8',
        marginTop: '64px',
      }}
    >
      <Container component="main" sx={{ flex: '1' }}>
        <NavBar />
        <Outlet />
      </Container>
      <Footer />
    </Box>
  );
};

export default App;
