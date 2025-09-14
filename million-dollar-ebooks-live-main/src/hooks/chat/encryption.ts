
// Simple encryption/decryption functions (same as private chat)
export const encryptMessage = (message: string): string => {
  return btoa(message); // Base64 encoding for simple encryption
};

export const decryptMessage = (encryptedMessage: string): string => {
  try {
    return atob(encryptedMessage); // Base64 decoding
  } catch {
    return 'Message could not be decrypted';
  }
};
