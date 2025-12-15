export const getEnv = (key) => {
  if (window.config && window.config[key]) {
    return window.config[key];
  }
  return process.env[key];
};
