import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule(
  "0x08250184D0cFc3238F13beF1b8E044C8d2627e15", 
);

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "Fly gworl certificate",
        description: "This NFT will give you access to FLY DAO",
        image: readFileSync("scripts/assets/flygirl.png"),
      },  
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})()