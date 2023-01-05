"use strict";

const express = require("express");

const db = require("../db");
const { BadRequestError } = require("../expressError");

const router = express.Router();

/** Returns list of companies,
 *  like {companies: [{code, name}, ...]} */
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`);

      const companies = results.rows;

      return json({ "companies": companies });
}

/** Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found,
 * this should return a 404 status response. */
router.get("/:code", checkIfNotFound, async function(req, res, next) {
  const results = await db.query(
    `SELECT code, name, description
      FROM companies
        WHERE code = $1`,
        [code]);

      const company = results.rows[0];

      return json({ "company": company });
}
