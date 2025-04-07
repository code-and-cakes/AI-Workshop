import { config } from 'dotenv';
import { Column, DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import { applyDecorators } from '@nestjs/common';
import * as pgvector from 'pgvector';

export function getDataSourceOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: +process.env.DB_PORT || 5432,
    password: process.env.DB_PASSWORD || 'default',
    username: process.env.DB_USER || 'default',
    database: process.env.DB_DATABASE || 'default',
    entities: [join(__dirname, 'entities') + '/*{.ts,.js}'],
    migrations: [join(__dirname, 'migrations') + '/*{.ts,.js}'],
    migrationsRun: true,
    logging: ['query', 'error'],
  };
}

config();

export function ColumnVector() {
  return applyDecorators(
    Column({
      type: 'vector' as any,
      transformer: {
        from: pgvector.fromSql,
        to: pgvector.toSql,
      },
    }),
  );
}

export function createDataSource(options: DataSourceOptions) {
  const dataSource = new DataSource(options);

  dataSource.driver.supportedDataTypes.push('vector' as any);

  return dataSource;
}

export default createDataSource(getDataSourceOptions());
