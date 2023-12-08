const express = require('express');
const mon = require('./mongoConfig');
const customRouter = express.Router();


mon('interfaceList').then(collection => {
  collection.find().then((interfaces) => {
    // 循环创建接口
    interfaces.forEach(interfaceItem => {
      const { methodType, interfaceName, id } = interfaceItem;
      customRouter[methodType === '1' ? 'get' : 'post'](interfaceName, async (req, res) => {
        const jsonCollection = await mon('jsonArr');
        const jsonList = await jsonCollection.find();
        res.send(jsonList.find(jsonItem => jsonItem.parentId === id && jsonItem.default === 1).jsonContent);
      });
    })
  });
});

module.exports = customRouter;