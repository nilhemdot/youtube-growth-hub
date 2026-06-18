import { google } from 'googleapis';
import fs from 'fs';
import { oauth2Client } from './youtubeAuth';

export const uploadVideo = async (filePath: string, title: string, description: string, tags: string[]) => {
  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client
  });

  const fileSize = fs.statSync(filePath).size;

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title,
        description,
        tags,
        categoryId: '20', // Gaming — Minecraft parkour
      },
      status: {
        privacyStatus: 'private', // Upload as private by default for safety
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  }, {
    // onUploadProgress: (evt) => {
    //   const progress = (evt.bytesRead / fileSize) * 100;
    //   console.log(`${Math.round(progress)}% complete`);
    // },
  });

  return res.data;
};
