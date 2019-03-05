/*
# [提交转码作业](https://help.aliyun.com/document_detail/29226.html)

提交转码作业接口，一个转码输出会生成一个转码作业，接口返回转码作业列表。
作业会添加到管道中被调度执行，执行完成后需要调用查询转码作业接口轮询作业执行结果，也可使用异步通知机制。
(无论提交还是查询, 一次都只支持一个任务)

[参数详情](https://help.aliyun.com/document_detail/29253.html)
 */

const lodash = require('lodash');
const parameter = require('validator-picker/parameter');
const QueryBase = require('../query_base');
const { dropUndefinedValues } = require('../utils');

// ===============================  请求参数  ==================================
const PARAMETER = parameter({
  Input: { path: 'query', type: 'object', required: true },
  'Input.Bucket': { path: 'query', type: 'str', required: true },
  'Input.Location': { path: 'query', type: 'str', required: true },
  'Input.Object': { path: 'query', type: 'str', required: true },

  OutputBucket: { path: 'query', type: 'str', required: true },
  OutputLocation: { path: 'query', type: 'str', default: 'oss-cn-hangzhou' },

  // -----------------------------  Output  -------------------------------
  Outputs: {
    path: 'query', type: 'array', required: true,
    'only one output in this sdk': v => v.length === 1,
  },
  'Outputs[0].OutputObject': { path: 'query', type: 'str', required: true },

  'Outputs[0].TemplateId': { path: 'query', type: 'str', required: true }, // XXX 似乎非 required

  'Outputs[0].Container.Format': { path: 'query', type: 'string', default: 'mp4' },

  'Outputs[0].Audio.Codec': {
    path: 'query', type: 'str', default: 'AAC',
    'accepted codec': v => ['AAC', 'MP3', 'VORBIS', 'FLAC'].includes(v),
  },
  'Outputs[0].Audio.Profile': {
    path: 'query', type: 'str',
    required: query => query.Outputs[0].Audio.Codec === 'AAC',
    'accepted profile': v => ['aac_low', 'aac_he', 'aac_he_v2', 'aac_ld', 'aac_eld'].includes(v),
  },
  'Outputs[0].Audio.Samplerate': {
    path: 'query', type: 'int',
    'accepted samplerate': v => [22050, 32000, 44100, 48000, 96000].includes(v),
  },
  'Outputs[0].Audio.Bitrate': {
    path: 'query', type: 'int', default: 128,
    'bitrate range': v => (v >= 8 && v <= 1000),
  },
  'Outputs[0].Audio.Channels': {
    path: 'query', type: 'int', default: 2,
    'channels range': v => [1, 2, 4, 5, 6, 8].includes(v),
  },

  'Outputs[0].Audio.Volume.Method': {
    path: 'query', type: 'str',
    'volume method range': v => ['auto', 'dynamic', 'linear'].includes(v),
  },
  'Outputs[0].Audio.Volume.IntegratedLoudnessTarget': {
    path: 'query', type: 'int',
    default: query => (query.Outputs[0].Audio.Volume.Method === 'dynameic' ? -6 : undefined),
    'volume loudness target range': v => (v >= -70 && v <= -5),
  },
  'Outputs[0].Audio.Volume.TruePeak': {
    path: 'query', type: 'int',
    default: query => (query.Outputs[0].Audio.Volume.Method === 'dynameic' ? -1 : undefined),
    'volume true peak range': v => (v >= -9 && v <= 0),
  },
  'Outputs[0].Audio.Volume.LoudnessRangeTarget': {
    path: 'query', type: 'int',
    default: query => (query.Outputs[0].Audio.Volume.Method === 'dynameic' ? 8 : undefined),
    'volume loudness range target': v => (v >= 1 && v <= 20),
  },

  'Outputs[0].Audio.Remove': { path: 'query', type: 'bool', default: false },

  // 'Outputs[0].AudioStreamMap': { path: 'query', type: 'str' }, // TODO [0-9]+":a:"[0-9]+
  // 'Outputs[0].Video' TODO
  // 'Outputs[0].WaterMarks': TODO
  // 'Outputs[0].Rotate' TODO

  'Outputs[0].Clip.TimeSpan.Seek': { path: 'query', type: 'str' }, // TODO 保留三位小数的浮点字符串
  'Outputs[0].Clip.TimeSpan.Duration': { path: 'query', type: 'str' }, // TODO 保留三位小数的浮点字符串
  'Outputs[0].Clip.TimeSpan.End': { path: 'query', type: 'str' }, // TODO 保留三位小数的浮点字符串
  'Outputs[0].Clip.ConfigToClipFirstPart': { path: 'query', type: 'boolean' },

  'Outputs[0].TransConfig.TransMode': {
    path: 'query', type: 'str', default: 'onepass',
    'accepted trans mode': v => ['onepass', 'twopass', 'CBR'].includes(v),
  },
  // 'Outputs[0].TransConfig.AdjDarMethod' TODO
  // 'Outputs[0].TransConfig.IsCheckReso' TODO
  // 'Outputs[0].TransConfig.IsCheckResoFail' TODO
  // 'Outputs[0].TransConfig.IsCheckVideoBitrate' TODO
  // 'Outputs[0].TransConfig.isCheckVideoBitrateFail' TODO
  'Outputs[0].TransConfig.IsCheckAudioBitrate': { path: 'query', type: 'bool', default: false },
  'Outputs[0].TransConfig.IsCheckAudioBitrateFail': { path: 'query', type: 'bool', default: false },

  'Outputs[0].MergeList': {
    path: 'query', type: 'array',
    'max merge list size': list => list.length <= 4,
  },

  'Outputs[0].MergeConfigUrl': {
    path: 'query', type: 'url',
    'max merge list size': list => list.length <= 4,
  },

  // 'Outputs[0].MuxConfig' // TODO

  'Outputs[0].Priority': {
    path: 'query', type: 'int', default: 6,
    'priority range': v => (v >= 1 && v <= 10),
  },

  // 'Outputs[0].M3U8NonStandardSupport' FIXME

  'Outputs[0].Encryption.Type': {
    path: 'query', type: 'str', default: 'hls-aes-128',
    'must be hls-aes-128': v => v === 'hls-aes-128',
  },
  'Outputs[0].Encryption.Key': { path: 'query', type: 'str' }, // base64 or KMS
  'Outputs[0].Encryption.KeyUri': { path: 'query', type: 'base64' },
  'Outputs[0].Encryption.KeyType': { path: 'query', type: 'str' }, // base64 or KMS

  // 'Outputs[0].SubtitleConfig' TODO

  // 'Outputs[0].OpeningList' TODO

  // 'Outputs[0].TailSlateList' TODO

  // 'Outputs[0].DeWatermark' TODO

  'Outputs[0].Amix.AmixURL': { path: 'query', type: 'url' },
  'Outputs[0].Amix.Map': { path: 'query', type: 'str' }, // TODO [0-9]+":a:"[0-9]+
  'Outputs[0].Amix.MixDurMode': {
    path: 'query', type: 'str', default: 'long',
    'mix duration mode': v => ['first', 'long'].includes(v),
  },

  PipelineId: { path: 'query', type: 'str', required: true },

  UserData: {
    path: 'query', type: 'string', required: false,
    '<= 1024 bytes': v => Buffer.from(v, 'utf8').length <= 1024,
  },
});

