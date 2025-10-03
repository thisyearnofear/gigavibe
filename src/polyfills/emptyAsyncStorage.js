// Simple no-op AsyncStorage shim for browser environment
// This prevents MetaMask SDK from failing when trying to import React Native's AsyncStorage
const emptyAsyncStorage = {
  getItem: async () => null,
  setItem: async () => {},
  removeItem: async () => {},
  clear: async () => {},
  getAllKeys: async () => [],
  multiGet: async () => [],
  multiSet: async () => {},
  multiRemove: async () => {},
  multiMerge: async () => {},
};

export default emptyAsyncStorage;
