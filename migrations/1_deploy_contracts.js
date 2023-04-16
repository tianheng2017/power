const Token = artifacts.require("Token")
const DutchMarket = artifacts.require("DutchMarket")

module.exports = async function(deployer, network, accounts) {
    // 部署电力代币合约
    await deployer.deploy(Token, 'Power Token', 'PT');
    const tokenInstance = await Token.deployed()

    // 部署DutchMarket合约
    await deployer.deploy(DutchMarket);
    const dutchMarketInstance = await DutchMarket.deployed()
    // 全部授权给DutchMarket合约
    await tokenInstance.approve(dutchMarketInstance.address, web3.utils.toWei("100000000", "ether"))

    // 转账10万代币给卖家1
    await tokenInstance.transfer(accounts[1], web3.utils.toWei("100000", "ether"))
    // 也全部授权给DutchMarket合约
    await tokenInstance.approve(dutchMarketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[1] })

    // 转账10万代币给卖家2
    await tokenInstance.transfer(accounts[2], web3.utils.toWei("100000", "ether"))
    // 仍然全部授权给DutchMarket合约
    await tokenInstance.approve(dutchMarketInstance.address, web3.utils.toWei("100000000", "ether"), {from: accounts[2]})
}
