"use strict";

const db = require("./db)");

function checkIfNotFound(req, res, next) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code
      FROM companies
        WHERE code = $1`,
        [code]);

  console.log(results);
}