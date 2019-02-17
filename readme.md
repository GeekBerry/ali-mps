# 阿里云媒体处理服务(MPS)

## Usage
```javascript
const MediaProcessService = require('ali-mps');

const mps = new MediaProcessService({
  endpoint: 'https://mts.cn-hangzhou.aliyuncs.com',
  accessKeyId:'<your access key id>', 
  accessKeySecret:'<your access key secret>', 
  pipelineId:'<your pipeline id>', 
});

async function main() {
  const respInfo = await mps.info().input({bucket:'...', location:'...', object:'...'});
  console.log(respInfo);
  
  const respSubmit = await mps.submit()
    .pipelineId('<pipelineId>')
    .input({bucket:'...', location:'...', object:'...'})
    .output({bucket:'...', location:'...', object:'...'})
    .templateId('...')
    .format('mp3')
    .audio({
      codec: 'AAC', 
      profile: 'aac_low', 
      channels: 2, 
      bitrate: 8, 
      samplerate: 44100,
      remove: false,
    })
    .volume({method: 'dynamic'})
    .priority(6);
  console.log(respSubmit);
  
  const respJobs = await mps.list()
    .pipelineId('<pipelineId>')
    .startTime('2019-01-01 12:00:00')
    .endTime('2019-01-02 12:00:00');
  console.log(respJobs);
  
  const respJob = await mps.query().jobId('<oneJobId>');
  console.log(respJob);
  
  const respCancel = await mps.cancel().jobId('<oneJobId>');
  console.log(respCancel); 
  // ...
}

main()
``` 
