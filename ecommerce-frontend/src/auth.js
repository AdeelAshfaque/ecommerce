export const getTokenData = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export const getUserId = () => {
  const data = getTokenData();
  return data ? data.id : null;
};

export const getUserEmail = () => {
  const data = getTokenData();
  return data ? data.email : null;
};

export const getUserRole = () => {
  const data = getTokenData();
  return data ? data.role : null;
};

export const isAdmin = () => {
  return getUserRole() === 'admin';
};