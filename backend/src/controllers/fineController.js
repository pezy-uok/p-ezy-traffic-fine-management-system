const notImplemented = (req, res) => {
  return res.status(501).json({
    success: false,
    message: 'Fine controller not implemented yet',
  });
};

export const createFine = notImplemented;
export const getFineById = notImplemented;
export const getFinesByLicense = notImplemented;
export const getOutdatedFines = notImplemented;
export const updateFineStatus = notImplemented;