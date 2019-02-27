const moment = require('moment');
const lodash = require('lodash');
const superagent = require('superagent');

const { sortKeys, objToUri, sha1Base64 } = require('./utils');

class QueryBase {
  /**
   * 阿里云 MPS 服务 query 的特点:
   * 1. 如果参数是字符串数组, 以逗号分隔
   * 2. 如果参数是对象(含数组), 进行JSON序列化
   * @param obj {Object}
   * @return {Object}
   */
  static serialize(obj) {
    return lodash.mapValues(obj, (v) => {
      if (lodash.isObject(v)) {
        // 是字符串数组
        if (lodash.isArray(v) && lodash.every(v, lodash.isString)) {
          v = v.join(',');
        } else {
          v = JSON.stringify(v);
        }
      }

      return v;
    });
  }

  constructor(action, method, { endpoint, accessKeyId, accessKeySecret, pipelineId }) {
    this.endpoint = endpoint;
    this.accessKeySecret = accessKeySecret;
    this.method = method;
    this.query = {
      Format: 'JSON',
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      Version: '2014-06-18', // 固定的版本号, 不可更改,

      Action: action,
      AccessKeyId: accessKeyId,
      PipelineId: pipelineId,
    };

    // 进行参数检查和选取
    this.parameter = () => {
      throw new Error(`NotImplementError: ${this.constructor.name} "parameter" is empty`);
    };
  }

  /**
   * 签名
   *
   * 1. 按照参数名称的字典顺序对请求中所有的请求参数进行排序, 对相关请求参数的名称和值进行编码
   *
   * 2. 使用构造的规范化字符串按照下面的规则构造用于计算签名的字符串
   * StringToSign = HTTPMethod + "&" + percentEncode("/") + "&" + percentEncode(CanonicalizedQueryString)
   *
   * 3. 计算签名时使用的Key就是用户持有的Access Key Secret并加上一个 &字符（ASCII:38），使用的哈希算法是SHA1,
   * 按照Base64编码规则把上面的HMAC值编码成字符串，即得到签名值(Signature)
   *
   * 4. 将得到的签名值作为Signature参数添加到请求参数中，即完成对请求签名的过程
   *
   * @return {Promise<*>}
   */
  signature(query) {
    const signQuery = QueryBase.serialize(query);
    signQuery.SignatureNonce = Date.now() + lodash.random(0, 10000).toString();
    signQuery.Timestamp = moment().utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');

    const canonicalized = objToUri(sortKeys(signQuery));
    const stringToSign = `${this.method}&${encodeURIComponent('/')}&${encodeURIComponent(canonicalized)}`;
    signQuery.Signature = sha1Base64(stringToSign, `${this.accessKeySecret}&`); // 注意: 密钥后加 '&'

    return signQuery;
  }

  /**
   * 并发起请求
   * @return {Promise<*>}
   */
  async request() {
    const query = this.parameter(this);
    return superagent(this.method, this.endpoint).query(this.signature(query));
  }

  async then(resolve, reject) {
    try {
      const ret = await this.request();
      resolve(ret);
    } catch (e) {
      reject(e);
    }
  }
}

module.exports = QueryBase;
