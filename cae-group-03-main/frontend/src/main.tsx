import React from 'react';
import ReactDOM from 'react-dom/client';

import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './components/App/index.tsx';
import RegisterPage from './components/pages/RegisterPage.tsx';
import HomePage from './components/pages/HomePage.tsx';
import LoginPage from './components/pages/LoginPage.tsx';
import ProfilePage from './components/pages/ProfilePage.tsx';
import ChangePasswordPage from './components/pages/ChangePasswordPage.tsx';
import CreateBatchPage from './components/pages/CreateBatchPage.tsx';
import RegisterPageAdmin from './components/pages/RegisterPageAdmin.tsx';
import BatchHistoryPage from './components/pages/BatchHistoryPage.tsx';
import BatchDetailPage from './components/pages/BatchDetailPage.tsx';
import BasketPage from './components/pages/BasketPage.tsx';
import ReservationPage from './components/pages/ReservationPage.tsx';
import ManageBatchesPage from './components/pages/ManageBatchesPage.tsx';
import NotificationsPage from './components/pages/NotificationsPage.tsx';
import Dashboard from './components/pages/DashboardPage.tsx';
import ChartBatchPage from './components/pages/ChartBatchPage.tsx';
import AllBatchesPage from './components/pages/AllBatchesPage.tsx';
import BatchInfoPage from './components/pages/BatchInfoPage.tsx';
import { UserContextProvider } from './contexts/UserContext.tsx';
import ReservationPageBenevol from './components/pages/ReservationPageBenevol.tsx';
import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes.ts';
import { BatchContextProvider } from './contexts/BatchContext.tsx';
import VenteLibre from './components/pages/FreeSalePage.tsx';
import UpdateBatchQuantityPage from './components/pages/UpdateBatchQuantityPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '',
        element: <HomePage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'change-password',
        element: <ChangePasswordPage />,
      },
      {
        path: 'create-batch',
        element: <CreateBatchPage />,
      },
      {
        path: 'register-admin',
        element: <RegisterPageAdmin />,
      },
      {
        path: 'batch/:batchId',
        element: <BatchDetailPage />,
      },
      {
        path: 'batch-history',
        element: <BatchHistoryPage />,
      },
      {
        path: 'BasketPage',
        element: <BasketPage />,
      },
      {
        path: 'reservation',
        element: <ReservationPage />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'chart-batch/:batchId',
        element: <ChartBatchPage />,
      },
      {
        path: 'manage-batches',
        element: <ManageBatchesPage />,
      },
      {
        path: 'notifications',
        element: <NotificationsPage />,
      },
      {
        path: 'all-batches',
        element: <AllBatchesPage />,
      },
      {
        path: 'reservation-benevol',
        element: <ReservationPageBenevol />,
      },
      {
        path: 'vente-libre',
        element: <VenteLibre />,
      },
      {
        path: 'batch-info/:batchId',
        element: <BatchInfoPage />,
      },
      {
        path: 'update-batch-quantity',
        element: <UpdateBatchQuantityPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Global CSS reset from Material-UI */}
      <UserContextProvider>
        <BatchContextProvider>
          <RouterProvider router={router} />
        </BatchContextProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