// ============================================================================
class SubmitJobs extends QueryBase {
  constructor(options) {
    super('SubmitJobs', 'POST', options);
    this.parameter = PARAMETER;
  }

  /**
   * 作业输入，Json对象, 需在控制台授予此Bucket权限给媒体转码服务。
   * @param bucket {string}
   * @param location {string}
   * @param object {string}
   * @return {SubmitJobs}
   */
  input({ bucket, location, object }) {
    this.query.Input = {
      Bucket: bucket,
      Location: location,
      Object: encodeURIComponent(object),
    };

    return this;
  }

  /**
   * @param bucket {string}
   * @param location {string}
   * @param object {string}
   * @return {SubmitJobs}
   */
  output({ bucket, location, object }) {
    this.query.outputBucket = bucket;
    this.query.outputLocation = location;
    lodash.set(this.query, 'Outputs[0].OutputObject', object);

    return this;
  }

  /**
   * 容器格式。默认值：mp4
   * @param value {String}
   * @return {SubmitJobs}
   */
  format(value) {
    lodash.set(this.query, 'Outputs[0].Container.Format', value);
    return this;
  }

  templateId(value) {
    lodash.set(this.query, 'Outputs[0].TemplateId', value);

    return this;
  }

  /**
   * @param audioOptions
   * @param codec {string} ['AAC', 'MP3', 'VORBIS', 'FLAC']
   * @param channels {Number} 信道数量 [1,2]
   * @param bitrate {Number} [8, 1000] 单位: kbps
   * @param samplerate {Number}
   * @param profile {String} 当codec为 'AAC' 时，范围['aac_low','aac_he','aac_he_v2','aac_ld','aac_eld']
   * @return {SubmitJobs}
   */
  audio({ codec, channels, bitrate, samplerate, profile }) {
    lodash.set(this.query, 'Outputs[0].Audio',
      dropUndefinedValues({
        Codec: codec,
        Channels: channels,
        Bitrate: bitrate,
        Samplerate: samplerate,
        Profile: profile,
      }),
    );

    return this;
  }

  /**
   * 是否删除源文件, 默认为 false
   * @param remove {boolean}
   * @return {SubmitJobs}
   */
  remove(remove) {
    lodash.set(this.query, 'Outputs[0].Audio.Remove', remove);

    return this;
  }

