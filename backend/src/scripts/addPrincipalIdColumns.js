/**
 * Step 1: Add principalId column to all tables that need it (raw SQL).
 * Step 2: Run sequelize.sync({ alter: true }) to add composite unique indexes.
 *
 * Run this instead of syncDb.js when the tables already exist:
 *   node src/scripts/addPrincipalIdColumns.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const { sequelize } = require('../models')

// Tables and their MySQL table names (Sequelize pluralises by default)
const tables = [
  'Sections',
  'ClassSections',
  'ClassRooms',
  'Subjects',
  'BusRoutes',
  'Buses',
  'Complaints',
  'FeeRecords',
  'FeeStructures',
  'Homeworks',
  'Notices',
  'Exams',
  'ExamResults',
  'Certificates',
  'SalaryRecords',
  'Interviews',
  'StudentCategories',
  'Attendances',
]

// SchoolSettings needs a full rebuild (was integer singleton, now UUID + principalId)
const SCHOOL_SETTINGS_REBUILD = true

async function run() {
  await sequelize.authenticate()
  console.log('✅  Connected.\n')

  const qi = sequelize.getQueryInterface()

  // ── 1. Add principalId column to all tables ──────────────────────────────────
  for (const table of tables) {
    try {
      const cols = await qi.describeTable(table)

      if (cols.principalId) {
        console.log(`⏭   ${table}: principalId already exists`)
        continue
      }

      await qi.addColumn(table, 'principalId', {
        type: require('sequelize').DataTypes.UUID,
        allowNull: true,
        after: 'id',
      })
      console.log(`✅  ${table}: principalId column added`)
    } catch (err) {
      if (err.message?.includes('already exists') || err.original?.code === 'ER_DUP_FIELDNAME') {
        console.log(`⏭   ${table}: principalId already exists (caught)`)
      } else {
        console.error(`❌  ${table}:`, err.message)
      }
    }
  }

  // ── 2. Rebuild school_settings table if still integer-keyed ─────────────────
  if (SCHOOL_SETTINGS_REBUILD) {
    try {
      const cols = await qi.describeTable('school_settings')
      if (cols.id && cols.id.type === 'INT') {
        console.log('\n🔄  Rebuilding school_settings (integer → UUID + principalId)…')
        await sequelize.query('DROP TABLE IF EXISTS `school_settings`')
        console.log('✅  school_settings dropped (will be recreated by sync)')
      } else if (!cols.principalId) {
        await qi.addColumn('school_settings', 'principalId', {
          type: require('sequelize').DataTypes.UUID,
          allowNull: true,
          after: 'id',
        })
        console.log('✅  school_settings: principalId column added')
      } else {
        console.log('⏭   school_settings: already migrated')
      }
    } catch (err) {
      if (err.original?.code === 'ER_NO_SUCH_TABLE') {
        console.log('⏭   school_settings: does not exist yet (sync will create it)')
      } else {
        console.error('❌  school_settings:', err.message)
      }
    }
  }

  // ── 3. Now run alter sync to add composite unique indexes ────────────────────
  console.log('\n🔄  Running sequelize.sync({ alter: true }) …')
  await sequelize.sync({ alter: true })
  console.log('\n✅  All done — database is up to date.')
  process.exit(0)
}

run().catch(err => {
  console.error('❌  Fatal:', err)
  process.exit(1)
})
