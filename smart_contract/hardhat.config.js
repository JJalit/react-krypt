require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/qHvvU-B2Me5MSEmqT1-1TVmdFQp1hcLa',
      accounts: ['159ed1ca4a6cf5d9ba0435f6a9feb41d68be2fbbe836ac713e6985a7d8c12259'],
    },
  },
};
