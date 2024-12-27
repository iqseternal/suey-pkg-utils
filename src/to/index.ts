import {
  RPromiseLike,
  PromiseResolvedType,
  PromiseCatchCallback,
  PromiseCatchReasonType,
  IsAny,
  PromiseArrayResolvedType,
  PromiseArrayCatchReasonType,
} from '../types';
import { isObject, isRawObject } from '../fnUtils';

/**
 * 创建一个 RPromiseLike 函数
 *
 * const req = asynced<() => RPromiseLike<number, string>>(async () => {
 *   // TODO
 *   if (xxx) return Promise.reject('1');
 *
 *   return Promise.resolve(1);
 * })
 * @param fn
 * @returns
 */
export const asynced = <Fn extends (...args: any[]) => RPromiseLike<any>>(fn: (...args: Parameters<Fn>) => any): (...args: Parameters<Fn>) => ReturnType<Fn> => fn;

export namespace Nil {
  export const NilRefusedReasonSymbol = Symbol('nil');

  /**
   * toNil 解析错误返回的对象类型
   */
  export type NilRefusedReasonType<Reason extends any = any> = {
    readonly __symbol__: typeof NilRefusedReasonSymbol;
    readonly reason: Reason;
  };

  export type NilAnalysisPassedResponseType<Pass> = readonly [undefined, Pass];
  export type NilAnalysisRefusedResponseType<Reason> = readonly [NilRefusedReasonType<Reason>, undefined];

  /**
   * toNil 解析响应类型
   */
  export type NilAnalysisResponseType<Pass, Reason> = NilAnalysisRefusedResponseType<Reason> | NilAnalysisPassedResponseType<Pass>;

  /**
   * 判断目标是否是 nil 返回的拒绝对象
   */
  export const isNilRefusedReason = <T>(target: T | NilRefusedReasonType): target is NilRefusedReasonType => {
    return (
      isRawObject(target) &&
      Reflect.has(target, '__symbol__') &&
      Reflect.has(target, 'reason') &&
      Reflect.getOwnPropertyDescriptor(target, '__symbol__')?.value === NilRefusedReasonSymbol
    )
  }
}

/**
 * @example
 * const p = new Promise(....);
 *
 * const [err, data] = await toNil(p);
 * if (err) return; // 处理错误
 *
 * const { list } = data; // 正常执行
 * @description
 * 为了解决串行异步任务中有异常处理问题
 *
 * 1. Promise
 * p1.then(res => p2).catch(err => {})
 *
 * // 不太美观，希望试用 async await 语法糖
 *
 * 例如:
 * const res = await p1;
 * const res2 = await p2;
 *
 * 但这样缺少异常处理
 *
 * 2. try catch
 *
 * try {
 *
 *  const r1 = await p1;
 *
 *  const r2 = await p2;
 *
 * } catch(e) {
 *
 * }
 *
 * 很难为单独 promise 处理错误, 如果每一个 promise 都去写个 try catch 那么会很冗长
 *
 * 于是采用了 Go 的哨兵处理机制
 */
export async function toNil<
  Pr extends Promise<unknown>,
  NilPassedData extends PromiseResolvedType<Pr> = PromiseResolvedType<Pr>,
  NilRefusedReason extends PromiseCatchReasonType<Pr> = PromiseCatchReasonType<Pr>
>(
  promise: Pr
): Promise<Nil.NilAnalysisResponseType<NilPassedData, NilRefusedReason>> {

  return promise
    // 如果成功, 第一个参数 err 返回 undefined
    .then(data => [void 0, data] as Nil.NilAnalysisPassedResponseType<NilPassedData>)
    // 如果失败, 第二个参数将不存在, 失败结果将作为第一个参数返回
    // 如果失败结果也不存在, 那么会自动产生一个 Error 返回
    .catch(err => {
      return [
        {
          __symbol__: Nil.NilRefusedReasonSymbol,
          reason: err
        },
        void 0
      ] as Nil.NilAnalysisRefusedResponseType<NilRefusedReason>;
    });
}

/**
 * 同步解决多个 Promise，参照 toNil 功能
 * @example
 *
 * const [p1, p2] = await toNils(Promise.resolve(1), Promise.resolve('a'));
 * const [p1Err, p1Res] = p1, [p2Err, p2Res] = p2;
 *
 * if (p1Err || p2Err) {
 *   console.error('error');
 *   return;
 * }
 *
 * const res = '' + p1Res + p2Res;
 *
 * console.log(res);
 */
export async function toNils<
  Prs extends readonly Promise<unknown>[],
  NilPassedDataArray extends PromiseArrayResolvedType<Prs> = PromiseArrayResolvedType<Prs>,
  NilRefusedReasonArray extends PromiseArrayCatchReasonType<Prs> = PromiseArrayCatchReasonType<Prs>,
>(
  ...promises: Prs
): Promise<Array<readonly [unknown, unknown]> & {
  readonly [K in keyof Prs]: Nil.NilAnalysisResponseType<NilPassedDataArray[K], NilRefusedReasonArray[K]>;
}> {
  const results = await Promise.allSettled(promises.map(promise => toNil(promise)));

  return results.map(result => {
    if (result.status === 'fulfilled') return result.value;

    return [
      {
        reason: void 0,
        __symbol__: Nil.NilRefusedReasonSymbol
      },
      void 0
    ] as Nil.NilAnalysisRefusedResponseType<undefined>;
  }) as Array<readonly [unknown, unknown]> & {
    readonly [K in keyof Prs]: Nil.NilAnalysisResponseType<NilPassedDataArray[K], NilRefusedReasonArray[K]>;
  }
}
