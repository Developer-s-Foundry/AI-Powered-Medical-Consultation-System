import CryptoJS from "crypto-js";
import logger from "./logger";

export class EncryptionService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || "";

    if (!this.encryptionKey) {
      logger.warn(" ENCRYPTION_KEY not set in environment variables");
    }

    // Ensure key is 32 bytes for AES-256
    if (this.encryptionKey.length < 32) {
      logger.warn(
        "ENCRYPTION_KEY should be at least 32 characters for AES-256",
      );
    }
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string): string {
    try {
      if (!data) return "";

      const encrypted = CryptoJS.AES.encrypt(
        data,
        this.encryptionKey,
      ).toString();
      return encrypted;
    } catch (error) {
      logger.error("Encryption error:", error);
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string): string {
    try {
      if (!encryptedData) return "";

      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error("Decryption error:", error);
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Encrypt bank details object
   */
  encryptBankDetails(bankDetails: {
    businessName: string;
    bankCode: string;
    accountNumber: string;
    accountName?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
  }): {
    businessName: string;
    bankCode: string;
    accountNumber: string; // Encrypted
    accountName?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
  } {
    return {
      ...bankDetails,
      accountNumber: this.encrypt(bankDetails.accountNumber), // Encrypt account number
      accountName: bankDetails.accountName
        ? this.encrypt(bankDetails.accountName)
        : undefined, // Encrypt account name
    };
  }

  /**
   * Decrypt bank details object
   */
  decryptBankDetails(encryptedBankDetails: {
    businessName: string;
    bankCode: string;
    accountNumber: string;
    accountName?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
  }): {
    businessName: string;
    bankCode: string;
    accountNumber: string;
    accountName?: string;
    isVerified?: boolean;
    verifiedAt?: Date;
  } {
    return {
      ...encryptedBankDetails,
      accountNumber: this.decrypt(encryptedBankDetails.accountNumber), // Decrypt account number
      accountName: encryptedBankDetails.accountName
        ? this.decrypt(encryptedBankDetails.accountName)
        : undefined, // Decrypt account name
    };
  }

  /**
   * Mask account number for display (show only last 4 digits)
   */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 4) return "****";

    const lastFour = accountNumber.slice(-4);
    const masked = "*".repeat(accountNumber.length - 4) + lastFour;
    return masked;
  }
}

export default new EncryptionService();
