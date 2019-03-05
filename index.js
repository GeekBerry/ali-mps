const SubmitMediaInfoJob = require('./lib/media_info/submit_media_info_job');
const QueryMediaInfoJobList = require('./lib/media_info/query_media_info_job_list');

const SubmitJobs = require('./lib/transcode/submits_job');
const ListJob = require('./lib/transcode/list_job');
const QueryJobList = require('./lib/transcode/query_job_list');
const CancelJob = require('./lib/transcode/cancel_job');

class MediaProcessService {
  constructor({ endpoint, accessKeyId, accessKeySecret, pipelineId }) {
    this.options = { endpoint, accessKeyId, accessKeySecret, pipelineId };
  }

  submit() {
    return new SubmitJobs(this.options);
  }

  list() {
    return new ListJob(this.options);
  }

  query() {
    return new QueryJobList(this.options);
  }

  cancel() {
    return new CancelJob(this.options);
  }

  submitMediaInfo() {
    return new SubmitMediaInfoJob(this.options);
  }

  queryMediaInfo() {
    return new QueryMediaInfoJobList(this.options);
  }
}

module.exports = MediaProcessService;
