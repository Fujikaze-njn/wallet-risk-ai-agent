import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const ETHERSCAN = process.env.ETHERSCAN_KEY;

async function getTransactions(address) {
  const url =
    `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${ETHERSCAN}`;

  const res = await axios.get(url);
  return res.data.result.slice(0, 20);
}

async function analyzeWallet(address) {
  const txs = await getTransactions(address);

  const simplified = txs.map(tx => ({
    from: tx.from,
    to: tx.to,
    value: tx.value
  }));

  const ai = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an AI blockchain security agent."
      },
      {
        role: "user",
        content: `Analyze this wallet activity and produce a security risk report:\n${JSON.stringify(simplified)}`
      }
    ]
  });

  console.log("\nWallet AI Risk Report\n");
  console.log(ai.choices[0].message.content);
}

const wallet = process.argv[2];

if (!wallet) {
  console.log("Usage: node index.js WALLET_ADDRESS");
  process.exit();
}

analyzeWallet(wallet);
