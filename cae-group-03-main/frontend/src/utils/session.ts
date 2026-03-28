import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types';

const storeAuthenticatedUser = (
  authenticatedUser: AuthenticatedUser,
  rememberMe: boolean,
) => {
  if (rememberMe) {
    localStorage.setItem(
      'authenticatedUser',
      JSON.stringify(authenticatedUser),
    );
  }
  sessionStorage.setItem(
    'authenticatedUser',
    JSON.stringify(authenticatedUser),
  );
};

const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  const authenticatedUser = localStorage.getItem('authenticatedUser');

  if (!authenticatedUser) return undefined;

  return JSON.parse(authenticatedUser);
};

const clearAuthenticatedUser = () => {
  localStorage.removeItem('authenticatedUser');
  sessionStorage.removeItem('authenticatedUser');
};

export { storeAuthenticatedUser, getAuthenticatedUser, clearAuthenticatedUser };
