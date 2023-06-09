require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
    localhost: {
      chainId: 31337,
    },
  },
};
