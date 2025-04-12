<script>
export default {
  onLaunch: function() {
    console.log('App Launch');
    // 检查权限
    this.checkPermissions();
  },
  onShow: function() {
    console.log('App Show');
  },
  onHide: function() {
    console.log('App Hide');
  },
  methods: {
    checkPermissions() {
      // 检查定位权限
      uni.getLocation({
        type: 'gcj02',
        success: function() {
          console.log('定位权限已授权');
        },
        fail: function() {
          console.log('定位权限未授权');
          uni.showModal({
            title: '提示',
            content: '需要获取您的位置信息，请在设置中打开定位权限',
            showCancel: false
          });
        }
      });
    }
  }
};
</script>

<style>
/* 每个页面公共css */
@import './uni.scss';
</style>
