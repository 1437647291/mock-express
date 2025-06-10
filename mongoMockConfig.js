const e = require('express');

var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

async function main(dbName, collectionName) {
  const client1 = await client.connect();
  const dbs = client1.db(dbName);
  const collections = dbs.collection(collectionName);
  // 查找方法
  const find = (data) => {
    if (data) {
      const { currentPage = 1, pageSize = 10, name } = data;
      const limitNum = Number(pageSize);
      const formatCurPage = limitNum * (Number(currentPage) - 1);
      return collections.find({...data}).limit(limitNum).skip(formatCurPage).toArray();
    }
    return collections.find().toArray();
  };

  // 增加方法
  const add = (data) => {
    if (data) {
      if (Array.isArray(data)) {
        return collections.insertMany(data);
      } else {
        data.id = new Date().getTime();
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
  const update = async (id, newData) => {
    if (id) {
      const result = await collections.updateOne({ id }, { $set: newData });
    } else {
      console.log('参数不完整');
    }
  }

  return { find, add, del, update }
  // const stu = await students.find().toArray();
  // await students.insertMany([{ name: 'lyb', age: '80' }, { name: 'ddc', age: '30' }, { name: 'sdx', age: '40' }])
}

module.exports = main



