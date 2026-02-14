/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "properties",
    type: "base",
    system: false,
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
    fields: [
      { name: "owner", type: "relation", required: true, options: { collectionId: "_pb_users_auth_", maxSelect: 1 } },
      { name: "address", type: "text", options: {} },
      { name: "postcode", type: "text", options: {} },
      { name: "price", type: "number", options: {} },
      { name: "status", type: "text", options: {} },
      { name: "property_type", type: "text", options: {} },
      { name: "bedrooms", type: "number", options: {} },
      { name: "bathrooms", type: "number", options: {} },
      { name: "parking", type: "text", options: {} },
      { name: "garden", type: "text", options: {} },
      { name: "epc_rating", type: "text", options: {} },
      { name: "council_tax", type: "text", options: {} },
      { name: "broadband", type: "text", options: {} },
      { name: "flood_risk", type: "text", options: {} },
      { name: "notes", type: "text", options: {} },
      { name: "viewing_date", type: "text", options: {} },
      { name: "viewing_time", type: "text", options: {} },
      { name: "viewing_notes", type: "text", options: {} },
      { name: "agent_name", type: "text", options: {} },
      { name: "agent_phone", type: "text", options: {} },
      { name: "agent_email", type: "text", options: {} },
      { name: "listing_url", type: "text", options: {} },
      { name: "favorite", type: "bool", options: {} },
      { name: "archived", type: "bool", options: {} },
      { name: "rating", type: "number", options: {} },
      { name: "latitude", type: "text", options: {} },
      { name: "longitude", type: "text", options: {} },
      { name: "documents", type: "json", options: {} },
      { name: "conveyancing", type: "json", options: {} },
      { name: "offers", type: "json", options: {} },
      { name: "photos", type: "json", options: {} },
      { name: "price_history", type: "json", options: {} },
      { name: "commute_times", type: "json", options: {} },
      { name: "legacy_id", type: "text", options: {} },
      { name: "date_added", type: "text", options: {} },
    ],
    indexes: [
      "CREATE INDEX idx_properties_owner ON properties (owner)",
      "CREATE INDEX idx_properties_address ON properties (address)",
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");
  app.delete(collection);
});
