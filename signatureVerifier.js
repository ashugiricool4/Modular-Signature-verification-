import { ethers } from 'ethers';
import { secp256k1 } from '@noble/curves/secp256k1';
import { ed25519 } from '@noble/curves/ed25519';
import { sha256 } from '@noble/hashes/sha256';

export const SignatureScheme = {
  ECDSA: 'ecdsa',
  SCHNORR: 'schnorr',
  EDDSA: 'eddsa',
  RSA: 'rsa'
};

/**
 * Parses signature components from bytes
 * @param {string} signatureData - Hex string of signature
 * @returns {Object} Parsed signature components
 */
function parseSignature(signatureData) {
  // Remove 0x prefix if present
  const sig = signatureData.startsWith('0x') ? signatureData.slice(2) : signatureData;
  
  // Common signature formats:
  // ECDSA: 65 bytes (r[32] + s[32] + v[1])
  // Schnorr: 64 bytes (r[32] + s[32])
  // EdDSA: 64 bytes (R[32] + s[32])
  // RSA: variable length
  
  if (sig.length === 130) { // ECDSA
    return {
      type: SignatureScheme.ECDSA,
      r: '0x' + sig.slice(0, 64),
      s: '0x' + sig.slice(64, 128),
      v: parseInt(sig.slice(128, 130), 16)
    };
  } else if (sig.length === 128) { // Schnorr or EdDSA
    const firstByte = parseInt(sig.slice(0, 2), 16);
    // EdDSA typically has a specific range for the first byte
    return {
      type: firstByte > 0x7F ? SignatureScheme.EDDSA : SignatureScheme.SCHNORR,
      r: '0x' + sig.slice(0, 64),
      s: '0x' + sig.slice(64, 128)
    };
  } else {
    // Assume RSA for other lengths
    return {
      type: SignatureScheme.RSA,
      signature: sig
    };
  }
}

/**
 * Verifies a digital signature
 * @param {string} signerAddress - Expected signer's address
 * @param {string} signatureData - Signature bytes in hex
 * @param {string} messageHash - Message hash in hex
 * @param {string} [schemeType] - Optional signature scheme override
 * @returns {boolean} - Verification result
 */
export function signatureVerifier(signerAddress, signatureData, messageHash, schemeType = null) {
  try {
    // Early validations for gas optimization
    if (!signerAddress?.startsWith('0x') || 
        !signatureData?.startsWith('0x') || 
        !messageHash?.startsWith('0x')) {
      return false;
    }

    // Parse signature components
    const signature = parseSignature(signatureData);
    const actualScheme = schemeType?.toLowerCase() || signature.type;

    // Use specific verification based on scheme
    switch (actualScheme) {
      case SignatureScheme.ECDSA:
        return verifyECDSA(signerAddress.toLowerCase(), signature, messageHash);
      case SignatureScheme.SCHNORR:
        return verifySchnorr(signerAddress.toLowerCase(), signature, messageHash);
      case SignatureScheme.EDDSA:
        return verifyEdDSA(signerAddress.toLowerCase(), signature, messageHash);
      case SignatureScheme.RSA:
        return verifyRSA(signerAddress.toLowerCase(), signature, messageHash);
      default:
        return false;
    }
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

function verifyECDSA(signerAddress, signature, messageHash) {
  try {
    const recoveredAddress = ethers.recoverAddress(
      messageHash,
      { r: signature.r, s: signature.s, v: signature.v }
    ).toLowerCase();
    return recoveredAddress === signerAddress;
  } catch {
    return false;
  }
}

function verifySchnorr(signerAddress, signature, messageHash) {
  try {
    const msgHashBytes = Uint8Array.from(Buffer.from(messageHash.slice(2), 'hex'));
    const rBytes = Uint8Array.from(Buffer.from(signature.r.slice(2), 'hex'));
    const sBytes = Uint8Array.from(Buffer.from(signature.s.slice(2), 'hex'));
    
    // Get public key from address (simplified)
    const publicKey = ethers.computePublicKey(signerAddress, true);
    
    return secp256k1.schnorr.verify(rBytes, msgHashBytes, sBytes, publicKey);
  } catch {
    return false;
  }
}

function verifyEdDSA(signerAddress, signature, messageHash) {
  try {
    const msgHashBytes = Uint8Array.from(Buffer.from(messageHash.slice(2), 'hex'));
    const sigBytes = Uint8Array.from(Buffer.from(signature.r.slice(2) + signature.s.slice(2), 'hex'));
    const publicKeyBytes = Uint8Array.from(Buffer.from(signerAddress.slice(2), 'hex'));
    
    return ed25519.verify(sigBytes, msgHashBytes, publicKeyBytes);
  } catch {
    return false;
  }
}

function verifyRSA(signerAddress, signature, messageHash) {
  // RSA verification implementation
  // Note: This is a placeholder. Real implementation would use node:crypto
  try {
    // Example RSA verification logic
    return false; // Placeholder
  } catch {
    return false;
  }
}