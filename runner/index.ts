

import { apiGet, toNil, asynced, apiPut, apiPost, apiDelete, AES } from '../src';

;(async () => {
  const [err, res] = await toNil(apiGet('http://www.oupro.cn/api/v1.0.0/t'));

  if (err) {
    console.error('请求错误', err.data);
    return;
  }

  console.log(res.data);
})();


