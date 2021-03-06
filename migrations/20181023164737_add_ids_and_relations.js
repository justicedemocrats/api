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
      t.increments("id")
        .unique()
        .primary();
      t.integer("person_id").references("people");
      t.string("email").references("email_addresses");
    }),

    knex.schema.createTable("people_phones", t => {
      t.increments("id")
        .unique()
        .primary();
      t.integer("person_id").references("people");
      t.string("number").references("phone_numbers");
    }),

    knex.schema.createTable("people_addresses", t => {
      t.integer("person_id").references("people");
      t.integer("address_id").references("postal_addresses");
    }),

    knex.schema.createTable("nominations", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("type");
      t.string("airtable_id");
      t.string("state");
      t.string("district");
      t.jsonb("data");
      t.integer("nominee").references("people");
      t.integer("nominator").references("people");
    }),

    knex.schema.createTable("cosigners", t => {
      t.increments("id")
        .unique()
        .primary();
      t.string("airtable_id");
      t.integer("nomination").references("nominations");
      t.string("name");
      t.string("email");
      t.string("zip");
      t.boolean("confirmed");
    }),

    knex.schema.createTable("module_submissions", t => {
      t.increments("id")
        .unique()
        .primary();
      t.integer("nomination").references("nominations");
      t.string("airtable_id");
      t.string("module_reference");
      t.string("module_title");
      t.jsonb("data");
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
    knex.schema.dropTable("cosigners"),
    knex.schema.dropTable("module_submissions")
  ]);
};
