import { LogService } from '../../src/services/log/log.service';

describe('log service', () => {
  let infoSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  beforeAll(() => {
    infoSpy = jest.spyOn(console, 'info');
    errorSpy = jest.spyOn(console, 'error');

    infoSpy.mockImplementation(() => jest.fn);
    errorSpy.mockImplementation(() => jest.fn);
  });

  it('should log info', async () => {
    const logService = new LogService();

    logService.info('prefix', 'test');

    expect(infoSpy).toHaveBeenCalledTimes(1);
  });
  it('should log error', async () => {
    const logService = new LogService();

    logService.error('prefix', 'test');

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
