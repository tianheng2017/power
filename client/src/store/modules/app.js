import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { showDialog } from 'vant'
import Web3 from 'web3'
import Market from '@/contracts/Market.json'
import Token from '@/contracts/Token.json'

const useAppStore = defineStore('app', () => {
    // 全局组件样式
    const themeVars = reactive({
        navBarBackground: '#07c160',
        navBarTitleTextColor: '#fff',
        navBarIconColor: '#fff',
    });

    // 钱包信息
    const isConnect = ref(false)
    const address = ref('')
    const subAddress = computed(() => {
        return address.value.slice(0, 5) + '...' + address.value.slice(-5)
    })
    const tabActive = ref(0)

    // web3/合约数据
    const dapp = reactive({
        web3: null,
        marketInstance: null,
        tokenInstance: null,
        usdtInstance: null,
        offersLists: [],
        bidsLists: [],
        accountInfo: {
            balance: 0,
            tokenBalance: 0,
            contractBalance: 0,
            contractTokenBalance: 0,
        },
    })

    // 钱包初始化
    const dappInit = async () => {
        try {
            // 检查环境
            if (typeof window.ethereum == 'undefined') {
                throw { code: -1, message: "请安装metamask或在dapp环境中打开页面" }
            }
            // 监听钱包切换
            window.ethereum.on('accountsChanged', () => {
                window.location.reload();
            });
            // 监听网络切换
            window.ethereum.on('chainChanged', () => {
                window.location.reload()
            })
            // 检查钱包是否解锁
            window.ethereum._metamask.isUnlocked().then((res) => {
                if (!res) throw { code: -1, message: "请解锁您的钱包" }
            })
            // 检查网络
            if (window.ethereum.chainId !== 1337 && window.ethereum.networkVersion !== '1337') {
                throw { code: -1, message: "请切换到ganache网络" }
            }
            // 获取当前钱包地址
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            address.value = accounts[0]
            isConnect.value = true
            // 初始化web3
            dapp.web3 = new Web3(Web3.givenProvider)
            // 实例化市场合约
            dapp.marketInstance = new dapp.web3.eth.Contract(Market.abi, Market.networks[1337].address)
            // 实例化电力合约
            dapp.tokenInstance = new dapp.web3.eth.Contract(Token.abi, Token.networks[1337].address)
            // 刷新数据
            await freshData()
        } catch (error) {
            if (error.code == 4001) error.message = "用户拒绝连接钱包"
            if (error.code == -32002) error.message = "请求已经在等待处理，请耐心等待"
            return showDialog({ message: error.message })
        }
    }

    // 返回首页
    const backHome = () => {
        uni.navigateTo({
            url: '/pages/index/index'
        })
    }

    // 复制钱包地址
    const copy = () => {
        uni.setClipboardData({
            data: address.value,
            success: () => {
                uni.showToast({
                    title: '复制成功',
                    icon: 'success',
                    duration: 2000
                })
            }
        })
    }

    // 刷新数据
    const freshData = async () => {
        // 查询钱包ETH余额
        dapp.accountInfo.balance = await getBalance(address.value)
        // 查询钱包电力
        dapp.accountInfo.tokenBalance = await getTokenBalance(address.value)
        // 查询合约ETH余额
        dapp.accountInfo.contractBalance = await getContractBalance()
        // 查询合约电力余额
        dapp.accountInfo.contractTokenBalance = await getContractTokenBalance()
        // 获取卖单列表
        await getOffersList()
        // 获取买单列表
        await getBidsList()
    }

    // 获取卖单列表
    const getOffersList = async () => {
        try {
            const res = await dapp.marketInstance.methods.getOffersList().call()
            dapp.offersLists = res
            console.log(dapp.offersLists)
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 获取买单列表
    const getBidsList = async () => {
        try {
            const res = await dapp.marketInstance.methods.getBidsList().call()
            dapp.bidsLists = res
            console.log(res)
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 充值1000电力到合约账户
    const depositToken = async (amount) => {
        try {
            await dapp.marketInstance.methods.depositToken(
                Token.networks[1337].address,
                dapp.web3.utils.toWei(amount, 'ether'),
            ).send({
                from: address.value
            })
            await freshData()
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 提取1000电力到钱包
    const withdrawToken = async (amount) => {
        try {
            await dapp.marketInstance.methods.withdrawToken(
                Token.networks[1337].address,
                dapp.web3.utils.toWei(amount, 'ether'),
            ).send({
                from: address.value,
            })
            await freshData()
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 充值50ETH到合约账户
    const depositETH = async (amount) => {
        try {
            await dapp.marketInstance.methods.depositETH().send({
                from: address.value,
                value: dapp.web3.utils.toWei(amount, 'ether'),
            })
            await freshData()
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 提取50ETH到钱包
    const withdrawETH = async (amount) => {
        try {
            await dapp.marketInstance.methods.withdrawETH(
                dapp.web3.utils.toWei(amount, 'ether')
            ).send({
                from: address.value,
            })
            await freshData()
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 挂卖单
    const addOffer = async (price, quantity) => {
        try {
            await dapp.marketInstance.methods.addOffer(
                Token.networks[1337].address,
                dapp.web3.utils.toWei(price, 'ether'),
                dapp.web3.utils.toWei(quantity, 'ether'),
            ).send({
                from: address.value,
            })
            await freshData()
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 挂买单
    const addBid = async (price, quantity) => {
        try {
            await dapp.marketInstance.methods.addBid(
                Token.networks[1337].address,
                dapp.web3.utils.toWei(price, 'ether'),
                dapp.web3.utils.toWei(quantity, 'ether'),
            ).send({
                from: address.value,
            })
            await freshData()
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 查询钱包ETH
    const getBalance = async () => {
        try {
            const balance = await dapp.web3.eth.getBalance(address.value)
            return dapp.web3.utils.fromWei(balance, 'ether')
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 查询钱包电力
    const getTokenBalance = async (account) => {
        try {
            const tokenBalance = await dapp.tokenInstance.methods.balanceOf(account).call({
                from: address.value
            })
            return dapp.web3.utils.fromWei(tokenBalance, 'ether')
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 查询合约ETH
    const getContractBalance = async () => {
        try {
            const balance = await dapp.marketInstance.methods.getAccountBalance().call({
                from: address.value
            })
            return dapp.web3.utils.fromWei(balance, 'ether')
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 查询合约电力
    const getContractTokenBalance = async () => {
        try {
            const balance = await dapp.marketInstance.methods.getAccountTokenBalance(
                Token.networks[1337].address
            ).call({
                from: address.value
            })
            return dapp.web3.utils.fromWei(balance, 'ether')
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 撮合订单
    const orderMaching = async () => {
        try {
            await dapp.marketInstance.methods.orderMaching().send({
                from: address.value
            })
            await freshData()
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    return {
        themeVars,
        dapp,
        isConnect,
        address,
        subAddress,
        tabActive,
        dappInit,
        backHome,
        copy,
        freshData,
        getOffersList,
        getBidsList,
        depositToken,
        withdrawToken,
        getBalance,
        getTokenBalance,
        getContractBalance,
        getContractTokenBalance,
        depositETH,
        withdrawETH,
        addOffer,
        addBid,
        orderMaching,
    }
}, {
    persist: true
})

export default useAppStore