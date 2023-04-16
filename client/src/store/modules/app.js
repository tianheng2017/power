import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'
import { showDialog } from 'vant'
import Web3 from 'web3'
import NewsContract from '@/contracts/NewsContract.json'

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
    // web3/合约数据
    const dapp = reactive({
        web3: null,
        NewsContractInstance: null,
        lists: [],
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
                throw { code: -1, message: "请切换到Localhost:8575网络" }
            }
            // 获取当前钱包地址
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
            address.value = accounts[0]
            isConnect.value = true
            // 初始化web3
            dapp.web3 = new Web3(Web3.givenProvider)
            // 实例化NewsContract合约
            dapp.NewsContract = new dapp.web3.eth.Contract(NewsContract.abi, NewsContract.networks[1337].address)
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

    // 获取全部新闻数据
    const getNewsList = async () => {
        try {
            const res = await dapp.NewsContract.methods.getNewsList().call()
            dapp.lists = res
            console.log(dapp.lists)
        } catch (error) {
            return showDialog({ message: error.message })
        }
    }

    // 发布新闻
    const publishNews = async (data) => {
        try {
            const res = await dapp.NewsContract.methods.publishNews(data.title, data.content).send({from: address.value, gas: 3000000})
            console.log(res)
            return showDialog({ message: `发布成功，交易hash: ${res.transactionHash}` }).then(() => {
                uni.navigateTo({
                    url: '/pages/index/index'
                })
            });
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
        dappInit,
        backHome,
        copy,
        getNewsList,
        publishNews,
    }
}, {
    persist: true
})

export default useAppStore