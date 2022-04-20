import { SolanaService } from './services/SolanaService';
import express, { Express, Request, Response } from 'express'

const app: Express = express()
app.use(express.json())
const port = process.env.PORT || 3000
const solanaService = new SolanaService('devnet')

app.post('/transactions', async function (req: Request, res: Response) {
  try {
    const { to, amount, secretKey } = req.body
    if (!amount || !to || !secretKey) {
      res.status(400).json({ error: 'missing parameters' })
    }
    const signature = await solanaService.newTransaction(to, amount, secretKey)
    return res.json({
      signature
    })
  } catch (e) {
    const error = e as Error
    res.json({
      error: error.message
    })
  }
})

app.get('/transactions/:address', async function (req: Request, res: Response) {
  try {
    const { address } = req.params
    const transactions = await solanaService.getTransactions(address)
    return res.json({
      transactions
    })
  } catch (e) {
    const error = e as Error
    res.json({
      error: error.message
    })
  }
})

app.get('/wallet/balance/:address', async function (req: Request, res: Response) {
  try {
    const { address } = req.params
    const balance = await solanaService.getBalance(address)
    return res.json({
      balance : solanaService.convertLamportsToSol(balance)
    })
  }
  catch (e) {
    const error = e as Error
    res.json({
      error: error.message
    })
  }
})

app.post('/wallet/new', async function (_, res: Response) {
  try {
    const wallet = solanaService.generateWallet()
    return res.json({ wallet })
  } catch (e) {
    const error = e as Error
    res.json({
      error: error.message
    })
  }
})

app.listen(port, () => {
  console.log("Server is running at port : ", port)
})