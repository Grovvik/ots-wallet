import CryptoUtils from './crypto';

export class Transaction {
    /**
     * @param {object} params
     * @param {('transfer' | 'deploy' | 'call' | 'stake')} params.type
     * @param {string} params.from
     * @param {string} params.to
     * @param {bigint} params.amount
     * @param {string} params.data
     * @param {number} params.nonce
     * @param {string} params.signature
     */
    constructor({ type, from, to = null, amount = 0n, data = "", nonce = 0, signature = null, timestamp = Date.now(), gasLimit = 0n}) {
        this.type = type; // 'transfer', 'deploy', 'call', 'stake'
        this.from = from;
        this.to = to;
        this.amount = amount;
        this.data = data;
        this.nonce = nonce;
        this.signature = signature;
        this.timestamp = timestamp;
        this.gasLimit = gasLimit;
    }

    getHash() {
        const payload = {
            type: this.type, from: this.from, to: this.to, 
            amount: this.amount, data: this.data, nonce: this.nonce, 
            timestamp: this.timestamp, gasLimit: this.gasLimit
        };
        return CryptoUtils.hash(payload);
    }

    sign(privateKey) {
        this.signature = CryptoUtils.sign(this.getHash(), privateKey);
    }

    isValid() {
        if (!this.signature) return false;
        return CryptoUtils.verify(this.signature, this.getHash(), this.from);
    }
}

export class Block {
    constructor(index, prevHash, transactions, validator, stateRoot, signature = null, timestamp = Date.now()) {
        this.header = {
            index,
            prevHash,
            timestamp,
            validator,
            stateRoot,
            signature
        };
        this.body = !transactions[0]?.getHash ? transactions.map(tx => new Transaction(tx)) : transactions || [];
    }

    getSigningHash() {
        const txHashes = this.body.map(tx => tx.getHash()).join('');
        const { signature, ...unsignedHeader } = this.header;
        return CryptoUtils.hash(
            CryptoUtils.serializeWithBigInt(unsignedHeader) + txHashes
        );
    }

    getHash() {
        const txHashes = this.body.map(tx => tx.getHash()).join('');
        return CryptoUtils.hash(CryptoUtils.serializeWithBigInt(this.header) + txHashes);
    }

    sign(privateKey) {
        this.header.signature = CryptoUtils.sign(this.getSigningHash(), privateKey);
    }

    isValid(prevBlock) {
        if (this.header.index !== prevBlock.header.index + 1) return false;
        if (this.header.prevHash !== prevBlock.getHash()) return false;
        return CryptoUtils.verify(this.header.signature, this.getSigningHash(), this.header.validator);
    }
}