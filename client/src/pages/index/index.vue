<template>
    <van-config-provider :theme-vars="appStore.themeVars">
        <view>
            <!-- 导航栏 -->
            <van-nav-bar title="新闻合约测试">
                <template #left>
                    <view class="text-white" v-if="appStore.isConnect" @tap="appStore.copy">{{ appStore.subAddress }}</view>
                    <view v-else>
                        <van-button type="primary" size="small" @click="appStore.dappInit">连接钱包</van-button>
                    </view>
                </template>
                <template #right>
                    <van-button type="primary" size="small" @click="publish">发布新闻</van-button>
                </template>
            </van-nav-bar>
            <view class="px-3 pt-3">
                <van-cell-group v-if="appStore.dapp.lists.length">
                    <van-cell 
                        v-for="(item, index) in appStore.dapp.lists" 
                        :key="item.id" 
                        :title="item.title" 
                        :value="timeFormat(item.timestamp)" 
                        center 
                        @click="detail(index)"
                    >
                        <template #right-icon>
                            <van-icon name="arrow" />
                        </template>
                    </van-cell>
                </van-cell-group>
                <van-empty
                    v-else
                    image="https://fastly.jsdelivr.net/npm/@vant/assets/custom-empty-image.png"
                    image-size="80"
                    description="暂无新闻"
                />
            </view>
        </view>
    </van-config-provider>
</template>
<script setup>
import { onLoad } from '@dcloudio/uni-app'
import useAppStore from '@/store/modules/app'
import { timeFormat } from '@/utils/tool'

// 全局状态
const appStore = useAppStore()

// 发布新闻
const publish = () => {
    uni.navigateTo({
        url: '/pages/index/publish'
    })
}

// 新闻详情
const detail = (index) => {
    uni.navigateTo({
        url: '/pages/index/detail?data=' + JSON.stringify(appStore.dapp.lists[index])
    })
}

// 生命周期钩子
onLoad(async () => {
    await appStore.dappInit()
    await appStore.getNewsList()
})
</script>
