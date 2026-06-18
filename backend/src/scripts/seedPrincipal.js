/**
 * Principal Seeder
 * Creates (or upserts) the principal user without touching any other data.
 * Safe to run on an existing database — will update the principal if the
 * email already exists, create a fresh one if it does not.
 *
 * Usage:
 *   node src/scripts/seedPrincipal.js
 *   node src/scripts/seedPrincipal.js --email=admin@myschool.com --name="Mrs. Sunita Rao" --password=secret123
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const { sequelize, User } = require('../models')

// ── CLI args parser (no external deps) ────────────────────────────────────────
function arg(name, fallback) {
  const flag = process.argv.find(a => a.startsWith(`--${name}=`))
  return flag ? flag.split('=').slice(1).join('=') : fallback
}

const PRINCIPAL = {
  name:     arg('name',     'Dr. Ramesh Verma'),
  email:    arg('email',    'principal@school.com'),
  password: arg('password', 'principal123'),
  phone:    arg('phone',    '+91-9876543200'),
  address:  arg('address',  null),
  joinDate: arg('joinDate', '2010-01-15'),
  role:     'principal',
  isActive: true,
}

const run = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅  Database connected.')

    // Sync only User table (non-destructive)
    await User.sync({ alter: true })

    const existing = await User.findOne({ where: { email: PRINCIPAL.email } })

    if (existing) {
      // Update without touching the password if it hasn't changed
      const needsPasswordUpdate = !(await existing.validatePassword(PRINCIPAL.password))
      await existing.update({
        name:     PRINCIPAL.name,
        phone:    PRINCIPAL.phone,
        address:  PRINCIPAL.address,
        joinDate: PRINCIPAL.joinDate,
        role:     'principal',
        isActive: true,
        ...(needsPasswordUpdate ? { password: PRINCIPAL.password } : {}),
      })
      console.log(`✏️   Principal updated  →  ${PRINCIPAL.email}`)
    } else {
      await User.create(PRINCIPAL)
      console.log(`➕  Principal created  →  ${PRINCIPAL.email}`)
    }

    console.log('\n─────────────────────────────────────────')
    console.log('  Login credentials')
    console.log('  Email    :', PRINCIPAL.email)
    console.log('  Password :', PRINCIPAL.password)
    console.log('  Role     : principal')
    console.log('─────────────────────────────────────────\n')

    process.exit(0)
  } catch (err) {
    console.error('❌  Seeder failed:', err.message)
    process.exit(1)
  }
}

run()
