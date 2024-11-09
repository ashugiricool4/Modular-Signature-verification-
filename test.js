import { expect } from 'chai';
import { ethers } from 'ethers';
import { signatureVerifier, SignatureScheme } from './signatureVerifier.js';

describe('Enhanced Signature Verifier', () => {
  let testData;

  before(async () => {
    const wallet = ethers.Wallet.createRandom();
    const message = 'Hello, World!';
    const messageHash = ethers.hashMessage(message);
    const signature = await wallet.signMessage(message);

    testData = {
      wallet,
      message,
      messageHash,
      signature
    };
  });

  describe('Signature Scheme Detection', () => {
    it('should automatically detect ECDSA signatures', async () => {
      const result = signatureVerifier(
        testData.wallet.address,
        testData.signature,
        testData.messageHash
      );
      expect(result).to.be.true;
    });

    it('should handle explicit scheme specification', async () => {
      const result = signatureVerifier(
        testData.wallet.address,
        testData.signature,
        testData.messageHash,
        SignatureScheme.ECDSA
      );
      expect(result).to.be.true;
    });
    
    it('should detect invalid signature schemes', async () => {
      // Modify the signature to look like a different scheme
      const modifiedSig = testData.signature.slice(0, -2); // Remove last byte
      const result = signatureVerifier(
        testData.wallet.address,
        modifiedSig,
        testData.messageHash
      );
      expect(result).to.be.false;
    });
  });

  describe('Gas and Performance Optimization', () => {
    it('should quickly reject invalid inputs', () => {
      const startTime = process.hrtime();
      const result = signatureVerifier(
        'invalid-address',
        testData.signature,
        testData.messageHash
      );
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const executionTime = seconds * 1000 + nanoseconds / 1000000;
      
      expect(result).to.be.false;
      expect(executionTime).to.be.below(1); // Should take less than 1ms
    });

    it('should have consistent performance for valid signatures', () => {
      const times = [];
      for (let i = 0; i < 5; i++) {
        const startTime = process.hrtime();
        signatureVerifier(
          testData.wallet.address,
          testData.signature,
          testData.messageHash
        );
        const [seconds, nanoseconds] = process.hrtime(startTime);
        times.push(seconds * 1000 + nanoseconds / 1000000);
      }
      
      // Calculate standard deviation
      const avg = times.reduce((a, b) => a + b) / times.length;
      const variance = times.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / times.length;
      const stdDev = Math.sqrt(variance);
      
      // Ensure consistent performance (low standard deviation)
      expect(stdDev).to.be.below(1); // Standard deviation should be less than 1ms
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty signature', () => {
      const result = signatureVerifier(
        testData.wallet.address,
        '0x',
        testData.messageHash
      );
      expect(result).to.be.false;
    });

    it('should handle malformed signature', () => {
      const result = signatureVerifier(
        testData.wallet.address,
        '0x1234',
        testData.messageHash
      );
      expect(result).to.be.false;
    });

    it('should handle null inputs gracefully', () => {
      expect(signatureVerifier(null, null, null)).to.be.false;
      expect(signatureVerifier(undefined, undefined, undefined)).to.be.false;
    });
  });

  describe('Security and Validation', () => {
    it('should reject signature replay', async () => {
      const differentMessage = 'Different message';
      const differentHash = ethers.hashMessage(differentMessage);
      
      const result = signatureVerifier(
        testData.wallet.address,
        testData.signature,
        differentHash
      );
      expect(result).to.be.false;
    });

    it('should reject modified signatures', async () => {
      // Modify one byte in the middle of the signature
      const modifiedSig = testData.signature.slice(0, 70) + 'ff' + testData.signature.slice(72);
      const result = signatureVerifier(
        testData.wallet.address,
        modifiedSig,
        testData.messageHash
      );
      expect(result).to.be.false;
    });
  });

  describe('Recovery and Verification', () => {
    it('should recover the correct signer address', async () => {
      const recoveredResult = signatureVerifier(
        testData.wallet.address,
        testData.signature,
        testData.messageHash
      );
      expect(recoveredResult).to.be.true;
    });

    it('should fail with wrong signer address', async () => {
      const wrongAddress = '0x' + '1'.repeat(40); // Different address
      const result = signatureVerifier(
        wrongAddress,
        testData.signature,
        testData.messageHash
      );
      expect(result).to.be.false;
    });
  });
});