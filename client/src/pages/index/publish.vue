<template>
    <van-config-provider :theme-vars="appStore.themeVars">
        <!-- 导航栏 -->
        <van-nav-bar title="发布新闻" left-arrow @click-left="appStore.backHome">
            <template #right>
                <view class="text-white" v-if="appStore.isConnect" @tap="appStore.copy">{{ appStore.subAddress }}</view>
                <view v-else>
                    <van-button type="primary" size="small" @click="appStore.dappInit">连接钱包</van-button>
                </view>
            </template>
        </van-nav-bar>
        <!-- form表单 -->
        <van-form class="pt-3" @submit="onSubmit">
            <van-cell-group inset>
                <van-field v-model="formData.title" name="title" label="新闻名称" placeholder="请输入新闻名称"
                    :rules="[{ required: true, message: '请填写新闻名称' }]" clearable />
                <van-field type="textarea" v-model="formData.content" name="content" label="新闻内容" placeholder="请输入新闻内容"
                    :rules="[{ required: true, message: '请填写新闻内容' }]" clearable show-word-limit :autosize="{ minHeight: 100 }"/>
            </van-cell-group>
            <div style="margin: 16px;">
                <van-button round block type="primary" native-type="submit">
                    提交
                </van-button>
            </div>
        </van-form>
    </van-config-provider>
</template>
<script setup>
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import useAppStore from '@/store/modules/app'

// 全局状态
const appStore = useAppStore()

// 新闻表单数据
const formData = reactive({
    title: '',
    content: ''
})

// 提交表单
const onSubmit = async (data) => {
    console.log(data)
    await appStore.publishNews(data)
}

// 生命周期钩子
onLoad(async () => {
    await appStore.dappInit()
})
</script>