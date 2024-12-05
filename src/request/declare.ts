import type { AxiosResponse, AxiosPromise, AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosInterceptorManager, InternalAxiosRequestConfig, Axios } from 'axios';
import type { RPromiseLike } from '../types';

export type Method = 'get' | 'GET'
| 'delete' | 'DELETE'
| 'head' | 'HEAD'
| 'options' | 'OPTIONS'
| 'post' | 'POST'
| 'put' | 'PUT'
| 'patch' | 'PATCH'
| 'purge' | 'PURGE'
| 'link' | 'LINK'
| 'unlink' | 'UNLINK';

/** 预定义的请求发送方式 */
export enum REQ_METHODS { GET = 'GET', POST = 'POST', DELETE = 'DELETE', UPDATE = 'UPDATE', PUT = 'PUT' }

/** 扩展机制, 当项目中需要配置指定请求发送 Token, 加密, 时间戳时使用 */
export type RequestConfig<T, D = {}> = AxiosRequestConfig<D> & {
  hConfig?: T;
}

/** 拦截器 */
export interface Interceptors<K, V> {
  onFulfilled?: (config: K) => V | Promise<V>;

  onRejected?: <T extends AxiosError>(config: T) => V | Promise<V>;
}

export type R<K, V = {}> =
  K extends { data: infer S }
    ? Omit<K, 'data'> & { data: V }
    : K & { data: V };

export type ApiPromiseLikeTypeBuilder<SuccessResponse, FailResponse = {}> = RPromiseLike<SuccessResponse, FailResponse>;
export type ApiPromiseResultTypeBuilder<SuccessResponseTemplate, FailResponseTemplate, SuccessResponse, FailResponse> = ApiPromiseLikeTypeBuilder<
  R<SuccessResponseTemplate, SuccessResponse>,
  R<FailResponseTemplate, FailResponse>
>;


