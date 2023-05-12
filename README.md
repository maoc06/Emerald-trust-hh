# Emerald Trust :green_book:

## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [Setup](#setup)
* [Features](#features)
* [ToDo](#todo)

## General info
This is the final project of [Alchemy University's Ethereum Developer Bootcamp](https://university.alchemy.com/ethereum).
I am Colombian, a country that extracts and produces the most emeralds :green_circle: for the world market :earth_americas: as well as the most desirable :sparkles: It is estimated that Colombia represents between 70% and 90% of the world emerald market. My project is aimed at an open and secure marketplace that lists and records emerald transactions :memo::package::link::package:
	
## Technologies
Project is created with:
* hardhat: 2.14
* openzeppelin/contracts: 4.8.3
* chai: 4.3.7
	
## Setup

#### Install dependencies
To run this project, install it locally:

```
$ npm install
# or
$ yarn install
```

#### Set environment variables
To deploy contracts in networks (also test networks)
```
$ touch .env
```
open the .env file and set the following format:
```
PRIVATE_KEY=<<private_key_wallet_metamask>>
GOERLI_URL=<<alchemy_test_url>>

```

#### Run tests
To test the contracts to be executed:
```
$ npx hardhat deploy
```

#### Deploy contract
To deploy the contracts to be executed:
```
$ npx hardhat run scripts/deploy-emerald-nft.js --network <network-name>
# and
$ npx hardhat run scripts/deploy-nft-marketplace.js --network <network-name>
```

## Features
- An NFT of an Emerald can be created and updated.
- That can be offered for sale within the marketplace.
- You can cancel the listing.
- You can buy the NFT from another address.

## To Do
- Refactoring to implement proxy pattern and allow contract upgrades.
- Create frontend to interact.