import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

export interface Wallet {
  address: string;
  privateKey: string;
  publicKey: string;
  mnemonic?: string;
  network: string;
}

export interface Transaction {
  fromAddress: string;
  toAddress: string;
  amount: number;
  hash: string;
  signature: string;
  timestamp: number;
  network: string;
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  symbol: string;
}

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);

  private readonly networks: Record<string, NetworkInfo> = {
    ethereum: {
      name: 'Ethereum Mainnet',
      chainId: 1,
      rpcUrl: 'https://mainnet.infura.io/v3/',
      explorerUrl: 'https://etherscan.io',
      symbol: 'ETH',
    },
    sepolia: {
      name: 'Ethereum Sepolia Testnet',
      chainId: 11155111,
      rpcUrl: 'https://sepolia.infura.io/v3/',
      explorerUrl: 'https://sepolia.etherscan.io',
      symbol: 'SEP',
    },
    polygon: {
      name: 'Polygon Mainnet',
      chainId: 137,
      rpcUrl: 'https://polygon-rpc.com/',
      explorerUrl: 'https://polygonscan.com',
      symbol: 'MATIC',
    },
    mumbai: {
      name: 'Polygon Mumbai Testnet',
      chainId: 80001,
      rpcUrl: 'https://rpc-mumbai.maticvigil.com/',
      explorerUrl: 'https://mumbai.polygonscan.com',
      symbol: 'MATIC',
    },
    bsc: {
      name: 'BNB Smart Chain',
      chainId: 56,
      rpcUrl: 'https://bsc-dataseed.binance.org/',
      explorerUrl: 'https://bscscan.com',
      symbol: 'BNB',
    },
  };

  generateWallet(network: string = 'ethereum'): Wallet {
    this.logger.log(`Generating wallet for network: ${network}`);

    const networkInfo = this.networks[network] || this.networks.ethereum;
    const privateKey = crypto.randomBytes(32).toString('hex');
    const publicKey = this.getPublicKeyFromPrivate(privateKey);
    const address = this.getAddressFromPublicKey(publicKey, network);

    return {
      address,
      privateKey,
      publicKey,
      mnemonic: this.generateMnemonic(),
      network: networkInfo.name,
    };
  }

  createTransaction(
    fromAddress: string,
    toAddress: string,
    amount: number,
    privateKey: string,
    network: string = 'ethereum',
  ): Transaction {
    this.logger.log(
      `Creating transaction: ${amount} from ${fromAddress} to ${toAddress}`,
    );

    if (!this.validateAddress({ address: fromAddress, network })) {
      throw new Error('Invalid sender address');
    }

    if (!this.validateAddress({ address: toAddress, network })) {
      throw new Error('Invalid recipient address');
    }

    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const timestamp = Date.now();
    const txData = `${fromAddress}${toAddress}${amount}${timestamp}`;
    const signature = this.signData(txData, privateKey);
    const hash = this.hashData(txData + signature);

    return {
      fromAddress,
      toAddress,
      amount,
      hash,
      signature,
      timestamp,
      network: this.networks[network]?.name || 'Unknown',
    };
  }

  async getBalance(
    address: string,
    network: string = 'ethereum',
  ): Promise<{ balance: string; network: string; symbol: string }> {
    this.logger.log(`Getting balance for address: ${address} on ${network}`);

    if (!this.validateAddress({ address, network })) {
      throw new Error('Invalid address format');
    }

    const networkInfo = this.networks[network] || this.networks.ethereum;

    return {
      balance: '0.0',
      network: networkInfo.name,
      symbol: networkInfo.symbol,
    };
  }

  validateAddress(data: { address: string; network?: string }): boolean {
    const { address, network = 'ethereum' } = data;

    if (!address || typeof address !== 'string') {
      return false;
    }

    const checksum = address.slice(0, 2) === '0x';

    if (network === 'ethereum' || network === 'sepolia') {
      return checksum && address.length === 42;
    }

    if (network === 'polygon' || network === 'mumbai') {
      return checksum && address.length === 42;
    }

    if (network === 'bsc') {
      return checksum && address.length === 42;
    }

    return address.length >= 20 && address.length <= 44;
  }

  getNetworkInfo(network: string = 'ethereum'): NetworkInfo {
    this.logger.log(`Getting network info for: ${network}`);
    return this.networks[network] || this.networks.ethereum;
  }

  signMessage(
    message: string,
    privateKey: string,
  ): { signature: string; message: string } {
    this.logger.log('Signing message');

    if (!message) {
      throw new Error('Message cannot be empty');
    }

    if (!privateKey || privateKey.length !== 64) {
      throw new Error('Invalid private key format');
    }

    const signature = this.signData(message, privateKey);

    return {
      signature,
      message,
    };
  }

  verifySignature(
    message: string,
    signature: string,
    address: string,
  ): boolean {
    this.logger.log('Verifying signature');

    if (!message || !signature || !address) {
      return false;
    }

    const derivedAddress = this.recoverAddressFromSignature(message, signature);

    return derivedAddress.toLowerCase() === address.toLowerCase();
  }

  async estimateGas(
    fromAddress: string,
    toAddress: string,
    amount: number,
    network: string = 'ethereum',
  ): Promise<{ gasLimit: number; gasPrice: string; estimatedCost: string }> {
    this.logger.log(`Estimating gas for transaction on ${network}`);

    const baseGasLimit = 21000;
    const dataGasLimit = 0;

    const gasLimit = baseGasLimit + dataGasLimit;
    const gasPrice = '0.000000020';

    const estimatedCost = (gasLimit * parseFloat(gasPrice)).toFixed(8);

    return {
      gasLimit,
      gasPrice,
      estimatedCost,
    };
  }

  async getTransactionReceipt(
    txHash: string,
    network: string = 'ethereum',
  ): Promise<{
    hash: string;
    status: string;
    blockNumber: number;
    network: string;
    confirmations: number;
  } | null> {
    this.logger.log(`Getting transaction receipt: ${txHash}`);

    if (!txHash || txHash.length !== 66) {
      return null;
    }

    return {
      hash: txHash,
      status: 'confirmed',
      blockNumber: 12345678,
      network: this.networks[network]?.name || 'Unknown',
      confirmations: 10,
    };
  }

  convertAddress(
    address: string,
    from: string,
    to: string,
  ): {
    original: string;
    converted: string;
    fromFormat: string;
    toFormat: string;
  } {
    this.logger.log(`Converting address from ${from} to ${to}`);

    if (!address) {
      throw new Error('Address cannot be empty');
    }

    let converted = address;

    if (from === 'hex' && to === 'base58') {
      converted = this.hexToBase58(address);
    } else if (from === 'base58' && to === 'hex') {
      converted = this.base58ToHex(address);
    }

    return {
      original: address,
      converted,
      fromFormat: from,
      toFormat: to,
    };
  }

  private getPublicKeyFromPrivate(privateKey: string): string {
    const hash = this.hashData(privateKey);
    return '0x' + hash.slice(0, 64);
  }

  private getAddressFromPublicKey(publicKey: string, network: string): string {
    const hash = this.hashData(publicKey);
    const address = '0x' + hash.slice(24);
    return address.toLowerCase();
  }

  private generateMnemonic(): string {
    const words = [
      'abandon',
      'ability',
      'able',
      'about',
      'above',
      'absent',
      'absorb',
      'abstract',
      'absurd',
      'abuse',
      'access',
      'accident',
      'account',
      'accuse',
      'achieve',
      'acid',
      'acoustic',
      'acquire',
      'across',
      'act',
      'action',
      'actor',
      'actress',
      'actual',
    ];
    const mnemonic = [];
    for (let i = 0; i < 12; i++) {
      mnemonic.push(words[Math.floor(Math.random() * words.length)]);
    }
    return mnemonic.join(' ');
  }

  private signData(data: string, privateKey: string): string {
    const hmac = crypto.createHmac('sha256', privateKey);
    hmac.update(data);
    return hmac.digest('hex');
  }

  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private recoverAddressFromSignature(
    message: string,
    signature: string,
  ): string {
    const hash = this.hashData(message);
    const prefix = signature.slice(0, 8);
    return '0x' + this.hashData(hash + prefix).slice(24);
  }

  private hexToBase58(hex: string): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    let num = BigInt('0x' + cleanHex);
    while (num > 0n) {
      const idx = Number(num % 58n);
      result = chars[idx] + result;
      num = num / 58n;
    }
    return result || '0';
  }

  private base58ToHex(base58: string): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = 0n;
    for (let i = 0; i < base58.length; i++) {
      const idx = chars.indexOf(base58[i]);
      if (idx === -1) {
        throw new Error('Invalid base58 character');
      }
      result = result * 58n + BigInt(idx);
    }
    return '0x' + result.toString(16);
  }
}
