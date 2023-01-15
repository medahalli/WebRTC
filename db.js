const sqlite3 = require('sqlite3')
const { open } = require('sqlite')

module.exports = {
  openDb: async () => {
    return open({
      filename: 'Data_Base.db',
      driver: sqlite3.Database
    })
  }
}