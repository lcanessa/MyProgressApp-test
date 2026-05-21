export const toLocalISODate = (dateObj) => {
  const tzOffset = dateObj.getTimezoneOffset() * 60000;
  return new Date(dateObj.getTime() - tzOffset).toISOString().split('T')[0];
};
