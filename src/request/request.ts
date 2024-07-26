
import axios, { AxiosResponse } from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { REQ_METHODS } from './declare';
import type { RequestConfig, Interceptors, R, Method, ApiPromiseLike } from './declare';

/** 最终发送请求的函数体类型 */
export type RequestFunction<
  RequestConfigPayload,
  SuccessResponseTemplate,
  FailResponseTemplate
> = <
  SuccessResponse = {},
  FailResponse = {}
>(payload?: RequestConfig<RequestConfigPayload>) => ApiPromiseLike<R<SuccessResponseTemplate, SuccessResponse>, R<FailResponseTemplate, FailResponse>>;

/**
 * 采用柯里化思想，将请求封装出去
 * @param {string} baseURL baseUrl, 与 proxy 进行匹配
 * @param {RequestConfig<T>} config 请求配置
 * @param {Interceptors<RequestConfig<T>, void>} sendPre 发送时
 * @param {Interceptors<AxiosResponse<R<K>>, R<K> | AxiosResponse<R<K>>>} respAft 响应时
 * @return <V = {}>(payload?: RequestConfig<T>) => Promise<R<K, V>>
 */
export default function createRequest<
  RequestConfigPayload,
  SuccessResponseTemplate = {},
  FailResponseTemplate = {}
>(
  baseURL: string,
  config?: RequestConfig<RequestConfigPayload>,

  sendPre?: Interceptors<RequestConfig<RequestConfigPayload>, void>,
  respAft?: Interceptors<
    AxiosResponse<R<SuccessResponseTemplate>>,
    R<SuccessResponseTemplate> | AxiosResponse<R<SuccessResponseTemplate>>
  >
): RequestFunction<RequestConfigPayload, SuccessResponseTemplate, FailResponseTemplate> {

  const instance: AxiosInstance = axios.create({
    baseURL, method: REQ_METHODS.GET, headers: {

    },
    timeout: 3000,
    ...config
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig & RequestConfig<RequestConfigPayload>) => {
      if (sendPre && sendPre.onFulfilled) sendPre.onFulfilled(config);

      if (config.hConfig) delete config.hConfig;
      return config;
    },
    (error: AxiosError<R<FailResponseTemplate>, RequestConfig<RequestConfigPayload>>) => {
      if (sendPre && sendPre.onRejected) sendPre.onRejected(error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse<R<SuccessResponseTemplate>>): any => {
      if (respAft && respAft.onFulfilled) return respAft.onFulfilled(response);
      return response;
    },
    (error: AxiosError<R<FailResponseTemplate>, RequestConfig<RequestConfigPayload>>): any => {
      if (respAft && respAft.onRejected) return respAft.onRejected(error);
      return Promise.reject(error);
    }
  );

  return (payload?) => instance(payload) as unknown as any;
}

/**
 * 创建需要的 Api 请求, 返回的请求函数都会按照这个配置进行发送请求和拦截
 * @param {string} baseURL 请求的baseUrl
 * @param {RequestConfig<T>} config 请求的额外配置, 但是请注意, 发送请求时的配置会覆盖该配置
 * @param {Interceptors<RequestConfig<T>, void>} sendPre 请求的拦截
 * @param {Interceptors<AxiosResponse<R<K>>, R<K> | AxiosResponse<R<K>>>} respAft 响应的拦截
 * @returns 返回请求 Api
 */
export const createApiRequest = <RequestConfigPayload, SuccessResponseTemplate = {}, FailResponseTemplate = {}>(
  baseURL: string,
  config?: RequestConfig<RequestConfigPayload>,
  sendPre?: Interceptors<RequestConfig<RequestConfigPayload>, void>,
  respAft?: Interceptors<
    AxiosResponse<R<SuccessResponseTemplate>>,
    R<SuccessResponseTemplate> | AxiosResponse<R<SuccessResponseTemplate>>
  >
) => {
  const request = createRequest<RequestConfigPayload, SuccessResponseTemplate, FailResponseTemplate>(baseURL, config, sendPre, respAft);

  /**
   * 创建某个固定请求方式的Api
   * @param {Method} method 请求方式
   * @return 请求Api
   */
  const createApi = (method: Method) => {
    return <SuccessResponse = {}, FailResponse = {}>(url: string, apiConfig?: RequestConfig<RequestConfigPayload>) => request<SuccessResponse, FailResponse>({
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
