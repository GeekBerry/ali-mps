const { SubmitMediaInfoJobQuery, QueryMediaInfoJobListQuery } = require('./lib/info_querys');
const { ListJobQuery, SubmitJobsQuery, QueryJobQuery, CancelJobQuery } = require('./lib/trans_querys');

class MediaProcessService {
  constructor({ endpoint, accessKeyId, accessKeySecret, pipelineId }) {
    this.options = { endpoint, accessKeyId, accessKeySecret, pipelineId };
  }

  info() {
    return new SubmitMediaInfoJobQuery(this.options);
  }

  infoList() {
    return new QueryMediaInfoJobListQuery(this.options);
  }

  submit() {
    return new SubmitJobsQuery(this.options);
  }

  list() {
    return new ListJobQuery(this.options);
  }

  query() {
    return new QueryJobQuery(this.options);
  }

  cancel() {
    return new CancelJobQuery(this.options);
  }
}

module.exports = MediaProcessService;
