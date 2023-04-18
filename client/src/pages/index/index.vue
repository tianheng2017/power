<template>
    <van-config-provider :theme-vars="appStore.themeVars">
        <view>
            <!-- 导航栏 -->
            <van-nav-bar title="交易市场">
                <template #left>
                    <view class="text-white" v-if="appStore.isConnect" @tap="appStore.copy">{{ appStore.subAddress }}</view>
                    <view v-else>
                        <van-button type="primary" size="small" @click="appStore.dappInit">连接钱包</van-button>
                    </view>
                </template>
                <template #right>
                    <van-button type="default" size="small" v-if="appStore.isConnect" @click="show = true">操作</van-button>
                    <view v-else></view>
                </template>
            </van-nav-bar>
            <!-- 账户区 -->
            <view class="px-3 pt-3">
                <van-row justify="center">
                    <van-col span="6" class="text-center">
                        <view>钱包ETH</view>
                        <view class="pt-1">
                            <van-text-ellipsis :content="appStore.dapp.accountInfo.balance" />
                        </view>
                    </van-col>
                    <van-col span="6" class="text-center">
                        <view>钱包电力</view>
                        <view class="pt-1">
                            <van-text-ellipsis :content="appStore.dapp.accountInfo.tokenBalance" />
                        </view>
                    </van-col>
                    <van-col span="6" class="text-center">
                        <view>合约ETH</view>
                        <view class="pt-1">
                            <van-text-ellipsis :content="appStore.dapp.accountInfo.contractBalance" />
                        </view>
                    </van-col>
                    <van-col span="6" class="text-center">
                        <view>合约电力</view>
                        <view class="pt-1">
                            <van-text-ellipsis :content="appStore.dapp.accountInfo.contractTokenBalance" />
                        </view>
                    </van-col>
                </van-row>
            </view>
            <!-- 内容区 -->
            <view class="px-3 pt-3">
                <van-tabs v-model:active="appStore.tabActive" type="card">
                    <van-tab title="买单列表">
                        <van-cell-group v-if="appStore.dapp.bidsLists.length" class="pt-2">
                            <van-swipe-cell 
                                v-for="item in appStore.dapp.bidsLists" 
                                :key="item.bidNumber"
                                :name="item.bidNumber"
                            >
                                <van-cell 
                                    :title="`买家：` + sliceAddress(item.buyer)" 
                                    :value="`价格${appStore.dapp.web3.utils.fromWei(item.price, 'ether')}，数量${appStore.dapp.web3.utils.fromWei(item.quantity, 'ether')}`" 
                                />
                                <template #right>
                                    <van-button square type="danger" text="删除" />
                                </template>
                            </van-swipe-cell>
                        </van-cell-group>
                        <van-empty v-else image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
                            image-size="80" description="暂无买单" />
                    </van-tab>
                    <van-tab title="卖单列表">
                            <van-cell-group v-if="appStore.dapp.offersLists.length" class="pt-2">
                                <van-swipe-cell 
                                    v-for="item in appStore.dapp.offersLists" 
                                    :key="item.offerNumber"
                                    :name="item.offerNumber"
                                >
                                    <van-cell 
                                        :title="`卖家：` + sliceAddress(item.seller)" 
                                        :value="`价格${appStore.dapp.web3.utils.fromWei(item.price, 'ether')}，数量${appStore.dapp.web3.utils.fromWei(item.quantity, 'ether')}`" 
                                    />
                                    <template #right>
                                        <van-button square type="danger" text="删除" />
                                    </template>
                                </van-swipe-cell>
                            </van-cell-group>
                        <van-empty v-else image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
                            image-size="80" description="暂无卖单" />
                    </van-tab>
                </van-tabs>
            </view>
            <!-- 动作面板 -->
            <van-action-sheet v-model:show="show" :actions="actions" @select="onSelect" close-on-click-action />
        </view>
    </van-config-provider>
</template>
<script setup>
import { onLoad } from '@dcloudio/uni-app'
import useAppStore from '@/store/modules/app'
import { ref } from 'vue'
import { sliceAddress } from '@/utils/tool'

// 全局状态
const appStore = useAppStore()

// 动作面板
const show = ref(false)
const actions = [
    { type: 1, name: '充值1000度电到合约账户' },
    { type: 2, name: '提取1000度电到钱包' },
    { type: 3, name: '充值50ETH到合约账户' },
    { type: 4, name: '提取50ETH到钱包' },
    { type: 5, name: '挂买单: 单价5ETH，买入5度电' },
    { type: 6, name: '挂买单: 单价3ETH，买入3度电' },
    { type: 7, name: '挂卖单: 单价5ETH，卖出7度电' },
    { type: 8, name: '挂卖单: 单价1ETH，卖出10度电' },
    { type: 100, name: '撮合订单成交' },
]
const onSelect = async (item) => {
    show.value = false;
    switch (item.type) {
        case 1:
            await appStore.depositToken("1000")
            break
        case 2:
            await appStore.withdrawToken("1000")
            break
        case 3:
            await appStore.depositETH("50")
            break
        case 4:
            await appStore.withdrawETH("50")
            break
        case 5:
            await appStore.addBid("5", "5")
            break
        case 6:
            await appStore.addBid("3", "3");
            break
        case 7:
            await appStore.addOffer("5", "7");
            break
        case 8:
            await appStore.addOffer("1", "10");
            break
        case 100:
            await appStore.orderMaching()
            break
    }
}

// 生命周期钩子
onLoad(async () => {
    await appStore.dappInit()
})
</script>
