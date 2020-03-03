// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const rq = require('request-promise')

const BASE_URL = 'http://musicapi.xiecheng.live'

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({event})

  app.router('playlist', async (cxt, next) => {
    cxt.body =  await cloud.database().collection('playlist')
      .skip(event.start)
      .limit(event.limit)
      .orderBy('createTime', 'desc')
      .get()
      .then(res => {
        return res
      })  
  })

  app.router('musiclist', async (cxt, next) => {
    const URL = `${BASE_URL}/playlist/detail?id=${event.playlistId}`
    cxt.body = await rq(URL).then(res => {
      return JSON.parse(res)
    })
  })
  
  return app.serve()
}