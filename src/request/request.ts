
import axios, { AxiosResponse } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { REQ_METHODS } from './declare';
import type { RequestConfig, Interceptors, R, Method } from './declare';

/**
 * 采用柯里化思想，将请求封装出去
 * @param {string} baseURL baseUrl, 与 proxy 进行匹配
 * @param {RequestConfig<T>} config 请求配置
 * @param {Interceptors<RequestConfig<T>, void>} sendPre 发送时
 * @param {Interceptors<AxiosResponse<R<K>>, R<K> | AxiosResponse<R<K>>>} respAft 响应时
 * @return <V = {}>(payload?: RequestConfig<T>) => Promise<R<K, V>>
 */
export default function createRequest<T, K = {}>(
  baseURL: string, config?: RequestConfig<T>,
  sendPre?: Interceptors<RequestConfig<T>, void>,

  respAft?: Interceptors<AxiosResponse<R<K>>, R<K> | AxiosResponse<R<K>>>

): <V = {}>(payload?: RequestConfig<T>) => Promise<R<K, V>> {

  const instance: AxiosInstance = axios.create({
    baseURL, method: REQ_METHODS.GET, headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: 3000, withCredentials: false, ...config
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig & RequestConfig<T>) => {
      if (sendPre && sendPre.onFulfilled) sendPre.onFulfilled(config);

      if (config.hConfig) delete config.hConfig;
      return config;
    },
    (error: InternalAxiosRequestConfig & RequestConfig<T>) => {
      if (sendPre && sendPre.onRejected) sendPre.onRejected(error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse<R<K>>): any => {
      if (respAft && respAft.onFulfilled) return respAft.onFulfilled(response);
      return response;
    },
    (error: AxiosResponse<R<K>>): any => {
      if (respAft && respAft.onRejected) return respAft.onRejected(error);
      return Promise.reject(error);
    }
  );

  return (payload?: RequestConfig<T>) => instance(payload);
}

/**
 * 创建需要的 Api 请求, 返回的请求函数都会按照这个配置进行发送请求和拦截
 * @param {string} baseURL 请求的baseUrl
 * @param {RequestConfig<T>} config 请求的额外配置, 但是请注意, 发送请求时的配置会覆盖该配置
 * @param {Interceptors<RequestConfig<T>, void>} sendPre 请求的拦截
 * @param {Interceptors<AxiosResponse<R<K>>, R<K> | AxiosResponse<R<K>>>} respAft 响应的拦截
 * @returns 返回请求 Api
 */
export const createApiRequest = <T, K = {}>(
  baseURL: string,
  config?: RequestConfig<T>,
  sendPre?: Interceptors<RequestConfig<T>, void>,
  respAft?: Interceptors<AxiosResponse<R<K>>, R<K> | AxiosResponse<R<K>>>
) => {
  const request = createRequest<T, K>(baseURL, config, sendPre, respAft);

  /**
   * 创建某个固定请求方式的Api
   * @param {Method} method 请求方式
   * @return 请求Api
   */
  const createApi = (method: Method) => {
    return <V = {}>(url: string, apiConfig?: RequestConfig<T>) => request<V>({
      url,
      ...apiConfig,
      method
    });
  }

  return {
    request, createApi,
    /** GET请求 */
    apiGet: createApi(REQ_METHODS.GET),
    /** POST请求 */
    apiPost: createApi(REQ_METHODS.POST)
  }
}
