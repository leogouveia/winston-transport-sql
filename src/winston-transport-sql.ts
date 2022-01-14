/**
 * @module ''
 * @fileoverview
 * @license MIT
 * @author ''
 */
import knex, { Knex } from 'knex';
import Transport, { TransportStreamOptions } from 'winston-transport';
import { CallbackFn, TransportSqlOptions } from './types';

export const handleCallback = (
  callback: (...args: any) => void,
  ...args: any
) => {
  if (callback && typeof callback === 'function') {
    callback(...args);
  }
};

export class SqlTransport extends Transport {
  client: Knex<any, unknown[]>;
  defaultMeta: any;
  label: string;
  name: string;
  tableName: string;

  constructor(opts: TransportSqlOptions & TransportStreamOptions) {
    super(opts);

    if (!opts.client) {
      throw new Error('The client is required');
    }

    if (!opts.connection) {
      throw new Error('The connection is required');
    }

    const {
      client,
      connection = {},
      defaultMeta = {},
      label = '',
      level = 'info',
      name = 'SqlTransport',
      tableName = 'winston_logs',
    } = opts;

    this.client = knex({
      client,
      connection,
    });

    this.defaultMeta = defaultMeta;
    this.label = label;
    this.level = level;
    this.name = name;
    this.tableName = tableName;
  }

  /**
   * Core logging method exposed to Winston.
   * @param {Info} info - Winston log information.
   * @param {Function} next - Continuation to respond to when complete.
   * @returns {void}
   */
  log(info: any, callback: CallbackFn) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    const { level, message, ...meta } = info;

    const log = {
      level,
      message,
      meta: JSON.stringify({ ...meta, ...this.defaultMeta }),
      timestamp: new Date().toISOString(),
    };

    const logQuery = async (cb: CallbackFn) => {
      try {
        await this.client.insert(log).into(this.tableName);
      } catch (error) {
        cb(error);
      }
    };

    logQuery((error: unknown) => {
      if (error) {
        return handleCallback(callback, error);
      }
      return handleCallback(callback);
    });
  }

  /**
   * Flush all logs
   * Return a Promise which resolves when all logs are finished.
   * @return {Promise} result within a Promise
   */
  flush(): Promise<any> {
    return this.client.from(this.tableName).del();
  }

  /**
   * Only called when a transport is removed from the logger.
   * End the connection
   */
  close(): Promise<any> {
    setImmediate(() => this.emit('closed'));
    return this.client.destroy();
  }
}
