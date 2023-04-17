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
            <!-- 内容区 -->
            <view class="px-3 pt-3">
                <van-tabs v-model:active="active" type="card">
                    <van-tab title="买单列表">
                        <van-cell-group v-if="appStore.dapp.bidsLists.length">
                            <van-cell v-for="(item, index) in appStore.dapp.bidsLists" :key="item.id" :title="item.title"
                                :value="timeFormat(item.timestamp)" center @click="detail(index)">
                                <template #right-icon>
                                    <van-icon name="arrow" />
                                </template>
                            </van-cell>
                        </van-cell-group>
                        <van-empty v-else image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
                            image-size="80" description="暂无买单" />
                    </van-tab>
                    <van-tab title="卖单列表">
                        <van-cell-group v-if="appStore.dapp.offersLists.length">
                            <van-cell v-for="(item, index) in appStore.dapp.offersLists" :key="item.id" :title="item.title"
                                :value="timeFormat(item.timestamp)" center @click="detail(index)">
                                <template #right-icon>
                                    <van-icon name="arrow" />
                                </template>
                            </van-cell>
                        </van-cell-group>
                        <van-empty v-else image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
                            image-size="80" description="暂无卖单" />
                    </van-tab>
                </van-tabs>
            </view>
            <!-- 动作面板 -->
            <van-action-sheet v-model:show="show" :actions="actions" @select="onSelect" close-on-click-action/>
        </view>
    </van-config-provider>
</template>
<script setup>
import { onLoad } from '@dcloudio/uni-app'
import useAppStore from '@/store/modules/app'
import { ref } from 'vue'

// 全局状态
const appStore = useAppStore()

// 动作面板
const show = ref(false);
const actions = [
    { type: 1, name: '挂买单: 单价1元，买入20度' },
    { type: 2, name: '挂卖单: 单价5元，卖出10度' },
    { type: 100, name: '订单撮合成交' },
];
const onSelect = async (item) => {
    show.value = false;
    // switch (item.type) {
    //     case 1:
    //         await appStore.addOffer(5, 10);
    //         break;
    // }
    await appStore.addOffer(5, 10);
};

// 生命周期钩子
onLoad(async () => {
    await appStore.dappInit()
    await appStore.getOffersList()
    await appStore.getBidsList()
})
</script>
