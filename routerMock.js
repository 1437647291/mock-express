const express = require('express');
const dayjs = require('dayjs');
const mon = require('./mongoConfig');
const mockRouter = express.Router();
const app = express();

const getMockinterface = () => {
  mon('interfaceList').then(collection => {
    collection.find().then((interfaces) => {
      // 循环创建接口
      interfaces.forEach(interfaceItem => {
        const { methodType, interfaceName, id } = interfaceItem;
        mockRouter[methodType === '1' ? 'get' : 'post'](interfaceName, async (req, res) => {
          const jsonCollection = await mon('jsonArr');
          const jsonList = await jsonCollection.find();
          res.send(jsonList.find(jsonItem => jsonItem.parentId === id && jsonItem.default === 1)?.jsonContent);
        });
      })
    });
  });
};
getMockinterface();

mockRouter.get('/interface/list', async (req, res) => {
  const { currentPage, pageSize, name } = req.query;
  const collection = await mon('interfaceList');
  const result = await collection.find(name ? { "interfaceName": name } : {});
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
      total: result.length,
      list: result,
    },
    msg: '查询成功'
  });
});

mockRouter.post('/interface/add', async (req, res) => {
  const data = req.body;
  const collection = await mon('interfaceList');
  await collection.add({ ...data, id: `IF_${new Date().getTime()}`, time: dayjs().format('YYYY-MM-DD HH:mm:ss') });
  getMockinterface();
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
  getMockinterface();
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
  getMockinterface();
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
  getMockinterface();
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
  getMockinterface();
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
  getMockinterface();
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
  getMockinterface();
  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

mockRouter.post('/user/login', async (req, res) => {
  const data = req.body;
  const collection = await mon('user');

  const currentUser = await collection.search({ account: data.account });
  if (currentUser.length) {
    if (currentUser[0].password === data.password) {
      res.send({
        code: 200,
        data: Math.random(),
        msg: '登陆成功'
      });
    } else {
      res.send({
        code: 200,
        data: true,
        msg: '账号或密码错误'
      });
    }
  } else {
    res.send({
      code: 200,
      data: false,
      msg: '账号未注册，请前往注册'
    });
  }
});

mockRouter.post('/user/register', async (req, res) => {
  const data = req.body;
  const collection = await mon('user');
  const currentUser = await collection.search({ account: data.account });
  if (currentUser.length) {
    res.send({
      code: 500,
      data: false,
      msg: '账号已注册，请前往登陆'
    });
  } else {
    await collection.add({ ...data, userId: `UID${new Date().getTime()}` });
    res.send({
      code: 200,
      data: true,
      msg: '注册成功，请前往登陆'
    })
  };
})

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
});

mockRouter.get('/my/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const intervalId = setInterval(() => {
    const message = `Data at ${new Date().toLocaleTimeString()}`;
    res.write(`data: ${message}\n\n`);
  }, 2000);
 
    // 当客户端断开连接时，清除定时器
    req.on('close', () => {
      clearInterval(intervalId);
    });
});

module.exports = mockRouter;
