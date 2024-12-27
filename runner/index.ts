

import { forge } from '../src';

;(async () => {
  const keypair = forge.pki.rsa.generateKeyPair({
    bits: 1024,
    e: 0x10001
  });

  const publicKey = keypair.publicKey;
  const privateKey = keypair.privateKey;

  console.log(forge.pki.publicKeyToRSAPublicKeyPem(publicKey));

  const str = publicKey.encrypt('Hello');
  console.log(str);

  console.log(privateKey.decrypt(str));
})();


