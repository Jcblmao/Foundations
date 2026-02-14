/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("properties");

  // Add all fields that the frontend uses but were missing from the schema
  const newFields = [
    new TextField({ name: "tenure" }),
    new TextField({ name: "sqft" }),
    new TextField({ name: "pros" }),
    new TextField({ name: "cons" }),
    new BoolField({ name: "first_time_buyer" }),
    new TextField({ name: "subsidence_risk" }),
    new TextField({ name: "japanese_knotweed" }),
    new TextField({ name: "nearby_planning" }),
    new TextField({ name: "mobile_signal" }),
    new TextField({ name: "build_year" }),
    new TextField({ name: "construction_type" }),
    new TextField({ name: "chain_length" }),
    new TextField({ name: "seller_situation" }),
    new TextField({ name: "survey_level" }),
    new TextField({ name: "survey_date" }),
    new TextField({ name: "survey_findings" }),
  ];

  for (const field of newFields) {
    collection.fields.add(field);
  }

  app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("properties");

  const fieldsToRemove = [
    "tenure", "sqft", "pros", "cons", "first_time_buyer",
    "subsidence_risk", "japanese_knotweed", "nearby_planning",
    "mobile_signal", "build_year", "construction_type",
    "chain_length", "seller_situation", "survey_level",
    "survey_date", "survey_findings",
  ];

  for (const name of fieldsToRemove) {
    collection.fields.removeByName(name);
  }

  app.save(collection);
});
