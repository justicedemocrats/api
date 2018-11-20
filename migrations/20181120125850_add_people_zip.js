exports.up = function(knex, Promise) {
  return knex.schema.alterTable("people", t => {
    t.string("zip");
  });
};

exports.down = function(knex, Promise) {
  return knex.scheam.alterTable("people", t => {
    t.dropColumn("zip");
  });
};
