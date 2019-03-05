/*
# [列出转码作业](https://help.aliyun.com/document_detail/29229.html)

通过作业状态，创建时间区间，转码管道列出转码作业，默认按CreationTime降序排列。
 */
const moment = require('moment');
const parameter = require('validator-picker/parameter');
const QueryBase = require('../query_base');

// ===============================  请求参数  ==================================
const PARAMETER = parameter({
  NextPageToken: { type: 'uuid' },
  MaximumPageSize: { type: 'uint', 'page size range': v => (v >= 1 && v <= 100) },
  State: {
    type: 'str',
    'state enum': v => [
      'All',
      'Submitted',
      'Transcoding',
      'TranscodeSuccess',
      'TranscodeFail',
      'TranscodeCancelled',
    ].includes(v),
  },
  StartOfJobCreatedTimeRange: { type: 'str' }, // TODO regex of YYYY-MM-DDThh:mm:ssZ
  EndOfJobCreatedTimeRange: { type: 'str' }, // TODO regex of YYYY-MM-DDThh:mm:ssZ
});

// ============================================================================
class ListJob extends QueryBase {
  constructor(options) {
    super('ListJob', 'GET', options);
  }

  request() {
    this.query = PARAMETER(this.query);
    return super.request();
  }

  /**
   * 转码任务状态
   * @param value {String}
   * @return {ListJob}
   */
  state(value = 'All') {
    this.query.State = value;

    return this;
  }

  /**
   * 下一页标识，32位UUID
   * @param token {String}
   * @return {ListJob}
   */
  nextToken(token) {
    this.query.NextPageToken = token;

    return this;
  }

  /**
   * 最大可返回媒体工作流执行实例
   * @param value {Number} [1,100]
   * @return {ListJob}
   */
  pagesize(value = 10) {
    this.query.MaximumPageSize = value;
    return this;
  }

  /**
   * @param startTime {String} YYYY-MM-DDThh:mm:ssZ
   * @return {ListJob}
   */
  startTime(startTime) {
    if (startTime) {
      if (!(startTime instanceof moment)) {
        startTime = moment(startTime);
      }

      this.query.StartOfJobCreatedTimeRange = startTime.utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    }

    return this;
  }

  /**
   * @param endTime {String} YYYY-MM-DDThh:mm:ssZ
   * @return {ListJob}
   */
  endTime(endTime) {
    if (endTime) {
      if (!(endTime instanceof moment)) {
        endTime = moment(endTime);
      }

      this.query.EndOfJobCreatedTimeRange = endTime.utc().format('YYYY-MM-DD[T]HH:mm:ss[Z]');
    }

    return this;
  }
}

module.exports = ListJob;
