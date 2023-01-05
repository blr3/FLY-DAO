import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// This is the address of our ERC-20 contract printed out before
const tokenModule = sdk.getTokenModule(
  "0xA4b4922d75E0ECcd12714c86Df3157E51126C943",
);

(async () => {
  try {
    // Max supply 
    const amount = 10_000_000;
    // We use the util function from "ethers" to convert the amount
    // to have 18 decimals (which is the standard for ERC20 tokens).
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);
    // Interact with deployed ERC-20 contract and mint the tokens!
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply(); 

    // Print out how many token's are out there 
    console.log(
      "✅ There now is",
      ethers.utils.formatUnits(totalSupply, 18),
      "$FLY in circulation",
    );
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();
