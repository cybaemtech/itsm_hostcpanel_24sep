import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// MySQL cPanel database configuration
const mysqlConfig = {
  host: '82.25.105.94',
  database: 'cybaemtechnet_itsm_helpdesk',
  user: 'cybaemtechnet_itsm_helpdesk',
  password: 'Cybaem@2025',
  charset: 'utf8mb4',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
};

console.log('🔗 Connecting to MySQL cPanel database...');
export const connection = mysql.createPool(mysqlConfig);
export const db = drizzle(connection, { schema, mode: 'default' });