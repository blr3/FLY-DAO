// import React from "react";
// import { ParallaxProvider } from "react-scroll-parallax";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { ThirdwebSDK } from "@3rdweb/sdk";
// import background from "./facesinthesky.png";

// import thirdweb 
import { useWeb3 } from "@3rdweb/hooks";

import { UnsupportedChainIdError } from "@web3-react/core";

// We instantiate the sdk on Rinkeby.
const sdk = new ThirdwebSDK("rinkeby");

// We can grab a reference to our ERC-1155 contract.
const bundleDropModule = sdk.getBundleDropModule(
  "0x08250184D0cFc3238F13beF1b8E044C8d2627e15",
);

const tokenModule = sdk.getTokenModule(
  "0xA4b4922d75E0ECcd12714c86Df3157E51126C943",
);

const voteModule = sdk.getVoteModule(
  "0xDFe050f90230e06f06DB931248BF1aD61ed22657",
);

const App = () => {
  // Use the connectWallet hook thirdweb gives us.
  const { connectWallet, address, error, provider } = useWeb3();
  console.log("👋 Address:", address)

  // The signer is required to sign transactions on the blockchain.
  // Without it we can only read data, not write.
  const signer = provider ? provider.getSigner() : undefined;

  // State variable for us to know if user has our NFT. 
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming lets us easily keep a loading state while the NFT is minting.
  const [isClaiming, setIsClaiming] = useState(false);

  // Holds the amount of token each memeber had in state.
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses. 
  const [memberAddresses, setMemberAddresses] = useState([]);

  // A funciton to shorten someones waller address

  const shortenAddress = (str) => {
    return str.substring(0,6) + "..." + str.substring(str.length - 4);
  };

  // This useEffect grabs all the addresses of our members holding our NFT
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab the users who hold our NFT with tokenID 0
    try {
      const memberAddresses = await bundleDropModule.getAllClaimerAddresses("0");
      setMemberAddresses(memberAddresses);
      console.log("🚀 Members addresses", memberAddresses); 
    } catch (error) {
      console.error("failed to get member list", error);
    }
  }, [hasClaimedNFT]);

  // This useEffect grabs the # of token each memeber holds. 
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }

    // Grab all the balances
    try {
      const amounts = await tokenModule.getAllHolderBalances();
      setMemberTokenAmounts(amounts);
      console.log("👜 Amounts", amounts);
    } catch (error) {
      console.error("failed to get token amounts", error);
    }
  }, [hasClaimedNFT]);

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't hold any of our token
          memberTokenAmounts[address] || 0,
          18,
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with our deployed contract!
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    // If they don't have a connected wallet, exit!
    if (!address) {
      return;
    }

    // Check if the user has the NFT by using bundleDropModule.balanceOf
    return bundleDropModule
      .balanceOf(address, "0")
      .then((balance) => {
        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!")
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.")
        }
      })
      .catch((error) => {
        setHasClaimedNFT(false);
        console.error("failed to nft balance", error);
      });
  }, [address]);

  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }

    // Call to voteModule.getAll() to grab the proposals
    try {
      const proposals = await voteModule.getAll();
      setProposals(proposals);
      console.log("🌈 Proposals:", proposals);
    } catch (err) {
      console.log("failed to get proposals", err);
    }
  }, [hasClaimedNFT]);

  // Check if the user already voted.
  useEffect(async () => {
    if (!hasClaimedNFT) {
      return;
    }

    // If we haven't finished retrieving the proposals from the useEffect above
    // then we can't check if the user voted yet
    if (!proposals.length) {
      return;
    }

    // Check if the user has already voted on the first proposal
    try {
      const hasVoted = await voteModule.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if(hasVoted) {
        console.log("😬 User has already voted");
      } else {
        console.log("☺️ User had not voted yet");
      }
    } catch (error) {
      console.error("Failed to check if wallet has voted", error);
    }
  }, [hasClaimedNFT, proposals, address]);

  // if (error instanceof UnsupportedChainIdError) {
  //   return (
  //     <div className="unsupported-network">
  //       <h2>Please connect to Rinkeby</h2>
  //       <p>
  //         This dapp only works on the Rinkeby network, please switch networks in your connected 
  //   )
  // }

  // This is the case where the user hasn't connected their wallet 
  // to your web app. Let them call connectWallet.
          // <section class="one" style={{ backgroundImage: `url(${background})` }}>
  if (!address) {
    return (
      <div className="landing">
        <section className="one">
          <h1>The Fly DAO</h1>
          <button onClick={() => connectWallet("injected")} className="btn-hero">
            Connect your wallet
          </button>
        </section>
        <section className="two">
          <h1> What does it mean to be FLY?</h1>
          <h2 className="h2two">"...the aesthetic of presence, a technique of being to counter the aesthetics of invisibility that people of the African diaspora have had to overcome since slavery."<br/>-Carol Tulloch</h2> 
          <h2 className="h2two"> The FLY DAO is an initiative put together to pay homage to the contributors and innovators of streetwear. We hope to grow a community of designers, artists, and those of the like as well as consumers and others with a deep love for shaping the future of streetwear.</h2>
          <h2 className="h2two"> By connecting your wallet, you can mint an NFT to become a member of the DAO. As a member, you will have exclusive access to future events, collections, discord as well as other communication channels, and more. </h2>
        </section>
        <section className="three">
          <h1> Contact Us!</h1>
        </section>
      </div>
    );
  }

  // If the user has already claimed their NFT we want to display the interal DAO only DAO members will see this. Render all the members + token amounts. 
  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>👩🏾‍🚀 DAO Member Page</h1>
        <p>Congratulations on being a member</p>
        <div>
          <div>
            <h2>Member List</h2>
            <table className="card">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Token Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberList.map((member) => {
                  return (
                    <tr key={member.address}>
                      <td>{shortenAddress(member.address)}</td>
                      <td>{member.tokenAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div>
            <h2>Active Proposals</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = proposals.map((proposal) => {
                  let voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await tokenModule.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === ethers.constants.AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await tokenModule.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async (vote) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await voteModule.get(vote.proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return voteModule.vote(vote.proposalId, vote.vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async (vote) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await voteModule.get(
                            vote.proposalId
                          );

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return voteModule.execute(vote.proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
              {proposals.map((proposal, index) => (
                <div key={proposal.proposalId} className="card">
                  <h5>{proposal.description}</h5>
                  <div>
                    {proposal.votes.map((vote) => (
                      <div key={vote.type}>
                        <input
                          type="radio"
                          id={proposal.proposalId + "-" + vote.type}
                          name={proposal.proposalId}
                          value={vote.type}
                          //default the "abstain" vote to chedked
                          defaultChecked={vote.type === 2}
                        />
                        <label htmlFor={proposal.proposalId + "-" + vote.type}>
                          {vote.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button disabled={isVoting || hasVoted} type="submit">
                {isVoting
                  ? "Voting..."
                  : hasVoted
                    ? "You Already Voted"
                    : "Submit Votes"}
              </button>
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const mintNft = () => {
    setIsClaiming(true);
    // Call bundleDropModule.claim("0", 1) to mint nft to user's wallet.
    bundleDropModule
    .claim("0", 1)
    .then(() => {
      // Set claim state.
      setHasClaimedNFT(true);
      // Show user their fancy new NFT!
      console.log(`🌊 Successfully Minted! Check it our on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address.toLowerCase()}/0`);
    })
    .catch((err) => {
      console.error("failed to claim", err);
    })
    .finally(() => {
      // Stop loading state.
      setIsClaiming(false);
    });
  }

  // Render mind nft screen.

  return (
    <div className="mint-nft">
      <h1>Mint your free 👩🏾‍🚀 DAO Membership NFT</h1>
      <button
        disabled={isClaiming}
        onClick={() => mintNft()}
      >
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );


  // This is the case where we have the user's address
  // which means they've connected their wallet to our site!
  // return (
  //   <div className="landing">
  //     <h1>Letsssss goooooooo</h1>
  //   </div>);
};

export default App;