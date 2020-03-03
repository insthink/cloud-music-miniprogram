// components/playlist/playlist.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    playlistItem: {
      type: Object
    }
  },

  /**
  * 观察者：监听变量 
  */
  observers: {
    ["playlistItem.playCount"](cnt) {
      this.setData({
        _cnt: this._transformNum(cnt, 1)
      });
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    _cnt: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {

    // 路由跳转到音乐列表
    goToMusiclist() {
      wx.navigateTo({
        url: `../../pages/musiclist/musiclist?playlistId=${this.properties.playlistItem.id}`,
      })
    },


    // 数值格式转换
    _transformNum(n, precision) {
      // 省略小数部分
      const nStr = n.toString().split('.')[0]
      // 万级以下，直接返回
      if (nStr.length <= 5) {
        return n
      }
      // 万到千万
      if (nStr.length > 5 && nStr.length <= 8) {
        const integer = parseInt(parseInt(nStr) / 10000)
        const decimal = parseInt(parseInt(nStr) % 10000)
        return `${integer.toString()}.${decimal.toString().substr(0, precision)}万`
      }
      // 亿以上
      if (nStr.length > 8) {
        const integer = parseInt(parseInt(nStr) / 100000000)
        const decimal = parseInt(parseInt(nStr) % 100000000)
        return `${integer.toString()}.${decimal.toString().substr(0, precision)}亿`
      }
    }
  }
})
