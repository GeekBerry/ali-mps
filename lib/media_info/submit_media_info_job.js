/*
# [提交媒体信息作业](https://help.aliyun.com/document_detail/29220.html)

提交媒体信息作业接口，媒体处理服务会对输入文件进行媒体信息分析，同步返回输入文件的媒体信息；可通过“查询媒体信息作业”接口得到媒体信息分析结果。
 */

const parameter = require('validator-picker/parameter');
const QueryBase = require('../query_base');

// ===============================  请求参数  ==================================
const PARAMETER = parameter({
  Input: { path: 'query', type: 'object', required: true },
  'Input.Bucket': { path: 'query', type: 'str', required: true },
  'Input.Location': { path: 'query', type: 'str', required: true },
  'Input.Object': { path: 'query', type: 'str', required: true },

  UserData: {
    path: 'query', type: 'string', required: false,
    '<= 1024 bytes': v => Buffer.from(v, 'utf8').length <= 1024,
  },
});

// ============================================================================
class SubmitMediaInfoJob extends QueryBase {
  constructor(options) {
    super('SubmitMediaInfoJob', 'POST', options);
    this.parameter = PARAMETER;
  }

  /**
   * 作业输入，Json对象, 需在控制台授予此Bucket权限给媒体转码服务。
   * @param bucket {string}
   * @param location {string}
   * @param object {string}
   * @return {SubmitMediaInfoJob}
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
   * @return {SubmitMediaInfoJob}
   */
  userData(data) {
    this.query.UserData = data;
    return this;
  }
}

module.exports = SubmitMediaInfoJob;
