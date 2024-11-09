# Modular Signature Verification System

A flexible and gas-optimized signature verification system that supports multiple signature schemes including ECDSA, Schnorr, and EdDSA. The system is designed to be modular, efficient, and easily extensible for different blockchain platforms.

## Features

- Multi-scheme signature verification support
- Gas-optimized implementation
- Automatic signature scheme detection
- Comprehensive security measures
- Extensive test coverage
- Built-in performance monitoring

## Supported Signature Schemes

- ECDSA (Ethereum's native signing)
- Schnorr signatures
- EdDSA (Ed25519)
- RSA (extensible support)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ashugiricool4/modular-signature-verification.git
cd modular-signature-verification
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Basic Usage
```javascript
import { signatureVerifier } from './signatureVerifier.js';

// Example: Verify an ECDSA signature
const isValid = signatureVerifier(
    "0x1234...", // Signer address
    "0xabcd...", // Signature bytes
    "0xef12..."  // Message hash
);

console.log("Signature valid:", isValid);
```

### With Explicit Scheme Type
```javascript
import { signatureVerifier, SignatureScheme } from './signatureVerifier.js';

// Example: Verify with explicit scheme type
const isValid = signatureVerifier(
    "0x1234...",           // Signer address
    "0xabcd...",           // Signature bytes
    "0xef12...",           // Message hash
    SignatureScheme.ECDSA  // Explicit scheme type
);
```

## Testing

Run the comprehensive test suite:
```bash
npm test
```

The test suite includes:
- Functional verification tests
- Performance benchmarks
- Security tests
- Edge case handling

## Performance

### Average Execution Times
- ECDSA Verification: ~0.5ms
- Scheme Detection: ~0.2ms
- Full Verification Pipeline: ~0.8ms

### Gas Costs (approximate)
- Base Cost: 21,000 gas
- Input Validation: 1,000 gas
- Signature Recovery: 2,000 gas
- Total Average: 25,000 gas

## API Reference

### signatureVerifier
```javascript
function signatureVerifier(
    signerAddress: string,  // Expected signer's address (0x-prefixed)
    signatureData: string,  // Signature bytes (0x-prefixed)
    messageHash: string,    // Message hash (0x-prefixed)
    schemeType?: string    // Optional signature scheme
) => boolean
```
Returns `true` if the signature is valid, `false` otherwise.

### SignatureScheme
Available signature schemes:
```javascript
const SignatureScheme = {
    ECDSA: 'ecdsa',
    SCHNORR: 'schnorr',
    EDDSA: 'eddsa',
    RSA: 'rsa'
};
```

## Security Considerations

- Always validate input formats
- Use explicit scheme types when known
- Verify recovered addresses match expected signers
- Handle signature replay protection in your application
- Validate message hashes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Best Practices

### Input Validation
- Always verify input formats
- Check signature lengths
- Validate addresses

### Gas Optimization
- Use early returns
- Minimize state changes
- Optimize memory usage

### Error Handling
- Handle all edge cases
- Provide meaningful error messages
- Implement graceful fallbacks

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ for the blockchain community.