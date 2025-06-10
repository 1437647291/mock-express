// const mongoose = require('mongoose');
// const db_url = "mongodb://127.0.0.1:27017";
// mongoose.connect(db_url, { useNewUrlParser:true,useUnifiedTopology:true });
// mongoose.connection.on('connected',function(){
//   console.log('连接成功：',db_url);
// })
// //3.连接失败
// mongoose.connection.on('error',function(err){
//   console.log('连接错误：',err);
// })
// //4.断开连接
// mongoose.connection.on('disconnection',function(){
//   console.log('断开连接');
// });

const e = require('express');

// module.exports = mongoose;


var MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://39.99.254.132:27017";
const url = "mongodb://127.0.0.1:27017";
// const url = "mongodb://39.99.254.132:27017";
const client = new MongoClient(url);
// let dbs;

// client.connect().then(res => {
//   dbs = res.db('mock');
// });

async function main(collectionName) {
  // const client = new MongoClient(url);
  dbs = client.db('mock');
  // if (!dbs) {
  //   return;
  // }
  collections = dbs.collection(collectionName);
  // 查找方法 带分页
  const find = (data) => {
    // if (data?.jsonId) {
    //   return collections.find({jsonId: data.jsonId}).toArray();
    // };

    // if (data?.dafault) {
    //   return collections.find({default: data?.dafault}).toArray();
    // };
    
    if (data) {
      const { currentPage = 1, pageSize = 10, name } = data;
      const limitNum = Number(pageSize);
      const formatCurPage = limitNum * (Number(currentPage) - 1);
      return collections.find(data).limit(limitNum).skip(formatCurPage).toArray();
    }
    return collections.find().toArray();
  };

  // 查找方法 不带分页
  const search = (data) => {
    return collections.find(data).toArray();
  };

  // 增加方法
  const add = (data) => {
    if (data) {
      if (Array.isArray(data)) {
        return collections.insertMany(data);
      } else {
        return collections.insertOne(data);
      };
    } else {
      console.log('参数不完整，请补充！');
    };
  };

  // 删除方法
  const del = (data) => {
    if (data) {
      if (Array.isArray(data)) {
        collections.deleteMany(data);
      } else {
        collections.deleteOne(data);
      }
    } else {
      console.log('参数不完整');
    }
  };

  // 更新方法
  const update = async (id, newData, type) => {
    if (id) {
      const result = await collections.updateOne({ [type]: id }, { $set: newData });
      console.log('result', result)
    } else {
      console.log('参数不完整');
    }
  };

  // 批量更新方法
  // const updateMany = async (fieldName, newData, fieldValue) => {
  //   if (id) {
  //     const result = await collections.updateOne({ [fieldName]: fieldValue }, { $set: newData });
  //     console.log('result', result)
  //   } else {
  //     console.log('参数不完整');
  //   }
  // }

  return { find, add, del, update, search }
  // const stu = await students.find().toArray();
  // await students.insertMany([{ name: 'lyb', age: '80' }, { name: 'ddc', age: '30' }, { name: 'sdx', age: '40' }])
}

module.exports = main



