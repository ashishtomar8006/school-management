require('dotenv').config()

const app           = require('./src/app')
const { sequelize, User, Student, Teacher, Parent } = require('./src/models')

const PORT = process.env.PORT || 5000

// Safely add a column only if it doesn't already exist
async function addColumnIfMissing(sequelize, table, column, definition) {
  try {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`)
    console.log(`✅  Added ${table}.${column}`)
  } catch (e) {
    if (!e.message.includes('Duplicate column')) throw e
    // Column already exists — nothing to do
  }
}

// Add all new columns that may be missing (safe to run repeatedly)
async function runMigrations(sequelize) {
  // Principals table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Principals\` (
      \`id\`         CHAR(36) NOT NULL,
      \`name\`       VARCHAR(100) NOT NULL,
      \`email\`      VARCHAR(150) NOT NULL,
      \`password\`   VARCHAR(255) NOT NULL,
      \`phone\`      VARCHAR(20),
      \`address\`    TEXT,
      \`schoolName\` VARCHAR(200),
      \`isActive\`   TINYINT(1) NOT NULL DEFAULT 1,
      \`createdAt\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`Principals_email_u\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // Admins table
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`Admins\` (
      \`id\`        CHAR(36) NOT NULL,
      \`name\`      VARCHAR(100) NOT NULL,
      \`email\`     VARCHAR(150) NOT NULL,
      \`password\`  VARCHAR(255) NOT NULL,
      \`isActive\`  TINYINT(1) NOT NULL DEFAULT 1,
      \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`Admins_email_u\` (\`email\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // Ensure school_settings table exists
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS \`school_settings\` (
      \`id\`               INT NOT NULL DEFAULT 1,
      \`schoolName\`       VARCHAR(200) DEFAULT 'EduManage School',
      \`tagline\`          VARCHAR(200) DEFAULT 'Empowering Education',
      \`address\`          TEXT,
      \`phone\`            VARCHAR(30),
      \`email\`            VARCHAR(150),
      \`website\`          VARCHAR(255),
      \`principalName\`    VARCHAR(150) DEFAULT 'Principal',
      \`logoDataUrl\`      LONGTEXT,
      \`signatureDataUrl\` LONGTEXT,
      \`themeColorId\`     VARCHAR(30) DEFAULT 'teal',
      \`createdAt\`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\`        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  // Add principalId to profile tables
  await addColumnIfMissing(sequelize, 'Students', 'principalId', 'CHAR(36) DEFAULT NULL')
  await addColumnIfMissing(sequelize, 'Teachers', 'principalId', 'CHAR(36) DEFAULT NULL')
  await addColumnIfMissing(sequelize, 'Parents',  'principalId', 'CHAR(36) DEFAULT NULL')
  console.log('✅  Migrations complete.')
}

// Backfill principalId on Student/Teacher/Parent rows that predate this field
async function backfillPrincipalId() {
  try {
    const principal = await User.findOne({ where: { role: 'principal', isActive: true } })
    if (!principal) return

    const id = principal.id
    const [sRows] = await sequelize.query(`UPDATE Students SET principalId = '${id}' WHERE principalId IS NULL`)
    const [tRows] = await sequelize.query(`UPDATE Teachers SET principalId = '${id}' WHERE principalId IS NULL`)
    const [pRows] = await sequelize.query(`UPDATE Parents  SET principalId = '${id}' WHERE principalId IS NULL`)

    const updated = (sRows?.affectedRows || 0) + (tRows?.affectedRows || 0) + (pRows?.affectedRows || 0)
    if (updated > 0) console.log(`✅  Backfilled principalId for ${updated} existing records.`)
  } catch (err) {
    console.warn('⚠️   principalId backfill skipped:', err.message)
  }
}

const start = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅  Database connected.')

    // Never use alter:true — it accumulates duplicate indexes on every restart.
    // New columns are handled by the targeted migration below.
    await sequelize.sync({ force: false })
    console.log('✅  Models synced.')

    await runMigrations(sequelize)

    await backfillPrincipalId()

    app.listen(PORT, () => {
      console.log(`🚀  Server running on http://localhost:${PORT}`)
      console.log(`📚  API base: http://localhost:${PORT}/api/v1`)
    })
  } catch (err) {
    console.error('❌  Failed to start server:', err)
    process.exit(1)
  }
}

start()
