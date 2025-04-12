<template>
  <view class="container">
    <!-- 顶部操作栏 -->
    <view class="header">
      <u-button icon="camera-fill" type="primary" @click="takePhoto">拍照</u-button>
      <u-button icon="photo" @click="choosePhoto">从相册选择</u-button>
      <u-button icon="setting" @click="showSettings = true">设置</u-button>
    </view>
    
    <!-- 地图显示区域 -->
    <view class="map-container">
      <image v-if="mapImage" :src="mapImage" mode="aspectFit" class="map-image"></image>
      <view v-else class="map-placeholder">
        <u-icon name="map" size="80" color="#999"></u-icon>
        <text>请拍摄或选择地图图片</text>
      </view>
      
      <!-- 当前位置标记 -->
      <view v-if="mapImage && currentPosition" class="position-marker" 
            :style="{ left: currentPosition.x + 'px', top: currentPosition.y + 'px' }">
        <u-icon name="map-fill" color="red" size="24"></u-icon>
      </view>
    </view>
    
    <!-- 底部控制区 -->
    <view class="footer">
      <u-button v-if="mapImage" type="success" @click="startTracking" :disabled="isTracking">
        {{ isTracking ? '正在定位中...' : '开始定位' }}
      </u-button>
    </view>
    
    <!-- 设置弹窗 -->
    <u-popup v-model="showSettings" mode="bottom" height="60%">
      <view class="settings-container">
        <view class="settings-header">
          <text class="settings-title">地图设置</text>
          <u-icon name="close" @click="showSettings = false"></u-icon>
        </view>
        
        <view class="settings-content">
          <!-- 方位设置 -->
          <view class="setting-item">
            <text class="setting-label">地图方向:</text>
            <u-radio-group v-model="mapOrientation">
              <u-radio label="北向上" name="north"></u-radio>
              <u-radio label="南向上" name="south"></u-radio>
              <u-radio label="东向上" name="east"></u-radio>
              <u-radio label="西向上" name="west"></u-radio>
            </u-radio-group>
          </view>
          
          <!-- 比例尺设置 -->
          <view class="setting-item">
            <text class="setting-label">比例尺设置:</text>
            <view class="scale-input">
              <u-input v-model="scaleValue" type="number" placeholder="输入数值"></u-input>
              <u-radio-group v-model="scaleUnit">
                <u-radio label="米/厘米" name="m_cm"></u-radio>
                <u-radio label="米/像素" name="m_px"></u-radio>
              </u-radio-group>
            </view>
          </view>
          
          <!-- 参考点设置 -->
          <view class="setting-item">
            <text class="setting-label">设置参考点:</text>
            <u-button type="primary" @click="setReferencePoint">标记已知位置</u-button>
          </view>
        </view>
        
        <view class="settings-footer">
          <u-button type="primary" @click="saveSettings">保存设置</u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script>
export default {
  data() {
    return {
      mapImage: '', // 地图图片路径
      showSettings: false, // 是否显示设置弹窗
      mapOrientation: 'north', // 地图方向
      scaleValue: 100, // 比例尺数值
      scaleUnit: 'm_cm', // 比例尺单位
      isTracking: false, // 是否正在定位
      currentPosition: null, // 当前位置坐标 {x, y}
      referencePoints: [] // 参考点列表
    }
  },
  methods: {
    // 拍照获取地图
    takePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          this.mapImage = res.tempFilePaths[0];
          this.showSettings = true; // 拍照后显示设置弹窗
        }
      });
    },
    
    // 从相册选择地图
    choosePhoto() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          this.mapImage = res.tempFilePaths[0];
          this.showSettings = true; // 选择图片后显示设置弹窗
        }
      });
    },
    
    // 设置参考点
    setReferencePoint() {
      // 这里需要实现点击地图设置参考点的逻辑
      uni.showToast({
        title: '请点击地图上的已知位置',
        icon: 'none'
      });
    },
    
    // 保存设置
    saveSettings() {
      this.showSettings = false;
      uni.showToast({
        title: '设置已保存',
        icon: 'success'
      });
    },
    
    // 开始定位
    startTracking() {
      if (this.isTracking) return;
      
      this.isTracking = true;
      
      // 获取当前位置
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('当前位置:', res.latitude, res.longitude);
          // 这里需要实现GPS坐标转换为地图像素坐标的逻辑
          // 暂时使用模拟位置
          this.currentPosition = {
            x: 150,
            y: 150
          };
        },
        fail: (err) => {
          uni.showToast({
            title: '获取位置失败: ' + err.errMsg,
            icon: 'none'
          });
          this.isTracking = false;
        }
      });
    }
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 20rpx;
}

.header {
  display: flex;
  justify-content: space-between;
  padding: 10rpx 0;
}

.map-container {
  flex: 1;
  position: relative;
  margin: 20rpx 0;
  border: 1px solid #eee;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-image {
  width: 100%;
  height: 100%;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
}

.position-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.footer {
  padding: 20rpx 0;
}

.settings-container {
  padding: 30rpx;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.settings-title {
  font-size: 32rpx;
  font-weight: bold;
}

.settings-content {
  margin-bottom: 30rpx;
}

.setting-item {
  margin-bottom: 20rpx;
}

.setting-label {
  display: block;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.scale-input {
  display: flex;
  align-items: center;
}

.settings-footer {
  margin-top: 40rpx;
}
</style>
