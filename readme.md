# 阿里云媒体处理服务(MPS)

**现阶段只实现部分音频相关的 API !!!**  
**Only implemented some audio transcode API now!!!**  

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
  let resp;
  
  resp = await mps.submitMediaInfo().input({bucket:'...', location:'...', object:'...'});
  console.log(resp.statusCode);
  console.log(JSON.stringify(resp.body, null, 2));
  
  resp = await mps.submit()
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
    })
    .volume({method: 'dynamic'})
    .priority(6);
  console.log(resp.statusCode);
  console.log(JSON.stringify(resp.body, null, 2));
  
  resp = await mps.list()
    .startTime('2019-01-01 12:00:00')
    .endTime('2019-01-02 12:00:00');
  console.log(resp.statusCode);
  console.log(JSON.stringify(resp.body, null, 2));
  
  resp = await mps.query().jobId('<oneJobId>');
  console.log(resp.statusCode);
  console.log(JSON.stringify(resp.body, null, 2));
  
  resp = await mps.cancel().jobId('<oneJobId>');
  console.log(resp.statusCode);
  console.log(JSON.stringify(resp.body, null, 2));
  // ...
}

main()
``` 
