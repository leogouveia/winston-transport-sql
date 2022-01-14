import { SqlTransport } from '../winston-transport-sql';

import assert, { ok, strictEqual } from 'assert';

const transportConfig = {
  client: <const>'mssql',
  connection: {
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    server: process.env.MSSQL_HOST,
    database: process.env.MSSQL_DB,
  },
};

const info = {
  level: 'debug',
  message: 'message',
};
describe('.log()', () => {
  const transport = new SqlTransport(transportConfig);

  it('should be present', () => {
    ok(transport.log);
    strictEqual('function', typeof transport.log);
  });

  it('should not throw error without callback', () => {
    const result = transport.log(info, () => undefined);
    expect(result).toBeUndefined();
  });

  it('should not throw error with callback', () => {
    const result = transport.log(info, (_: any, ...status: any) => {
      assert('true', status);
    });
    expect(result).toBeUndefined();
  });

  it('should emit the logged event', (done) => {
    transport.once('logged', () => {
      done();
    });
    transport.log(info, () => undefined);
  });

  afterAll(() => {
    transport.close();
  });
});
