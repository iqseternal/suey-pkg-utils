

import { apiGet, toNil, toNils, createRequest, asynced, apiPut, apiPost, apiDelete, AES, RPromiseLike } from '../src';

;(async () => {
  {
    const p = asynced<() => RPromiseLike<number, string>>(() => new Promise(resolve => {
      resolve(1);
    }))();
    const [err, res] = await toNil(p);
    if (err) {
      err.reason.includes('hello');
      return;
    }
    res.toFixed(1);
  }

  const [err, res] = await toNil(
    asynced<() => RPromiseLike<number, string>>(() => new Promise(resolve => {
      resolve(1);
    }))()
  );

  if (err) {
    err.reason.includes('hello');
    return;
  }

  res.toFixed(1);


  const [p1, p2, p3] = await toNils(
    apiGet('http://oupro.cn/api/v1.0.0/t'),
    apiGet('http://oupro.cn/api/v1.0.0/t'),
    apiGet('http://oupro.cn/api/v1.0.0/t')
  );

  const [p1Err, p1Res] = p1;
  const [p2Err, p2Res] = p2;
  const [p3Err, p3Res] = p3;

  if (p1Err || p2Err || p3Err) {
    console.log('error', p1Err?.reason.data, p2Err?.reason.data, p3Err?.reason.data);
    return;
  }

  console.log(p1Res.data, p2Res.data, p3Res.data);
})();


