设置 npm 源

npm config set registry https://registry.npmjs.org

安装

npm install @suey/packages --save
pnpm install @suey/packages --save

```typescript
import { createApiRequest } from '@suey/pkg-utils';
import { inflate } from 'pako'; // pnpm install pako --save

const isOkStatus = (status: number): boolean => {
  if (status >= 200 && status < 300) return true;
  if (status === 400) console.log('失败的请求');
  if (status === 403) console.log('服务器拒绝了此请求');
  if (status === 404) console.log('目标地址未找到');
  if (status >= 500) console.log('服务器内部错误');
  return false;
}

export { REQ_METHODS, type RequestConfig } from '@suey/pkg-utils';

// 请求额外配置项, 当你的请求通过拦截器时, 你可以通过 hConfig 获取到
export interface HConfig {
  needAuth?: boolean;
}

const api = '/api';

/**
 * createApiRequest<T, K> => 这是 axios 的创建和拦截器
 * T: 请求时的额外配置
 * K: 返回结果 data 中的类型定义, 这里的后端假定返回封装了data中的数据为如下格式
 */
export const { apiGet, apiPost, request, createApi } = createApiRequest<HConfig, {
  status: number; // 返回的状态码, 这里可以是后端自定义的
  flag: string; // 返回标志
  data: any;
  more?: {
    pako?: boolean; // 是否被压缩了
  }
}>(api, {}, {
  onFulfilled: config => {
    // 处理请求时附带的额外参数, 如果你有这种需要附带参数的, 只需要在这里全局处理即可
    if (config.hConfig?.needAuth) {
      if (!config.headers) config.headers = {};
      if (getToken()) config.headers['authorization'] = 'Bearer ' + 'token....';
    }
  },
  onRejected: config => Promise.reject(config)
}, {
  onFulfilled: response => { // 对于封装的响应体做解析返回
    if (response.data.status && response.data.flag) {
      const status = response.data.status;

      // 统一进行解压缩
      if (response.data.more && response.data.more.pako === true) response.data.data = JSON.parse(inflate(response.data.data as Buffer, { to: 'string' }));

      if (!isOkStatus(+status)) return Promise.reject(response.data);
      return Promise.resolve(response.data);
    }
    return Promise.resolve(response);
  },
  onRejected: err => {
    if (err.data && err.data.status && err.data.flag) err.data = err.data.data as any;
    return Promise.reject(err);
  }
});
```


```typescript
// @suey/pkg-utils

// 进行一个加密操作, 将指定的字符串进行加密, 并返回加密结果
export declare const aesEncryptAlgorithm: (value: string, encryptKey: string) => string;
// 进行一个解密操作, 将指定的字符串进行解密, 并返回解密结果
export declare const aesDecryptAlgorithm: (text: string, encryptKey: string) => string;
// 返回 AES 加密之后的字符串结果, 加密对象会被先JSON.stringify 转化为字符串进行加密
export declare const aesEncrypt: <T>(value: T, key?: string) => string;
// 返回 AES 解密之后的结果, 返回的结果不固定
export declare const aesDecrypt: <T>(text: string, key?: string) => T;
// 使用 MD5 加密, 该操作是不可逆的
export declare const md5Encrypt: (...args: string[]) => string;
 /** 创建 RSA key的时候, 创建多少字节的, 默认为 512 字节 */
interface RsaKeyOptions { bytes?: number; }
// 初始化一个 RSA 的公钥和密钥
export declare const rsaGetKey: (options?: RsaKeyOptions) => any[];
// 使用 RSA 加密, 使用该加密之前需要先生成加密和解密密钥
export declare const rsaEncryptAlgorithm: (text: string, publicKey: string) => string;
// 使用 RSA 解密, 使用该解密之前需要先生成加密和解密密钥
export declare const rsaDecryptAlgorithm: (text: string, privateKey: string) => string;

export type IsType = (target: unknown) => boolean;
export declare const isBoolean: IsType;
export declare const isObject: IsType;
export declare const isFunction: IsType;
export declare const isString: IsType;
export declare const isNull: IsType;
export declare const isUndefined: IsType;
export declare const isDate: IsType;
export declare const isDef: <T>(target: T) => boolean;
export declare const isUnDef: <T>(target: T) => boolean;
export declare const isPromise: (target: any | never) => boolean;
export declare const isDecimal: (str: string) => boolean;
export declare const isPhone: (str: string) => boolean;
export declare const isEmail: (str: string) => boolean;
export declare const isClass: (target: any) => boolean;
export declare const isExternal: (path: string) => boolean;
export declare const isArray: (arg: any) => boolean;
export declare const isHttpUrl: (path: string) => boolean;
export declare const isValidURL: (url: string) => boolean;
```
