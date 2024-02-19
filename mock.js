const express = require('express');
const app = express();
const router = require('./router');
const routerMock = require('./routerMock');
const routerCustom = require('./routerCustom');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((err, req, res, next) => {
  res.send({
    status: 500,
    data: null,
    msg: '出错了，请稍后再试'
  });
  next();
})
app.use('/api', routerMock);
app.use('/api', router);
// app.use('/api', routerCustom);

app.listen(3333, () => {
  console.log('Express Serve Running in http://localhost:3333.....');
});