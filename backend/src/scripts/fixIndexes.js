/**
 * Drops all duplicate/excess indexes from tables bloated by repeated
 * Sequelize alter:true syncs. Keeps PRIMARY KEY + one copy of each
 * named unique constraint per column, then re-adds needed UNIQUE indexes.
 *
 * Run once: node src/scripts/fixIndexes.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../..', 'backend', '.env') })
const { sequelize } = require('../models')

// Tables to clean + the unique columns each should keep
const TABLES = {
  Buses:            ['busNumber', 'registrationNumber'],
  Teachers:         ['userId', 'employeeCode'],
  Users:            ['email'],
  Complaints:       [],
  ClassRooms:       ['roomNumber'],
  Subjects:         ['subjectCode'],
  StudentCategories:['name'],
  Sections:         ['name'],
  Certificates:     ['certificateNo'],
}

async function dropAllNonPrimaryIndexes(table) {
  const [indexes] = await sequelize.query(
    `SELECT DISTINCT index_name FROM information_schema.statistics
     WHERE table_schema = DATABASE()
       AND table_name   = '${table}'
       AND index_name   != 'PRIMARY'`
  )
  for (const row of indexes) {
    try {
      await sequelize.query(`ALTER TABLE \`${table}\` DROP INDEX \`${row.index_name}\``)
    } catch (e) {
      // Already dropped or doesn't exist — ignore
    }
  }
}

async function addUniqueIndex(table, col) {
  const idxName = `${table}_${col}_unique`
  try {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD UNIQUE KEY \`${idxName}\` (\`${col}\`)`)
    console.log(`  ✅  Added UNIQUE on ${table}.${col}`)
  } catch (e) {
    console.log(`  ⚠️   ${table}.${col}: ${e.message}`)
  }
}

;(async () => {
  try {
    await sequelize.authenticate()
    console.log('Connected.\n')

    for (const [table, uniqueCols] of Object.entries(TABLES)) {
      process.stdout.write(`Cleaning ${table}… `)
      await dropAllNonPrimaryIndexes(table)
      console.log('cleared.')
      for (const col of uniqueCols) {
        await addUniqueIndex(table, col)
      }
    }

    console.log('\n✅  Done. All duplicate indexes removed.')
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await sequelize.close()
  }
})()
