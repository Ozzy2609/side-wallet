export const errorPatterns = {
  sideBTCInsufficientFunds: {
    pattern: new RegExp('sat.*insufficient funds|insufficient funds.*sat', 'i'),
    message: 'Insufficient BTC balance on the Side Chain to cover transaction fees'
  },

  sideBTCVaultNoUTXOs: {
    pattern: new RegExp('insufficient utxos', 'i'),
    message: 'Side Bridge’s BTC vault currently has no usable UTXOs. Please wait and check back later.'
  }
};
