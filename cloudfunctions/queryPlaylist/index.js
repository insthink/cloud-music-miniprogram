// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-77gm2'
})

const rp = require('request-promise')
const URL = 'http://musicapi.xiecheng.live/personalized'
const db = cloud.database()
const playlistTable = db.collection('playlist')

const MAX_LIMIT = 100

// 云函数入口函数
exports.main = async (event, context) => {
  // 获取播放列表
  const playlist = await rp(URL).then(res => {
    return JSON.parse(res).result
  })

  // 分批请求数据库
  const dbCount = await playlistTable.count()
  const total = dbCount.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  let dataPList = [];
  for (let i = 0; i < batchTimes; ++i) {
    const dataP = playlistTable
                        .skip(MAX_LIMIT * i)
                        .limit(MAX_LIMIT)
                        .get()
    dataPList.push(dataP)
  }

  let dataObject = {
    data: []
  }
  if (dataPList.length > 0) {
    await Promise.all(dataPList).then(
      resList => {
        dataObject = resList.reduce((acc, cur) => {
          return {
            data: acc.data.concat(cur.data)
          }
        })
      }
    )
  }
  
  // 去重(直接在.get()后面加.data是不行的)
  // const dbGet = await playlistTable.get()
  const addList = removeDuplicates(playlist, dataObject.data)

  // 插入数据库
  for (let i = 0; i < addList.length; ++i) {
    await playlistTable.add({
      data: {
        ...addList[i],
        createTime: db.serverDate()
      }
    })
    .then(() => console.log('insert success'))
    .catch(err => console.log(err))
  }

  // 返回新增数据的长度
  return addList.length
  
}

// 去重操作
removeDuplicates = (rqList, dbList) => {
  const dbIdList = dbList.map(item => item.id)
  // 在请求到的list中找到现有dblist中没有的
  return rqList.filter(item => dbIdList.indexOf(item.id) < 0)
}

