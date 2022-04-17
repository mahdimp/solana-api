var express = require('express')
const web3 = require('@solana/web3.js')
const bs58 = require('bs58')
var router = express.Router()


// create a new transaction

// get list of in transactions of an address
router.get('/get-transactions', function (req, res, next) {
  (async () => {
    const connection = web3.clusterApiUrl("testnet")
    const publicKey = new web3.PublicKey(
      "9P5saqRj4dbxF1UoJRzdkoNd3TeMbNzNhdsGZpC4DAwL"
    )
    const transactions = []
    const solana = new web3.Connection(connection)
    const transSignatures = await solana.getConfirmedSignaturesForAddress2(publicKey, { limit: 5 })
    for (const transSignature of transSignatures) {
      const transaction = await solana.getParsedTransaction(transSignature.signature)
      if (transaction) {
        const instructions = transaction.transaction.message.instructions
        let parsedInfo = null
        if (
          instructions 
          && instructions.length
          && instructions[0].parsed
          && instructions[0].parsed.info
        ) {
          parsedInfo = instructions[0].parsed.info
        }

        transactions.push({
          status: transSignature.confirmationStatus,
          signature: transSignature.signature,
          blockTime: transaction.blockTime,
          meta: {
            err: transaction.meta.err,
            fee: transaction.meta.fee
          },
          // information
          parsedInfo
        })
      }
    }

    return res.json({
      // transSignatures,
      transactions
    })
  })()
})



// get balance of an address
router.get('/get-balance', function (req, res, next) {
  (async () => {
    const connection = web3.clusterApiUrl("mainnet-beta")
    const publicKey = new web3.PublicKey(
      "9P5saqRj4dbxF1UoJRzdkoNd3TeMbNzNhdsGZpC4DAwL"
    )
    const solana = new web3.Connection(connection)
    const balance = (await solana.getBalance(publicKey))
    return res.json({
      balance: balance
    })
  })()
})

// get parsed account info
router.get('/account-info', function (req, res, next) {
  (async () => {
    const connection = web3.clusterApiUrl("mainnet-beta")
    const publicKey = new web3.PublicKey(
      "9P5saqRj4dbxF1UoJRzdkoNd3TeMbNzNhdsGZpC4DAwL"
    )
    const solana = new web3.Connection(connection)
    const accountInfo = await solana.getParsedTransactions(publicKey)
    return res.json({
      accountInfo
    })
  })()
})

// create new wallet key pair
router.get('/create-key-pair', function (req, res, next) {
  (async () => {
    const keyPair = web3.Keypair.generate()
    const secretValues = Uint8Array.from(Object.values(keyPair.secretKey))
    const base58Secret = bs58.encode(secretValues)
    return res.json({
      publicKey: keyPair.publicKey.toString(),
      secretKey: keyPair.secretKey,
      secretKeyBase58: base58Secret,
    })
  })()
})

module.exports = router
