import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// The governance contract.
const voteModule = sdk.getVoteModule(
  "0xDFe050f90230e06f06DB931248BF1aD61ed22657",
);

// Our ERC-20 contract.
const tokenModule = sdk.getTokenModule(
  "0xA4b4922d75E0ECcd12714c86Df3157E51126C943",
);

(async () => {
  try {
    // Give treasury the power to mint additional token if needed. 
    await tokenModule.grantRole("minter", voteModule.address);

    console.log(
      "Successfully gave vote module permissions to act on token module"
    );
  } catch (error) {
    console.error(
      "failed to grant vote module permissions on token module", error 
    );
    process.exit(1);
  }

  try {
    // Grab wallet's token balance
    const ownedTokenBalance = await tokenModule.balanceOf(
      // The wallet address 
      process.env.WALLET_ADDRESS
    );

    // Grab 50% of the supply that we hold.
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent50 = ownedAmount.div(100).mul(50);

    // Transfer 50% of the supply to our voting contract
    await tokenModule.transfer(
      voteModule.address,
      percent50
    );

    console.log("✅ Successfully transferred tokens to vote module");
  } catch (err) {
    console.error("failed to transfer tokens to vote module", err); 
  }
})();