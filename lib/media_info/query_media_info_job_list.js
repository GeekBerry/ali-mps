/*
# [查询媒体信息作业](https://help.aliyun.com/document_detail/29221.html)

查询媒体信息作业接口，可查询媒体信息作业信息。
 */

const lodash = require('lodash');
const parameter = require('validator-picker/parameter');
const QueryBase = require('../query_base');

// ===============================  请求参数  ==================================
const PARAMETER = parameter({
  MediaInfoJobIds: {
    type: 'array', required: true,
    'this sdk only support one job id once': v => v.length === 1,
    'array of string': ids => lodash.isString(ids[0]),
  },
});

// ============================================================================
class QueryMediaInfoJobList extends QueryBase {
  constructor(options) {
    super('QueryMediaInfoJobList', 'GET', options);
  }

  request() {
    this.query = PARAMETER(this.query);
    return super.request();
  }

  /**
   * 媒体信息作业 Id
   * @param id {String}
   * @return {QueryMediaInfoJobList}
   */
  jobId(id) {
    lodash.set(this.query, 'MediaInfoJobIds[0]', id);

    return this;
  }
}

module.exports = QueryMediaInfoJobList;
