exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable("people", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.string("name");
    }),
    knex.schema.createTable("email_addresses", t => {
      t.string("email")
        .unique()
        .primary();
      t.string("airtable_id");
    }),
    knex.schema.createTable("phone_numbers", t => {
      t.string("number")
        .unique()
        .primary();
      t.string("airtable_id");
    }),
    knex.schema.createTable("postal_addresses", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.string("address1");
      t.string("address2");
      t.string("zip");
      t.string("city");
      t.string("state");
      t.string("type"); // ['home', 'work', 'other']
    }),
    knex.schema.createTable("people_emails", t => {
      t.integer("person_id").references("people");
      t.string("number").references("phone_numbers");
    }),
    knex.schema.createTable("people_phones", t => {
      t.integer("person_id").references("people");
      t.string("email").references("email_addresses");
    }),
    knex.schema.createTable("people_addresses", t => {
      t.integer("person_id").references("people");
      t.integer("address_id").references("postal_addresses");
    }),
    knex.schema.createTable("nominations", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.jsonb("raw");
      t.integer("nominee").references("people");
      t.integer("nominator").references("people");
    }),
    knex.schema.createTable("cosigns", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.integer("person_id").references("people");
      t.integer("nomination_id").references("nominations");
      t.boolean("confirmed");
    }),
    knex.schema.createTable("module_1_submissions", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.integer("nomination_id").references("nominations");
      t.jsonb("raw");
    }),
    knex.schema.createTable("module_2_submissions", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.integer("nomination_id").references("nominations");
      t.jsonb("raw");
    }),
    knex.schema.createTable("module_3_submissions", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.integer("nomination_id").references("nominations");
      t.jsonb("raw");
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable("people"),
    knex.schema.dropTable("email_addresses"),
    knex.schema.dropTable("phone_numbers"),
    knex.schema.dropTable("postal_addresses"),
    knex.schema.dropTable("people_emails"),
    knex.schema.dropTable("people_phones"),
    knex.schema.dropTable("people_addresses"),
    knex.schema.dropTable("nominations"),
    knex.schema.dropTable("cosigns"),
    knex.schema.dropTable("module_1_submissions"),
    knex.schema.dropTable("module_2_submissions"),
    knex.schema.dropTable("module_3_submissions")
  ]);
};
