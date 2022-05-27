"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];
function convertStringArrayToBytes32(array) {
    const bytes32Array = [];
    for (let index = 0; index < array.length; index++) {
        bytes32Array.push(hardhat_1.ethers.utils.formatBytes32String(array[index]));
    }
    return bytes32Array;
}
async function giveRightToVote(ballotContract, voterAddress) {
    const tx = await ballotContract.giveRightToVote(voterAddress);
    await tx.wait();
}
describe("Ballot", function () {
    let ballotContract;
    let accounts;
    this.beforeEach(async function () {
        accounts = await hardhat_1.ethers.getSigners();
        const ballotFactory = await hardhat_1.ethers.getContractFactory("Ballot");
        ballotContract = await ballotFactory.deploy(convertStringArrayToBytes32(PROPOSALS));
        await ballotContract.deployed();
    });
    describe("when the contract is deployed", function () {
        it("has the provided proposals", async function () {
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposal = await ballotContract.proposals(index);
                (0, chai_1.expect)(hardhat_1.ethers.utils.parseBytes32String(proposal.name)).to.eq(PROPOSALS[index]);
            }
        });
        it("has zero votes for all proposals", async function () {
            for (let index = 0; index < PROPOSALS.length; index++) {
                const proposal = await ballotContract.proposals(index);
                (0, chai_1.expect)(proposal.voteCount.toNumber()).to.eq(0);
            }
        });
        it("sets the deployer address as chairperson", async function () {
            const chairperson = await ballotContract.chairperson();
            (0, chai_1.expect)(chairperson).to.eq(accounts[0].address);
        });
        it("sets the voting weight for the chairperson as 1", async function () {
            const chairpersonVoter = await ballotContract.voters(accounts[0].address);
            (0, chai_1.expect)(chairpersonVoter.weight.toNumber()).to.eq(1);
        });
    });
    describe("when the chairperson interacts with the giveRightToVote function in the contract", function () {
        it("gives right to vote for another address", async function () {
            const voterAddress = accounts[1].address;
            await giveRightToVote(ballotContract, voterAddress);
            const voter = await ballotContract.voters(voterAddress);
            (0, chai_1.expect)(voter.weight.toNumber()).to.eq(1);
        });
        it("can not give right to vote for someone that has voted", async function () {
            const voterAddress = accounts[1].address;
            await giveRightToVote(ballotContract, voterAddress);
            await ballotContract.connect(accounts[1]).vote(0);
            await (0, chai_1.expect)(giveRightToVote(ballotContract, voterAddress)).to.be.revertedWith("The voter already voted.");
        });
        it("can not give right to vote for someone that has already voting rights", async function () {
            const voterAddress = accounts[1].address;
            await giveRightToVote(ballotContract, voterAddress);
            await (0, chai_1.expect)(giveRightToVote(ballotContract, voterAddress)).to.be.revertedWith("");
        });
        it("triggers the NewVoter event with the address of the new voter", async function () {
            const voterAddress = accounts[1].address;
            await (0, chai_1.expect)(ballotContract.giveRightToVote(voterAddress))
                .to.emit(ballotContract, "NewVoter")
                .withArgs(voterAddress);
        });
    });
    describe("when the voter interact with the vote function in the contract", function () {
        // TODO
        it("triggers the Voted event", async function () {
            const voterAddress = accounts[1].address;
            await giveRightToVote(ballotContract, voterAddress);
            await (0, chai_1.expect)(ballotContract.connect(accounts[1]).vote(0))
                .to.emit(ballotContract, "Voted")
                .withArgs(voterAddress, 0, 1, 1);
        });
    });
    describe("when the voter interact with the delegate function in the contract", function () {
        // TODO
        it("triggers the Delegated event", async function () {
            const voterAddress = accounts[1].address;
            await giveRightToVote(ballotContract, voterAddress);
            const delegateAddress = accounts[2].address;
            await giveRightToVote(ballotContract, delegateAddress);
            await (0, chai_1.expect)(ballotContract.connect(accounts[1]).delegate(delegateAddress))
                .to.emit(ballotContract, "Delegated")
                .withArgs(voterAddress, delegateAddress, 2, false, 0, 0);
        });
    });
    describe("when the voter interact with the delegate function in the contract, and the delegate has other delegate", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when the voter interact with the delegate function in the contract, and the delegate has already voted", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when the voter interact with the delegate function in the contract, and the delegate has other delegate that has already voted", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when the an attacker interact with the giveRightToVote function in the contract", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when the an attacker interact with the vote function in the contract", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when the an attacker interact with the delegate function in the contract", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when someone interact with the winningProposal function before any votes are cast", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when someone interact with the winningProposal function after one vote is cast for the first proposal", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when someone interact with the winnerName function before any votes are cast", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when someone interact with the winnerName function after one vote is cast for the first proposal", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
    describe("when someone interact with the winningProposal function and winnerName after 5 random votes are cast for the proposals", function () {
        // TODO
        it("is not implemented", async function () {
            throw new Error("Not implemented");
        });
    });
});