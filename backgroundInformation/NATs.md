Non-Arbitrary Tokens (NATs)
What is NAT? What are Non-Arbitrary Tokens?
NAT deployment is one application of Digital Matter Theory where anyone can create Hybrid Tokens on Bitcoin whose token existence parameters are determined through referencing .element inscriptions

a novel & interesting alternative to minting shitcoins out of thin air - IOTBTC

NAT Overview
NAT is the application and framework of Digital Matter Theory for non-arbitrary token genesis. The data of Bitcoin's blockchain leverages the value proposition that makes Ordinal Theory, Rare Sats, and Bitmap Theory valuable. The inscription hierarchy is as follows:


Multiple applications of NAT deployments leveraging the same non-arbitrary data root for different use cases
Purpose
Utilizing information from the Bitcoin blockchain as a foundational source when establishing parameters for token supplies holds significant importance in the realm of digital asset creation. The Bitcoin blockchain, renowned as the pioneer of blockchain technology, offers unparalleled transparency and immutability. Leveraging its historical data allows for the derivation of robust and empirically grounded parameters for new token supplies. This approach enhances the credibility and predictability of token economics, ensuring that newly created tokens align with the principles of value preservation that underpin Bitcoin's success.

Expansionary Nature of NATs
The existing token protocol landscape on Bitcoin does not account for inflationary token supply. The nature of NATs is the non-arbitrary expansion of the token supply based on block data from Bitcoin. Inscribing an element is akin to discovering a natural element. You get the rights to name that digital element. Elements can only be discovered once. Anyone can point to that element via a Deploy inscription to generate a NAT with a supply based on the pattern found within the element you are pointing to. 

Your NAT will expand for as long as Bitcoin keeps appending blocks to the Bitcoin blockchain. This opens up new use cases for value creation and allows the onboarding of new users through tokenomics based on the block data of Bitcoin. 

Hybrid Token Model
NATs can serve as dual-purpose token wrappers for non-fungible and fungible token genesis

Introducing Hybrid Tokens
NATs represent the first implementation of a Hybrid Token. A Hybrid Token is a non-fungible inscription that can be treated to represent a numeric count of fungible assets. You can treat mint inscriptions as a Unique Non-Arbitrary Token (UNAT). 

Example

The following inscription could represent 10 units of the "satoshi" NAT

Copy
{ 

 "p": "tap",

 "op": "dmt-mint",

 "tick": "satoshi",

 "blk": "1"

}
Whereas the following inscription could represent 1,000 units of the "satoshi" NAT

Copy
{ 

 "p": "tap",

 "op": "dmt-mint",

 "tick": "satoshi",

 "blk": "2"

}
Minting block 1 versus block 2 are 2 unique non-fungible inscriptions (UNATs) accounting for separate units of account of the underlying fungible "satoshi" NAT. 

Implication
The underlying implication is that a market can form around the non-fungible aspect of these mint inscriptions alongside the market around the fungible "satoshi" NAT.

As of the deployment of Natcats, the Unique Non-Arbitrary Token (UNAT) extension to the NAT deployment format has been implemented, marking the beginning of associating non-arbitrary data to a non-fungible DMT mint.

What are UNATs?
When generating a NAT, the deployer can incorporate a data reference source that gives individual NAT mints unique properties that cover a wide spectrum of functionality. This is similar to how non-fungible tokens can be leveraged to create unique own-able digital collectibles. This makes a DMT mint inscription into UNIQUE content on chain. 

The Unique Non-Arbitrary Tokens (UNAT) generated through the DMT framework can now serve the purpose of non-fungibility but also share the novel token property of non-arbitrary supply rooted in pattern existence sourced through block data using the element registry.

NAT Use Cases
Throughout history, humans have been good at pattern recognition. Block Elements applies the patterns to Bitcoin's block information.


Fair, Function, and Provenance methods are outlined above
Methodology
There are 3 methods outlined above that allow for custom usecases depending on your style of project. 

Method 1
Minting a NAT using the deploy inscription as a reference establishes on-chain provenance and employs the fair mint distribution process. This enables anyone to leverage any inscription service to mint a NAT using Method 1. Please refer to $NAT as a live demonstration. 

Method 2
Once a deploy inscription exists, token-auth can be generated as a child inscription and sent to a minting platform. This enables you to create logic to allow minting based on some challenge parameter met by the minter. This concept can be used as a method to earn NATs based on an achievement where the burden on minting cost is on the minter and not on the token deployer. 

Method 3
For existing projects, such as Bitmap, you can generate a NAT and leverage parent-child inscriptions through the Blockdrop mechanism to allow bitmap holders to claim NATs. This method is scalable and allows the onboarding of future Bitmap holders for as long as Bitcoin exists. 