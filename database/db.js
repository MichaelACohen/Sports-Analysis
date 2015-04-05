var pg = require('pg');

var connectionString = 'postgres://postgres:gametymers32@localhost:5432/basketball';

module.exports = {
   query: function(text, values, cb) {
      pg.connect(connectionString, function(err, client, done) {
        client.query(text, values, function(err, result) {
          done();
          cb(err, result);
        })
      });
   }
}