  /**
   * 设置音量
   * @param method {String} 音量调整方式 ['auto', 'dynamic', 'linear']
   * @param target {Number} 目标音量, 取值范围：[-70, -5] 需指定 method '为dynamic' 默认值：-6
   * @param peak {Number} 最大峰值, 取值范围：[-9, 0] 需指定 method '为dynamic' 默认值：-1
   * @param range {Number} 音量范围, 取值范围：[1, 20] 需指定 method '为dynamic' 默认值：8
   * @return {SubmitJobs}
   */
  volume({ method, target, peak, range }) {
    lodash.set(this.query, 'Outputs[0].Audio.Volume',
      dropUndefinedValues({
        Method: method,
        IntegratedLoudnessTarget: target,
        TruePeak: peak,
        LoudnessRangeTarget: range,
      }),
    );

    return this;
  }

  /**
   * @param seek {Number} 开始时间, 单位:秒(s)
   * @param duration {Number} 持续时间, 单位:秒(s)
   * @param end {Number} 结束时间, 设置end 则duration失效. 单位:秒(s)
   * @param clipFirst {Boolean} true: 先剪辑后拼接, false: 先拼接再剪辑
   * @return {SubmitJobs}
   */
  clip({ seek, duration, end, clipFirst }) {
    lodash.set(this.query, 'Outputs[0].Clip.TimeSpan', lodash.mapValues(
      dropUndefinedValues({
        Seek: seek,
        Duration: duration,
        End: end,
      }),
      v => v.toFixed(3), // 转为保留 3 位小数的字符串
    ));

    lodash.set(this.query, 'Outputs[0].Clip.ConfigToClipFirstPart', clipFirst);

    return this;
  }

  /**
   * 设置转码模式
   * @param mode {String}
   * @param checkReso {Boolean} 是否检查分辨率。
   * @param checkResoFail {Boolean}
   * @param checkVideoBitrate {Boolean} 是否检查视频码率。
   * @param checkVideoBitrateFail {Boolean}
   * @param checkAudioBitrate {Boolean} 是否检查视频码率。
   * @param checkAudioBitrateFail {Boolean}
   * @return {SubmitJobs}
   */
  transConfig({
    mode,
    checkReso,
    checkResoFail,
    checkAudioBitrate,
    checkAudioBitrateFail,
    checkVideoBitrate,
    checkVideoBitrateFail,
  }) {
    lodash.set(this.query, 'Outputs[0].TransConfig', dropUndefinedValues({
      TransMode: mode,
      IsCheckReso: checkReso,
      IsCheckResoFail: checkResoFail,
      IsCheckAudioBitrate: checkAudioBitrate,
      isCheckAudioBitrateFail: checkAudioBitrateFail,
      IsCheckVideoBitrate: checkVideoBitrate,
      isCheckVideoBitrateFail: checkVideoBitrateFail,
    }));

    return this;
  }

  /**
   * 将 input 的 ossUrl 和 mergeList 的 ossUrls 进行合并
   * @param ossUrls {Array<String>} 1 <= ossUrls.length <= 4
   * @return {SubmitJobs}
   */
  mergeList(ossUrls) {
    lodash.set(this.query, 'Outputs[0].MergeList',
      ossUrls.map(url => ({ MergeURL: url })),
    );

    return this;
  }

  mergeConfigUrl(configUrl) {
    lodash.set(this.query, 'Outputs[0].MergeConfigUrl', configUrl);

    return this;
  }

  /**
   * 混音详情
   * @param url {String} 需要被混音的背景音轨媒体。
   * @param map {String} 在AmixURL中选取目标音轨，取值为：0:a:{audio_index}, 如0:a:0
   * @param mode
   * @return {SubmitJobs}
   */
  audioMix({ url, map, mode }) {
    lodash.set(this.query, 'Outputs[0].Amix', dropUndefinedValues({
      AmixURL: url,
      Map: map,
      MixDurMode: mode,
    }));

    return this;
  }

  encryption({ key, keyUri, keyType }) {
    lodash.set(this.query, 'Outputs[0].Encryption', dropUndefinedValues({
      Type: 'hls-aes-128',
      Key: key,
      KeyUri: keyUri,
      KeyType: keyType,
    }));

    return this;
  }

  /**
   * 任务在其对应管道内的转码优先级。范围：[1-10]，最高优先级：10
   * @param priority {Number}
   * @return {SubmitJobs}
   */
  priority(priority) {
    lodash.set(this.query, 'Outputs[0].Priority', priority);

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

  /**
   * 管道ID。若需要异步通知，须保证此管道绑定了可用的消息主题
   * @param value
   * @return {SubmitJobs}
   */
  pipelineId(value) {
    this.query.PipelineId = value;

    return this;
  }
}

module.exports = SubmitJobs;
