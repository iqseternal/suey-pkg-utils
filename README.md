# @suey/pkg-utils⚡

这里是基础的函数封装, 其中含有对加密、类型判断、Filters(过滤, vue2的 filter 概念作用), 随机数, 错误处理, 类型体操封装.

该包在 node 和 web 环境都可以使用. 如果需要语法降级请自行配置构建工具解决.

## 安装

设置 npm 源

```bash

npm config set registry https://registry.npmjs.org

```

安装

```bash

npm install @suey/pkg-utils --save

pnpm install @suey/pkg-utils --save

```

## 使用部分实例

### 错误处理

``` tsx
import { useAsyncEffect, useSetState } from 'ahooks';

declare interface UserInfo {
  name: string;
}
declare const requestUserInfoApi: () => Promise<UserInfo>;

export const Home = () => {
  const [state, setState] = useSetState({
    userInfo: void 0 as (undefined | UserInfo)
  })

  useAsyncEffect(async () => {
    // 不必 try catch 捕捉异常, 可以使用 toNil 解析 Promise
    const [err, userInfo] = await toNil(requestUserInfo());
    if (err) {
      console.error(`获取用户信息失败`);
      return;
    }
    // userInfo: UserInfo 这里可以识别 userInfo 是 UserInfo 类型
    setState({ userInfo: userInfo });
  }, []);

  return <>

  </>;
}

```


### 请求函数工厂

```typescript
// --- api 请求封装
import { REQ_METHODS, createApiRequest, isUndefined, ApiPromiseResultTypeBuilder } from '@rapid/libs';
import { StringFilters } from '@rapid/libs-web';
import type { AxiosError } from 'axios';
import { getAccessToken } from '@/features';

export type { RequestConfig, Interceptors } from '@rapid/libs';
export type { createApiRequest, createRequest } from '@rapid/libs';
export { REQ_METHODS }

/** 请求 hConfig 配置 */
export interface RApiHConfig {
  /**
   * 默认都需要认证
   * @default true
   */
  needAuth?: boolean;
}

/** 基本响应结构体的内容 */
export interface RApiBasicResponse {
  status: number;
  flag: 'ApiResponseOk' | 'ApiResponseFal';
  data: any;
  more?: {
    pako?: boolean;
  }
  descriptor: string;
  _t: number;
}

export interface RApiSuccessResponse extends RApiBasicResponse {
  flag: 'ApiResponseOk';
}

export interface RApiFailResponse extends RApiBasicResponse {
  flag: 'ApiResponseFal';

  /** 更多的错误信息 */
  INNER: {
    stack: string;
    name: AxiosError<Omit<RApiFailResponse, 'INNER'>, any>['name'];
    config: AxiosError<Omit<RApiFailResponse, 'INNER'>, any>['config'];
    request: AxiosError<Omit<RApiFailResponse, 'INNER'>, any>['request'];
    response: AxiosError<Omit<RApiFailResponse, 'INNER'>, any>['response'];
  }
}

/**
 * RApiPromiseLike, 可以通过 then, catch 获得不同的相应数据类型提示
 * 也可以通过 toNil 获取类型
 *
 * ```ts
 * declare const pr: RApiPromiseLike<number,  string>;
 * const [err, res] = await toNil(pr);
 * if (err) {
 *   console.log(err.descriptor);
 *   return;
 * }
 * res;
 * //
 * ```
 */
export type RApiPromiseLike<Success, Fail = {}> = ApiPromiseResultTypeBuilder<RApiSuccessResponse, RApiFailResponse, Success, Fail>;

export const rApi = createApiRequest<RApiHConfig, RApiSuccessResponse, RApiFailResponse>('https://example.com/api/', {
  // 全局配置
  timeout: 5000
}, {
  // 请求时配置的修改
  async onFulfilled(config) {
    if (!config.hConfig) config.hConfig = { needAuth: true };
    if (isUndefined(config.hConfig.needAuth)) config.hConfig.needAuth = true;
    if (config.hConfig.needAuth && config.headers) {
      // TODO:
      const accessToken = await getAccessToken();
      if (accessToken) config.headers.authorization = `Bearer ${accessToken}`;
      // config.headers['_t'] = `${+new Date()}`;
    }
  },
}, {
  // 成功响应结果时对响应体的处理, 这里设置了 RApiSuccessResponse 作为泛型转递给了 createApiRequest, 所以这里的 Promise 需要满足泛型约束从而对项目进行 api 类型推演
  onFulfilled(response) {
    // nestjs server response.
    if (response.data && response.data.flag && response.data.status) {
      if (response.data.flag === 'ApiResponseOk') return Promise.resolve(response.data);
      if (response.data.flag === 'ApiResponseFal') return Promise.reject(response.data);

      return response;
    }
    return response;
  },
  // 与 onFulfilled 作用一致, 用于处理错误响应
  onRejected(err) {
    return Promise.reject<RApiFailResponse>({
      status: +(err.response?.status ?? 0),
      flag: 'ApiResponseFal',
      data: err.response?.data,
      descriptor: StringFilters.toValidStr(err.message, '未知错误'),
      _t: +new Date(),
      INNER: {
        stack: err.stack,
        config: err.config,
        request: err.request,
        response: err.response,
        name: err.name
      }
    } as RApiFailResponse);
  }
})

export const { apiGet: rApiGet, apiPost: rApiPost, request: rRequest, createApi: rCreateApi } = rApi;

export const rApiPut = rCreateApi(REQ_METHODS.PUT);

export const rApiDelete = rCreateApi(REQ_METHODS.DELETE);

export const rApiPatch = rCreateApi('PATCH');

```

### 类型判断函数

``` typescript
export type Type = 'Array' | 'Object' | 'Null' | 'Undefined' | 'Function' | 'RegExp' | 'String' | 'Number' | 'Date' | 'Boolean';
export type IsType<T> = (target: unknown | T) => target is T;
export declare const isBoolean: IsType<boolean>;
export declare const isNumber: IsType<number>;
export declare const isString: IsType<string>;
export declare const isNull: IsType<null>;
export declare const isUndefined: IsType<undefined>;
export declare const isDef: <T>(target: T | null | undefined) => target is NonNullable<T>;
export declare const isUseful: <T>(target: T | null | undefined) => target is NonNullable<T>;
export declare const isUnDef: <T>(target: T) => target is (T & null) | (T & undefined);
export declare const isUnUseful: <T>(target: T) => target is (T & null) | (T & undefined);
export declare const isObject: <T>(target: T) => target is Exclude<T & object, Function>;
export declare const isRawObject: <T>(target: T) => target is Exclude<T & object, Function>;
export declare const isFunction: IsType<Function>;
export declare const isDate: IsType<Date>;
export declare const isPromiseLike: <T extends Promise<K>, K>(target: T) => target is T;
export declare const isClass: <T>(target: any) => target is new (...args: any[]) => any;
export declare const isArray: (arg: any | any[]) => arg is any[];
```
