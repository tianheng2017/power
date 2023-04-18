const Token = artifacts.require("Token")
const Market = artifacts.require("Market")

module.exports = async function(deployer, network, accounts) {
    // 部署电力代币合约
    await deployer.deploy(Token, 'Power Token', 'PT');
    const tokenInstance = await Token.deployed()

    // 部署Market合约
    await deployer.deploy(Market);
    const marketInstance = await Market.deployed()
    // 全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"))

    // 进行买卖的时候只能使用ganache里面的10个账号，因为他们已经在这里对合约进行了授权，否则需要手动授权（页面就不做那么复杂了）
    // 转账100万代币给卖家1
    await tokenInstance.transfer(accounts[1], web3.utils.toWei("1000000", "ether"))
    // 也全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[1] })

    // 转账100万代币给卖家2
    await tokenInstance.transfer(accounts[2], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), {from: accounts[2]})

    // 转账100万代币给卖家3
    await tokenInstance.transfer(accounts[3], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[3] })

    // 转账100万代币给卖家4
    await tokenInstance.transfer(accounts[4], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[4] })

    // 转账100万代币给卖家5
    await tokenInstance.transfer(accounts[5], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[5] })

    // 转账100万代币给卖家6
    await tokenInstance.transfer(accounts[6], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[6] })

    // 转账100万代币给卖家7
    await tokenInstance.transfer(accounts[7], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[7] })

    // 转账100万代币给卖家8
    await tokenInstance.transfer(accounts[8], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[8] })

    // 转账100万代币给卖家9
    await tokenInstance.transfer(accounts[9], web3.utils.toWei("1000000", "ether"))
    // 仍然全部授权给Market合约
    await tokenInstance.approve(marketInstance.address, web3.utils.toWei("100000000", "ether"), { from: accounts[9] })
}
