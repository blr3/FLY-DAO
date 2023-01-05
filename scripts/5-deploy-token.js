import sdk from "./1-initialize-sdk.js";

// In order to deploy the new contract we need the app module again.
const app = sdk.getAppModule("0x2888F14D042D5e9E18B7bC64D1e25f5Ffa6AAB87");

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // Token name
      name: "FLY DAO Governance Token",
      // Token symbol
      symbol: "FLY",
    });
    console.log(
      "✅ Successfully deployed token module, address:",
      tokenModule.address,
    );
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();