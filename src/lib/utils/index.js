const CryptoJs = require('crypto-js')
// const crypto = require('crypto')

// console.log(crypto.randomBytes(16).toString('hex'))

const secret = '8dbc914e0e6865df45b6b7a1e5bc8306'

function encrypt(obj) {
  const encrypted = CryptoJs.AES.encrypt(JSON.stringify(obj), secret).toString()

  return encrypted
}

function decrypt(text) {
  const bytes = CryptoJs.AES.decrypt(text, secret)

  return JSON.parse(bytes.toString(CryptoJs.enc.Utf8))
}

// const encrypted = encrypt({
//   wallets: [
//     {
//       signatureId: '86bf839b-4986-4c21-8135-043f1f6a4437',
//       xpub: 'xpub6EiPFHNKGYfeprfFkiQ2yZMkrCJQzRNoaGGXZHN3v59qqXdBw69DYvBtGSNCxdLzLBHmsBgXrRkigdM9NWXwkXB5P3EMxRWSg134LoCsi7s',
//       mnemonic:
//         'remind burst small dolphin stadium accuse vault scene dentist tip escape problem hawk suit solid banana puppy donor own enhance cabin alter census check',
//       chain: 'ETH',
//       testnet: true,
//     },
//     {
//       signatureId: 'ec128e64-281b-4b88-b82d-6a8c8c675680',
//       mnemonic:
//         'promote pyramid pledge delay loan foam zebra hope frown such funny genre teach icon jacket label return ride output knee crisp catch check behind',
//       xpub: 'tpubDF9tBZHX5obzHijBSpei8HPZc1Nsiof8xdinGSiN6LEussswcDKwhjrzfkznPxnNjQaihGcaSsJ3xfqZNJax6aymLp3ZRiDCBsgkiNZfGnH',
//       chain: 'BTC',
//       testnet: true,
//     },
//   ],
// })
// console.log(encrypted)
// const decrypted = decrypt(encrypted)
// console.log(decrypted)
