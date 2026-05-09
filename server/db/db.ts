import { DatabaseSync } from 'node:sqlite'
import fs from 'fs'
import path from 'path'

const DB_DIR = path.resolve(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'liftoff.db')
const SCHEMA_PATH = path.join(__dirname, 'schema.sql')

fs.mkdirSync(DB_DIR, { recursive: true })

const db = new DatabaseSync(DB_PATH)
db.exec('PRAGMA journal_mode = WAL')
db.exec('PRAGMA foreign_keys = ON')

const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8')
db.exec(schema)

export default db
