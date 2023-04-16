<template>
    <van-config-provider :theme-vars="appStore.themeVars">
        <!-- 导航栏 -->
        <van-nav-bar title="新闻详情" left-arrow @click-left="appStore.backHome">
            <template #right>
                <view class="text-white" v-if="appStore.isConnect" @tap="appStore.copy">{{ appStore.subAddress }}</view>
                <view v-else>
                    <van-button type="primary" size="small" @click="appStore.dappInit">连接钱包</van-button>
                </view>
            </template>
        </van-nav-bar>
        <!-- 新闻内容 -->
        <view class="px-3 pt-5">
            <view class="text-xl font-bold text-center pb-5">{{ newsData.title }}</view>
            <view class="pt-5 pb-10 text-gray-1000">{{ newsData.content }}</view>
            <view class="text-xs text-right text-gray-100">发布人：{{ shortPublisher }}</view>
            <view class="text-xs text-right text-gray-100 pt-3">发布时间：{{ timestamp }}</view>
        </view>
    </van-config-provider>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import useAppStore from '@/store/modules/app'
import { timeFormat } from '@/utils/tool'

// 全局状态
const appStore = useAppStore()

// 新闻数据
const newsData = reactive({
    id: '',
    title: '',
    content: '',
    timestamp: '',
    publisher: '',
})

// 发布人简写
const shortPublisher = computed(() => {
    return newsData.publisher.slice(0, 5) + '...' + newsData.publisher.slice(-5)
})

// 时间格式化
const timestamp = computed(() => {
    return timeFormat(newsData.timestamp, 'yyyy-MM-dd hh:mm:ss')
})

// 生命周期钩子
onLoad(async (options) => {
    await appStore.dappInit()
    options.data = JSON.parse(options.data)
    newsData.id = options.data[0]
    newsData.title = options.data[1]
    newsData.content = options.data[2]
    newsData.timestamp = options.data[3]
    newsData.publisher = options.data[4]
})
</script>