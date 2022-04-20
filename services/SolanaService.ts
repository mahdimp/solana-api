import * as web3 from '@solana/web3.js'
import bs58 from 'bs58'

type Cluster = 'devnet' | 'testnet' | 'mainnet-beta'

interface IWallet {
    publicKey: string,
    secretKey: Uint8Array,
    secretKeyBase58: string
}


export class SolanaService {

    private connection;

    constructor(cluster: Cluster) {
        this.connection = new web3.Connection(web3.clusterApiUrl(cluster), "confirmed")
    }

    generateWallet(): IWallet {
        const keyPair = web3.Keypair.generate()
        const secretValues = Uint8Array.from(Object.values(keyPair.secretKey))
        const base58Secret = bs58.encode(secretValues)
        return {
            publicKey: keyPair.publicKey.toString(),
            secretKey: keyPair.secretKey,
            secretKeyBase58: base58Secret,
        }
    }

    async getBalance(address: string): Promise<number> {
        const publicKey = new web3.PublicKey(address)
        return await this.connection.getBalance(publicKey)
    }

    async getTransactions(address: string) {
        const publicKey = new web3.PublicKey(address)
        const transactions = []
        const transSignatures: any = await this.connection.getConfirmedSignaturesForAddress2(publicKey, { limit: 5 })
        for (const transSignature of transSignatures) {
            const transaction = await this.connection.getParsedTransaction(transSignature.signature)
            if (transaction) {
                const instructions = transaction.transaction.message.instructions
                const instruction: any = instructions?.length ? instructions[0] : null
                const parsedInfo = instruction?.parsed?.info
                transactions.push({
                    status: transSignature.confirmationStatus,
                    signature: transSignature.signature,
                    blockTime: transaction.blockTime,
                    parsedInfo
                })
            }
        }
        return transactions
    }

    async newTransaction(to: string, amount: number, secretKey: string): Promise<any> {
        const receiver = new web3.PublicKey(to)
        const sender = web3.Keypair.fromSecretKey(bs58.decode(secretKey))
        const hash = await this.connection.getLatestBlockhash()
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: sender.publicKey,
                toPubkey: receiver,
                lamports: this.convertSolToLamports(amount),
            })
        )
        transaction.feePayer = sender.publicKey
        transaction.recentBlockhash = hash.blockhash
        if (transaction) {
            const signature = await web3.sendAndConfirmTransaction(
                this.connection,
                transaction,
                [sender]
            )
            return ({
                signature
            })
        }
    }

    convertLamportsToSol(lamports: number): number {
        return lamports / web3.LAMPORTS_PER_SOL
    }

    convertSolToLamports(solAmount: number): number {
        return solAmount * web3.LAMPORTS_PER_SOL
    }
}