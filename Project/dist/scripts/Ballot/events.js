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
const abiDecoder = require("abi-decoder");
require("dotenv/config");
const ballotJson = __importStar(require("../../artifacts/contracts/Ballot.sol/Ballot.json"));
// This key is already public on Herong's Tutorial Examples - v1.03, by Dr. Herong Yang
// Do never expose your keys like this
const EXPOSED_KEY = "8da4ef21b864d2cc526dbdb2a120bd2874c36c9d0a1fb7f8c63d7f7a8b41de8f";
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
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
async function deploy() {
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
    if (balance < 0.01)
        throw new Error("Not enough ether");
    console.log("Deploying Ballot contract");
    console.log("Proposals: ");
    const proposals = PROPOSALS;
    proposals.forEach((element, index) => {
        console.log(`Proposal N. ${index + 1}: ${element}`);
    });
    const ballotFactory = new ethers_1.ethers.ContractFactory(ballotJson.abi, ballotJson.bytecode, signer);
    const ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(proposals));
    console.log("Awaiting confirmations");
    await ballotContract.deployed();
    console.log("Completed");
    console.log(`Contract deployed at ${ballotContract.address}`);
    return { ballotContract, provider, signer };
}
function setListeners(ballotContract, provider) {
    console.log("Setting listeners on");
    abiDecoder.addABI(ballotJson.abi);
    const eventFilter = ballotContract.filters.NewVoter();
    provider.on(eventFilter, (log) => {
        const decodedLogs = abiDecoder.decodeLogs([log]);
        const voter = decodedLogs[0].events[0];
        console.log("New voter:", voter.value);
    });
    const eventFilter2 = ballotContract.filters.Voted();
    provider.on(eventFilter2, async (log) => {
        console.log("New vote cast");
        const winner = await ballotContract.winnerName();
        console.log("WINNING PROPOSAL NAME", ethers_1.ethers.utils.parseBytes32String(winner));
        const decodedLogs = abiDecoder.decodeLogs([log]);
        const proposalVotes = decodedLogs[0].events[3];
        console.log("NB VOTES:", proposalVotes.value);
        for (let i = 0; i < PROPOSALS.length; i++) {
            const proposal = await ballotContract.proposals(i);
            console.log("NAME", ethers_1.ethers.utils.parseBytes32String(proposal.name));
            console.log("VOTE_COUNT", proposal.voteCount.toString());
        }
    });
    const eventFilter3 = ballotContract.filters.Delegated();
    provider.on(eventFilter3, (log) => {
        console.log("New vote delegation");
        const decodedLogs = abiDecoder.decodeLogs([log]);
        const finalDelegate = decodedLogs[0].events[1];
        const finalWeight = decodedLogs[0].events[2];
        const hasVoted = decodedLogs[0].events[3];
        console.log("Final Delegate:", finalDelegate.value);
        console.log("Final Voting Weight:", finalWeight.value);
        console.log("Has Voted:", hasVoted.value);
    });
    console.log(`Total of ${provider.listenerCount()} listeners set`);
}
async function Populate(ballotContract, provider, signer) {
    console.log("Populating transactions");
    const wallet1 = ethers_1.ethers.Wallet.createRandom().connect(provider);
    const wallet2 = ethers_1.ethers.Wallet.createRandom().connect(provider);
    const wallet3 = ethers_1.ethers.Wallet.createRandom().connect(provider);
    const wallet4 = ethers_1.ethers.Wallet.createRandom().connect(provider);
    let tx;
    console.log(`Giving right to vote to ${wallet1.address}`);
    tx = await ballotContract.giveRightToVote(wallet1.address);
    await tx.wait();
    console.log(`Giving right to vote to ${wallet2.address}`);
    tx = await ballotContract.giveRightToVote(wallet2.address);
    await tx.wait();
    console.log(`Giving right to vote to ${wallet3.address}`);
    tx = await ballotContract.giveRightToVote(wallet3.address);
    await tx.wait();
    console.log(`Giving right to vote to ${wallet4.address}`);
    tx = await ballotContract.giveRightToVote(wallet4.address);
    await tx.wait();
    console.log(`Funding account ${wallet1.address}`);
    tx = await signer.sendTransaction({
        to: wallet1.address,
        value: ethers_1.ethers.utils.parseEther("0.001"),
    });
    await tx.wait();
    console.log("Interacting with contract now:");
    tx = await ballotContract.connect(wallet1).vote(0);
    await tx.wait();
    console.log(`Funding account ${wallet2.address}`);
    tx = await signer.sendTransaction({
        to: wallet2.address,
        value: ethers_1.ethers.utils.parseEther("0.001"),
    });
    await tx.wait();
    console.log("Interacting with contract now:");
    tx = await ballotContract.connect(wallet2).delegate(wallet3.address);
    await tx.wait();
    console.log(`Funding account ${wallet3.address}`);
    tx = await signer.sendTransaction({
        to: wallet3.address,
        value: ethers_1.ethers.utils.parseEther("0.001"),
    });
    await tx.wait();
    console.log("Interacting with contract now:");
    tx = await ballotContract.connect(wallet3).vote(0);
    await tx.wait();
    console.log(`Funding account ${wallet4.address}`);
    tx = await signer.sendTransaction({
        to: wallet4.address,
        value: ethers_1.ethers.utils.parseEther("0.001"),
    });
    await tx.wait();
    console.log("Interacting with contract now:");
    tx = await ballotContract.connect(wallet4).delegate(wallet2.address);
    await tx.wait();
    console.log("Done");
}
async function main() {
    const { ballotContract, provider, signer } = await deploy();
    setListeners(ballotContract, provider);
    await Populate(ballotContract, provider, signer);
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
