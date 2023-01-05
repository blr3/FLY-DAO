import sdk from "./1-initialize-sdk.js";

const tokenModule = sdk.getTokenModule(
  "0xA4b4922d75E0ECcd12714c86Df3157E51126C943",
);

(async () => {
  try {
    console.log(
      "👀 Roles that exist right now:",
      await tokenModule.getAllRoleMembers()
    );

    await tokenModule.revokeAllRolesFromAddress(process.env.WALLET_ADDRESS);
    console.log(
      "🎉 Roles after revoking ourselves",
      await tokenModule.getAllRoleMembers()
    );
    console.log("✅ Successfullyt revoked our superpowers from the ERC-20 contract");
    
  } catch (error) {
    console.error("Failed to revoke ourselves from the DAO treasury", error);
  }
})();