/**
 * 位置计算工具类
 */
export default {
  /**
   * 将GPS坐标转换为地图上的像素坐标
   * @param {Object} gps - GPS坐标 {latitude, longitude}
   * @param {Array} referencePoints - 参考点数组 [{gps: {latitude, longitude}, pixel: {x, y}}]
   * @param {String} orientation - 地图方向 'north', 'south', 'east', 'west'
   * @param {Number} scale - 比例尺
   * @param {String} scaleUnit - 比例尺单位 'm_cm', 'm_px'
   * @return {Object} 像素坐标 {x, y}
   */
  gpsToPixel(gps, referencePoints, orientation, scale, scaleUnit) {
    // 需要至少一个参考点
    if (!referencePoints || referencePoints.length === 0) {
      console.error('需要至少一个参考点');
      return null;
    }
    
    // 使用第一个参考点
    const reference = referencePoints[0];
    
    // 计算GPS坐标差异
    const latDiff = gps.latitude - reference.gps.latitude;
    const lngDiff = gps.longitude - reference.gps.longitude;
    
    // 根据方向调整坐标
    let xDiff, yDiff;
    
    switch (orientation) {
      case 'north':
        xDiff = lngDiff;
        yDiff = -latDiff;
        break;
      case 'south':
        xDiff = -lngDiff;
        yDiff = latDiff;
        break;
      case 'east':
        xDiff = latDiff;
        yDiff = lngDiff;
        break;
      case 'west':
        xDiff = -latDiff;
        yDiff = -lngDiff;
        break;
      default:
        xDiff = lngDiff;
        yDiff = -latDiff;
    }
    
    // 转换为米
    const meterPerLat = 111320; // 每度纬度约111.32公里
    const meterPerLng = 111320 * Math.cos(gps.latitude * Math.PI / 180); // 每度经度随纬度变化
    
    const xMeters = xDiff * meterPerLng;
    const yMeters = yDiff * meterPerLat;
    
    // 根据比例尺转换为像素
    let pixelPerMeter;
    if (scaleUnit === 'm_cm') {
      // 米/厘米，需要转换为像素
      // 假设屏幕DPI为96，1厘米约等于37.8像素
      pixelPerMeter = 37.8 / scale;
    } else {
      // 米/像素
      pixelPerMeter = 1 / scale;
    }
    
    const xPixels = xMeters * pixelPerMeter;
    const yPixels = yMeters * pixelPerMeter;
    
    // 计算最终像素坐标
    return {
      x: reference.pixel.x + xPixels,
      y: reference.pixel.y + yPixels
    };
  },
  
  /**
   * 计算两点之间的距离（米）
   * @param {Object} point1 - 坐标点1 {latitude, longitude}
   * @param {Object} point2 - 坐标点2 {latitude, longitude}
   * @return {Number} 距离（米）
   */
  calculateDistance(point1, point2) {
    const R = 6371000; // 地球半径，单位米
    const lat1 = point1.latitude * Math.PI / 180;
    const lat2 = point2.latitude * Math.PI / 180;
    const latDiff = (point2.latitude - point1.latitude) * Math.PI / 180;
    const lngDiff = (point2.longitude - point1.longitude) * Math.PI / 180;
    
    const a = Math.sin(latDiff/2) * Math.sin(latDiff/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(lngDiff/2) * Math.sin(lngDiff/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return distance;
  }
};