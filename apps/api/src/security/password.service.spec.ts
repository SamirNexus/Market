import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes passwords with a per-password salt', async () => {
    const first = await service.hash('correct horse battery staple');
    const second = await service.hash('correct horse battery staple');

    expect(first).not.toEqual(second);
    await expect(
      service.verify('correct horse battery staple', first),
    ).resolves.toBe(true);
  });

  it('rejects incorrect and malformed password hashes', async () => {
    const stored = await service.hash('a secure password');

    await expect(service.verify('wrong password', stored)).resolves.toBe(false);
    await expect(service.verify('anything', 'invalid')).resolves.toBe(false);
  });
});
