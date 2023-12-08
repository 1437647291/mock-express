const express = require('express');
const mon = require('./mongoConfig');
const dayjs = require('dayjs');
const router = express.Router();

router.get('/user/list', async (req, res) => {
  const { currentPage, pageSize, name } = req.query;
  const collection = await mon('web', 'students');
  const list = await collection.find();
  const total = list.length;
  const result = await collection.find(req.query);
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

router.post('/user/add', async (req, res) => {
  const data = req.body;
  const collection = await mon('web', 'students');
  await collection.add({ ...data, time: dayjs().format('YYYY-MM-DD HH:mm:ss') });
  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

router.post('/user/del', async (req, res) => {
  const data = req.body;
  const collection = await mon('web', 'students');
  await collection.del(data);
  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

router.post('/user/update', async (req, res) => {
  const { id } = req.body;
  console.log(req.body)
  const collection = await mon('web', 'students');
  await collection.update(id, req.body);
  res.send({
    code: 200,
    data: true,
    msg: '操作成功'
  });
});

module.exports = router;
