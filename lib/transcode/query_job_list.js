/*
# [查询转码作业](https://help.aliyun.com/document_detail/29228.html)

通过转码作业ID，批量查询转码作业，返回默认按CreationTime降序排列。
 */

const lodash = require('lodash');
const parameter = require('validator-picker/parameter');
const QueryBase = require('../query_base');

// ===============================  请求参数  ==================================
const PARAMETER = parameter({
  JobIds: {
    type: 'array',
    'this sdk only support one job id once': v => v.length === 1,
    'array of string': ids => lodash.isString(ids[0]),
  },
});

// ============================================================================
class QueryJobList extends QueryBase {
  constructor(options) {
    super('QueryJobList', 'GET', options);
  }

  request() {
    this.query = PARAMETER(this.query);
    return super.request();
  }

  jobId(id) {
    lodash.set(this.query, 'JobIds[0]', id);
    return this;
  }
}

module.exports = QueryJobList;
