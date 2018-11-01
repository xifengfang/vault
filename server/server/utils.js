const ALPHABET= "AG8FOLE2WVTCPY5ZH3NIUDBXSMQK7946";
module.exports = {
  couponCode: (number) => {
    let ret = '';
    for (var i=0; i<6; ++i) {
        ret += ALPHABET[number&((1 << 5)-1)];
        number = number >> 5;
    }
    return ret;
  },
  codeFromCoupon: (coupon) => {
    let n = 0;
    for (var i = 0; i < 6; ++i)
        n = n | ((ALPHABET.indexOf(coupon[i])) << (5 * i));
    return n;
  },
  decimal_expand: 1000000000000000000,
  web3_provider: 'https://mainnet.infura.io/aaaaaaaaaaaaaaaaa'
}