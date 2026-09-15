import { describe, expect, it } from 'vitest';
import { assertAllowedCertificateUpload, detectImageMagic } from './certificates';

describe('certificate magic bytes', () => {
  it('detects PNG', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
    expect(detectImageMagic(png)?.mimeType).toBe('image/png');
  });

  it('rejects mismatched MIME', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
    expect(() => assertAllowedCertificateUpload(jpeg, 'image/png')).toThrow(/MIME/);
  });

  it('rejects oversized payloads', () => {
    const huge = Buffer.alloc(10 * 1024 * 1024 + 1, 0xff);
    huge[0] = 0xff;
    huge[1] = 0xd8;
    huge[2] = 0xff;
    expect(() => assertAllowedCertificateUpload(huge, 'image/jpeg')).toThrow(/10 MB/);
  });
});
