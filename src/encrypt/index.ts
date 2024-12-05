import * as tsCrypto from 'crypto-ts';

import * as tsMd5 from 'ts-md5';
import type * as TsMd5Type from 'ts-md5';

import type TsRsaType from 'jsrsasign';
import rsa from 'jsrsasign';

/**
 * AES 相关
 */
export namespace AES {

  /**
   * AES 加密结果
   */
  export type CipherParams = ReturnType<typeof AES.encrypt>;

  /**
   * word 字面量
   */
  export type WordArray = Exclude<Parameters<typeof AES.encrypt>[0], string>;

  /**
   * 加密配置
   */
  export type BufferedBlockAlgorithmConfig = Parameters<typeof AES.encrypt>[2];

  export const { enc, AES, SHA256, lib, algo, pad } = tsCrypto;
  export const aes = AES;

  /**
   * AES 加密算法
   */
  export const aesEncryptAlgorithm = AES.encrypt;

  /**
   * AES 解密算法
   */
  export const aesDecryptAlgorithm = AES.decrypt;

  /**
   * 预设默认加密字面量
   */
  export const AES_DEFAULT_KEY = `crypto-ts` as string;

  /**
   * aes 加密
   */
  export const aesEncrypt = <Data extends (string | WordArray)>(data: Data, key: string | WordArray = AES_DEFAULT_KEY, config?: BufferedBlockAlgorithmConfig): CipherParams => aesEncryptAlgorithm(data, key, config);

  /**
   * aes 解密
   */
  export const aesDecrypt = <Data extends (string | CipherParams)>(data: Data, key: string | WordArray = AES_DEFAULT_KEY, config?: BufferedBlockAlgorithmConfig): WordArray => aesDecryptAlgorithm(data, key, config);
}

/**
 * Md5 相关
 */
export namespace Md5 {
  export type HashingResponse = TsMd5Type.HashingResponse;

  export const { Md5, Md5FileHasher, ParallelHasher } = tsMd5;

  /**
   * md5 加密
   */
  export const md5 = Md5;

  export const { KEYUTIL, KJUR, RSAKey } = rsa;

  export type RSAPrivateKey = rsa.RSAPrivateKey;

  export type PublicRawRSAKeyHexResult = rsa.PublicRawRSAKeyHexResult;
}

/**
 * RSA 相关
 */
export namespace RSA {
  export interface RsaKeyOptions {
    /**
     * 创建 RSA key的时候, 创建多少字节的
     *
     * @default 512
     */
    bytes?: number;
  }

  /**
   * 初始化一个 RSA 的公钥和密钥
   * @returns [公钥, 私钥]
   */
  export const rsaGetKey = (options?: RsaKeyOptions) => {
    const rsaKeyPair = rsa.KEYUTIL.generateKeypair('RSA', options?.bytes ?? 512);
    const pubKey = rsa.KEYUTIL.getPEM(rsaKeyPair.pubKeyObj, 'PKCS5PRV');
    const prvKey = rsa.KEYUTIL.getPEM(rsaKeyPair.prvKeyObj, 'PKCS8PRV');
    return [pubKey, prvKey] as const;
  }

  /**
   * 使用 RSA 加密, 使用该加密之前需要先生成加密和解密密钥
   */
  export const rsaEncryptAlgorithm = (text: string, publicKey: string): string => {
    return rsa.KJUR.crypto.Cipher.encrypt(text, rsa.KEYUTIL.getKey(publicKey) as TsRsaType.RSAKey, 'RSA') as string;
  }

  /**
   * 使用 RSA 解密, 使用该解密之前需要先生成加密和解密密钥
   */
  export const rsaDecryptAlgorithm = (text: string, privateKey: string): string => {
    return rsa.KJUR.crypto.Cipher.decrypt(text, rsa.KEYUTIL.getKey(privateKey) as TsRsaType.RSAKey, 'RSA') as string;
  }
}

