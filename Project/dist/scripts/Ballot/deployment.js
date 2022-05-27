"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
require("dotenv/config");
const ballotJson = __importStar(require("../../artifacts/contracts/Ballot.sol/Ballot.json"));
// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";
function convertStringArrayToBytes32(array) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
        bytes32Array.push(ethers_1.ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}
function setupProvider() {
    const infuraOptions = process.env.INFURA_API_KEY
        ? process.env.INFURA_API_SECRET
            ? {
                projectId: process.env.INFURA_API_KEY,
                projectSecret: process.env.INFURA_API_SECRET,
            }
            : process.env.INFURA_API_KEY
        : "";
    const options = {
        alchemy: process.env.ALCHEMY_API_KEY,
        infura: infuraOptions,
    };
    const provider = ethers_1.ethers.providers.getDefaultProvider("ropsten", options);
    return provider;
}
async function main() {
    var _a;
    const wallet = process.env.MNEMONIC && process.env.MNEMONIC.length > 0
        ? ethers_1.ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
        : new ethers_1.ethers.Wallet((_a = process.env.PRIVATE_KEY) !== null && _a !== void 0 ? _a : EXPOSED_KEY);
    console.log(`Using address ${wallet.address}`);
    const provider = setupProvider();
    const signer = wallet.connect(provider);
    const balanceBN = await signer.getBalance();
    const balance = Number(ethers_1.ethers.utils.formatEther(balanceBN));
    console.log(`Wallet balance ${balance}`);
    if (balance < 0.01) {
        throw new Error("Not enough ether");
    }
    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    const proposals = process.argv.slice(2);
    if (proposals.length < 2)
        throw new Error("Not enough proposals provided");
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });
    const ballotFactory = new ethers_1.ethers.ContractFactory(ballotJson.abi, ballotJson.bytecode, signer);
    const ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(proposals));
    console.log("Awaiting confirmations");
    await ballotContract.deployed();
    console.log("Completed");
    console.log(`Contract deployed at ${ballotContract.address}`);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
