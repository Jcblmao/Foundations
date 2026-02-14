/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    name: "user_settings",
    type: "base",
    system: false,
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "@request.auth.id != ''",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
    fields: [
      { name: "owner", type: "relation", required: true, collectionId: "_pb_users_auth_", maxSelect: 1 },
      { name: "dark_mode", type: "bool", options: {} },
      { name: "form_sections", type: "json", options: {} },
      { name: "professional_contacts", type: "json", options: {} },
      { name: "commute_destinations", type: "json", options: {} },
    ],
    indexes: [
      "CREATE UNIQUE INDEX idx_user_settings_owner ON user_settings (owner)",
    ],
  });

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("user_settings");
  app.delete(collection);
});
