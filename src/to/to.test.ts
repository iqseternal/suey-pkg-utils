import { toNil } from './index';
import { isUnUseful } from '../fnUtils';

test('错误解析函数 toNil', async () => {
  const [err, res] = await toNil(new Promise((resolve, reject) => {
    resolve(1);
  }))

  if (err || res !== 1) {
    return Promise.reject(`toNil 判断失败`);
  }

  const [err2, res2] = await toNil(new Promise<void>((resolve, reject) => {
    return reject(1);
  }))

  if (isUnUseful(err2) || err2 instanceof Error || err2 !== 1 || !!res2) {
    return Promise.reject(`toNil 判断失败`);
  }
})

