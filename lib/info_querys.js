const lodash = require('lodash');
const parameter = require('validator-picker/parameter');

const QueryBase = require('./base');

/**
 * 提交媒体信息作业
 *
 * @description 提交媒体信息作业接口，媒体处理服务会对输入文件进行媒体信息分析，同步返回输入文件的媒体信息；
 * 可通过“查询媒体信息作业”接口得到媒体信息分析结果。
 *
 * @see https://help.aliyun.com/document_detail/29220.html
 */
class SubmitMediaInfoJobQuery extends QueryBase {
  constructor(options) {
    super('SubmitMediaInfoJob', 'POST', options);

    this.validator = parameter({
      Input: { path: 'query', type: 'object', required: true },
      'Input.Bucket': { path: 'query', type: 'str', required: true },
      'Input.Location': { path: 'query', type: 'str', required: true },
      'Input.Object': { path: 'query', type: 'str', required: true },

      UserData: {
        path: 'query', type: 'string', required: false,
        '<= 1024 bytes': v => Buffer.from(v, 'utf8').length <= 1024,
      },
    });
  }

  /**
   * 作业输入，Json对象, 需在控制台授予此Bucket权限给媒体转码服务。
   * @param bucket {string}
   * @param location {string}
   * @param object {string}
   * @return {SubmitMediaInfoJobQuery}
   */
  input({ bucket, location, object } = {}) {
    this.query.Input = {
      Bucket: bucket,
      Location: location,
      Object: encodeURIComponent(object),
    };

    return this;
  }

  /**
   * 用户自定义数据。最大长度1024个字节
   * @param data {string}
   * @return {SubmitMediaInfoJobQuery}
   */
  userData(data) {
    this.query.UserData = data;
    return this;
  }
}

/**
 * 查询媒体信息作业
 *
 * @description 查询媒体信息作业接口，可查询媒体信息作业信息。
 *
 * @see https://help.aliyun.com/document_detail/29221.html
 */
class QueryMediaInfoJobListQuery extends QueryBase {
  constructor(options) {
    super('QueryMediaInfoJobList', 'GET', options);

    this.validator = parameter({
      MediaInfoJobIds: {
        path: 'query', type: 'array', required: true,
        'max array length is 10': ids => ids.length <= 10,
        'array of string': ids => lodash.every(ids, lodash.isString),
      },
    });
  }

  /**
   * 媒体信息作业Id列表。
   *   逗号分隔，一次最多查询10个。
   * @param ids
   * @return {QueryMediaInfoJobListQuery}
   */
  jobIds(ids) {
    this.query.MediaInfoJobIds = ids;
    return this;
  }
}

module.exports = {
  SubmitMediaInfoJobQuery,
  QueryMediaInfoJobListQuery,
};
