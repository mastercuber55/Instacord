import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import xml2js from 'xml2js';

const execAsync = promisify(exec);

async function downloadFile(url, filePath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);

  const stream = fs.createWriteStream(filePath);
  return new Promise((resolve, reject) => {
    res.body.pipe(stream);
    res.body.on('error', reject);
    stream.on('finish', resolve);
  });
}

export async function mergeReel(videoUrl, audioUrl, outputPath = './reels/output.mp4') {
  const videoPath = './reels/video.mp4';
  const audioPath = './reels/audio.mp4';

  await downloadFile(videoUrl, videoPath);
  await downloadFile(audioUrl, audioPath);

  const cmd = `ffmpeg -y -i ${videoPath} -i ${audioPath} -c:v copy -c:a aac ${outputPath}`;
  await execAsync(cmd);

  return path.resolve(outputPath);
}

async function reelXml(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) return reject(err);

      const adaptationSets = result.MPD.Period.AdaptationSet;
      const videoSet = Array.isArray(adaptationSets)
        ? adaptationSets.find(a => a.$.contentType === 'video')
        : adaptationSets;
      const audioSet = Array.isArray(adaptationSets)
        ? adaptationSets.find(a => a.$.contentType === 'audio')
        : null;

      const videoReps = videoSet?.Representation;
      const audioRep = audioSet?.Representation;

      const videoURLs = (Array.isArray(videoReps) ? videoReps : [videoReps]).map(r => ({
        quality: r.$.FBQualityLabel || r.$.height + 'p',
        url: r.BaseURL
      }));

      const audioURL = audioRep?.BaseURL || null;

      resolve({
        video: videoURLs,
        audio: audioURL
      });
    });
  });
}

export default async function getReel(xml) {
    const urls = await reelXml(xml)
    const videoUrl = urls.video[6].url
    const audioUrl = urls.audio

    await downloadFile(audioUrl, "reels/audio.mp4");
    return "reels/audio.mp4"
}