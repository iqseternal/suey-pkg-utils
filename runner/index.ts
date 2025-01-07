
import type { RPromiseLike } from '../src';
import { forge, toNil, asynced, randomRegionForInt, Nil, toNils } from '../src';

;(async () => {
  const getPromise = asynced<() => RPromiseLike<void, string>>(async () => {
    const t = randomRegionForInt(2, 2);
    if (t > 1) return Promise.reject('should');
  });

  const [p1, p2] = await toNils(getPromise(), getPromise());

  const [err1, res1] = p1;
  const [err2, res2] = p2;


  console.log(err1, res1);
  console.log(err2, res2);

})();


