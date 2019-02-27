/*
# [取消转码作业](https://help.aliyun.com/document_detail/29227.html)

取消转码作业接口。
 */

const lodash = require('lodash');
const parameter = require('validator-picker/parameter');
const QueryBase = require('../query_base');

// ===============================  请求参数  ==================================
const PARAMETER = parameter({
  JobIds: {
    path: 'query', type: 'array',
    'this sdk only support one job id once': v => v.length === 1,
    'array of string': ids => lodash.isString(ids[0]),
  },
});

// ============================================================================
class CancelJob extends QueryBase {
  constructor(options) {
    super('CancelJob', 'GET', options);
    this.parameter = PARAMETER;
  }

  jobId(id) {
    lodash.set(this.query, 'JobIds[0]', id);
    return this;
  }
}

module.exports = CancelJob;
