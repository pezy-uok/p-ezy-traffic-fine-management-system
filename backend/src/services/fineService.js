import { AppError } from '../utils/errors.js';

const notImplemented = (methodName) => {
  throw new AppError(`FineService.${methodName} is not implemented yet`, 501);
};

export const createFine = async () => {
  return notImplemented('createFine');
};

export const getFineById = async () => {
  return notImplemented('getFineById');
};

export const getFinesByLicense = async () => {
  return notImplemented('getFinesByLicense');
};

export const getOutdatedFines = async () => {
  return notImplemented('getOutdatedFines');
};

export const updateFineStatus = async () => {
  return notImplemented('updateFineStatus');
};
