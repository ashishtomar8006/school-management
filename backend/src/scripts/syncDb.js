require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })
const { sequelize } = require('../models')

async function run() {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
  await sequelize.sync({ alter: true })
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1')
  console.log('✅  Database synced.')
  process.exit(0)
}

run().catch(err => { console.error('❌ ', err.message); process.exit(1) })
