import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports the API as healthy', () => {
    const controller = new HealthController();
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('market-commerce-api');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
