
import { aesEncrypt, aesDecrypt } from '../src';

const data = aesEncrypt('asdasda');

console.log(data);

console.log(aesDecrypt(data));