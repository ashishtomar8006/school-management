/**
 * Admin Seeder
 * Creates (or upserts) a super-admin in the Admins table.
 * Safe to run on an existing database — updates if email exists, creates otherwise.
 *
 * Usage:
 *   node src/scripts/seedAdmin.js
 *   node src/scripts/seedAdmin.js --email=admin@edumanage.com --name="Super Admin" --password=admin@123
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const { sequelize, Admin } = require('../models')

// ── CLI arg parser ─────────────────────────────────────────────────────────────
function arg(name, fallback) {
  const flag = process.argv.find(a => a.startsWith(`--${name}=`))
  return flag ? flag.split('=').slice(1).join('=') : fallback
}

const ADMIN_DATA = {
  name:     arg('name',     'Super Admin'),
  email:    arg('email',    'admin@edumanage.com'),
  password: arg('password', 'admin@123'),
  isActive: true,
}

;(async () => {
  try {
    await sequelize.authenticate()
    console.log('✅  Database connected.\n')

    const existing = await Admin.findOne({ where: { email: ADMIN_DATA.email } })

    if (existing) {
      // Update password + name in case they changed
      existing.name     = ADMIN_DATA.name
      existing.password = ADMIN_DATA.password   // triggers beforeUpdate bcrypt hook
      existing.isActive = true
      await existing.save()
      console.log('♻️   Admin updated:')
    } else {
      await Admin.create(ADMIN_DATA)
      console.log('🎉  Admin created:')
    }

    console.log(`     Name     : ${ADMIN_DATA.name}`)
    console.log(`     Email    : ${ADMIN_DATA.email}`)
    console.log(`     Password : ${ADMIN_DATA.password}`)
    console.log('\n✅  Done.')
  } catch (err) {
    console.error('❌  Error:', err.message)
    process.exit(1)
  } finally {
    await sequelize.close()
  }
})()
