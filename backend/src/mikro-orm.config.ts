// mikro-orm.config.ts
import { defineConfig } from '@mikro-orm/sqlite'

export default defineConfig({
    entities: ['./dist/entities/**/*.js'],
    entitiesTs: ['./src/entities/**/*.ts'],
    dbName: 'data/bun-template.sqlite3',
    debug: process.env.NODE_ENV !== 'production'
})
