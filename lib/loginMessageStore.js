// lib/loginMessageStore.js
let lastLoginErrorMessage = null;

export const setLoginErrorMessage = (message) => {
  lastLoginErrorMessage = message;
};

export const getLoginErrorMessage = () => {
  const msg = lastLoginErrorMessage;
  lastLoginErrorMessage = null; // clear after reading
  return msg;
};
