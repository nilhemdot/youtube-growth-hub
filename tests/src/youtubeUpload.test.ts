import fs from 'fs';

jest.mock('../../src/youtubeAuth', () => ({
  oauth2Client: { mockClient: true },
}));

const insertMock = jest.fn();
const youtubeFactoryMock = jest.fn(() => ({
  videos: { insert: insertMock },
}));

jest.mock('googleapis', () => ({
  google: {
    youtube: youtubeFactoryMock,
  },
}));

import { uploadVideo } from '../../src/youtubeUpload';
import { oauth2Client } from '../../src/youtubeAuth';

describe('uploadVideo', () => {
  const FAKE_STREAM = { fakeStream: true };

  beforeEach(() => {
    jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1024 } as fs.Stats);
    jest.spyOn(fs, 'createReadStream').mockReturnValue(FAKE_STREAM as unknown as fs.ReadStream);
  });

  it('creates a youtube client authenticated with the shared oauth2Client', async () => {
    insertMock.mockResolvedValue({ data: { id: 'video-1' } });

    await uploadVideo('/tmp/video.mp4', 'Title', 'Description', ['tag1']);

    expect(youtubeFactoryMock).toHaveBeenCalledWith({
      version: 'v3',
      auth: oauth2Client,
    });
  });

  it('reads the file size and streams the file body from the given path', async () => {
    insertMock.mockResolvedValue({ data: { id: 'video-1' } });

    await uploadVideo('/tmp/video.mp4', 'Title', 'Description', []);

    expect(fs.statSync).toHaveBeenCalledWith('/tmp/video.mp4');
    expect(fs.createReadStream).toHaveBeenCalledWith('/tmp/video.mp4');
  });

  it('submits snippet, status, and media with expected defaults', async () => {
    insertMock.mockResolvedValue({ data: { id: 'video-1' } });

    await uploadVideo('/tmp/video.mp4', 'My Title', 'My Description', ['a', 'b']);

    expect(insertMock).toHaveBeenCalledTimes(1);
    const [params] = insertMock.mock.calls[0];

    expect(params.part).toEqual(['snippet', 'status']);
    expect(params.requestBody.snippet).toEqual({
      title: 'My Title',
      description: 'My Description',
      tags: ['a', 'b'],
      categoryId: '20',
    });
    expect(params.requestBody.status).toEqual({ privacyStatus: 'private' });
    expect(params.media.body).toBe(FAKE_STREAM);
  });

  it('supports an empty tags array', async () => {
    insertMock.mockResolvedValue({ data: { id: 'video-2' } });

    await uploadVideo('/tmp/video.mp4', 'Title', 'Description', []);

    const [params] = insertMock.mock.calls[0];
    expect(params.requestBody.snippet.tags).toEqual([]);
  });

  it('resolves with the data returned by the YouTube API', async () => {
    insertMock.mockResolvedValue({ data: { id: 'video-3', kind: 'youtube#video' } });

    const result = await uploadVideo('/tmp/video.mp4', 'Title', 'Description', []);

    expect(result).toEqual({ id: 'video-3', kind: 'youtube#video' });
  });

  it('propagates errors thrown by the YouTube API', async () => {
    insertMock.mockRejectedValue(new Error('quota exceeded'));

    await expect(
      uploadVideo('/tmp/video.mp4', 'Title', 'Description', [])
    ).rejects.toThrow('quota exceeded');
  });
});