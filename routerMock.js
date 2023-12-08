const express = require('express');
const dayjs = require('dayjs');
const mon = require('./mongoConfig');
const router = require('./router');
const mockRouter = express.Router();
const app = express();

mockRouter.get('/interface/list', async (req, res) => {
  const { currentPage, pageSize, name } = req.query;
  const collection = await mon('interfaceList');
  const list = await collection.find();
  const total = list.length;
  const result = await collection.find(req.query);

  const jsonCollection = await mon('jsonArr');
  const jsonList = await jsonCollection.find();
  
  result.forEach(item => {
    item.jsonArr = jsonList.filter(jsonItem => jsonItem.parentId === item.id);
  });
  res.send({
    code: 200,
    data: {
      current: currentPage ? currentPage : 1,
      pageSize: pageSize ? pageSize : 10,
      total,
      list: result,
    },
    msg: '查询成功'
  });
});

mockRouter.post('/interface/add', async (req, res) => {
  const data = req.body;
  const collection = await mon('interfaceList');
  await collection.add({ ...data, id: `IF_${new Date().getTime()}`, time: dayjs().format('YYYY-MM-DD HH:mm:ss') });
  app.use('/api', router);
  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

mockRouter.post('/interface/del', async (req, res) => {
  const data = req.body;
  const collection = await mon('interfaceList');
  await collection.del(data);

  const jsonCollection = await mon('jsonArr');

  await jsonCollection.del({ parentId: data.id });

  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

mockRouter.post('/interface/edit', async (req, res) => {
  const data = req.body;
  const collection = await mon('interfaceList');
  await collection.update(data.id, data, 'id');
  res.send({
    code: 200,
    data: true,
    msg: '修改成功'
  });
});

mockRouter.post('/json/add', async (req, res) => {
  const data = req.body;
  const collection = await mon('jsonArr'); 
  const jsonList = await collection.find();
  const currentJson = jsonList.find(item => item.parentId === data.parentId);

  if (!currentJson) {
    data.default = 1;
  } else {
    data.default = 0;
  };
  
  await collection.add({ ...data, jsonId: `JN_${new Date().getTime()}` });
  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

mockRouter.post('/json/del', async (req, res) => {
  const data = req.body;
  const collection = await mon('jsonArr');
  await collection.del(data);
  res.send({
    code: 200,
    data: true,
    msg: '删除成功'
  });
});

mockRouter.post('/json/edit', async (req, res) => {
  const data = req.body;
  const collection = await mon('jsonArr');
  await collection.update(data.jsonId, data, 'jsonId');
  res.send({
    code: 200,
    data: true,
    msg: '修改成功'
  });
});

mockRouter.post('/json/change', async (req, res) => {
  const data = req.body;
  const collection = await mon('jsonArr');

  // 查找需要需要default值的json对象
  const needUpdate = await collection.search({ jsonId: data.jsonId });
  // 查找同一父级下的json，将奇遇json 的 default 字段修改为 0
  const currentChose = await collection.search({ default: 1, parentId: needUpdate[0].parentId });
  
  // 更新对应的default字段
  await collection.update(currentChose[0].jsonId, { ...currentChose[0], default: 0 }, 'jsonId');
  await collection.update(data.jsonId, { ...needUpdate[0], default: 1 }, 'jsonId');

  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

mockRouter.post('/json/del111', async (req, res) => {
  const collection = await mon('interfaceList');
  const list = await collection.find();

  const jsonCollection = await mon('jsonArr');
  const jsonList = await jsonCollection.find();
  
  jsonList.forEach(async item => {
    if (!list.find(listItem => listItem.id === item.parentId)) {
      console.log(item.parentId);
      await jsonCollection.del({ parentId: item.parentId });
    }
  });
  res.send({
    code: 200,
    data: true,
    msg: '删除成功'
  })
})

module.exports = mockRouter;
