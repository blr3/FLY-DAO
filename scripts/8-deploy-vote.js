import sdk from "./1-initialize-sdk.js";

const appModule = sdk.getAppModule(
  "0x2888F14D042D5e9E18B7bC64D1e25f5Ffa6AAB87",
);

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // governance contract name 
      name: "Fly Proposals",
      // Location of our governance token, our ERC-20 contract!
      votingTokenAddress: "0xA4b4922d75E0ECcd12714c86Df3157E51126C943",
      proposalStartWaitTimeInSeconds: 0,
      // Amount of time to vote on proposal when it's created? 3 days
      proposalVotingTimeInSeconds: 3 * 24 * 60 * 60,
      votingQuorumFraction: 0,
      // The minimum # of tokens a user needs to be allowed to create a proposal
      minimumNumberOfTokensNeededToPropose: "1",
    });

    console.log(
      "✅ Successfully deployed vote module, address:",
      voteModule.address,
    );
  } catch (err) {
    console.error("Failed to deploy vote module", err);
  }
})();