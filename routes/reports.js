import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Reusable SELECT fields with camelCase aliases
const REPORT_FIELDS = `
  id,
  title,
  description,
  category,
  severity,
  status,
  location,
  reported_by AS "reportedBy",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

// GET all reports
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ${REPORT_FIELDS} FROM reports ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

// GET one report by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    const result = await pool.query(
      `SELECT ${REPORT_FIELDS} FROM reports WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

// POST create a new report
router.post("/", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      severity,
      location,
      reportedBy,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO reports
        (title, description, category, severity, location, reported_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${REPORT_FIELDS}`,
      [title, description, category, severity, location, reportedBy]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create report" });
  }
});

// PUT update a report
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    const {
      title,
      description,
      category,
      severity,
      status,
      location,
      reportedBy,
    } = req.body;

    const result = await pool.query(
      `UPDATE reports
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           severity = COALESCE($4, severity),
           status = COALESCE($5, status),
           location = COALESCE($6, location),
           reported_by = COALESCE($7, reported_by),
           updated_at = NOW()
       WHERE id = $8
       RETURNING ${REPORT_FIELDS}`,
      [title, description, category, severity, status, location, reportedBy, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// DELETE a report
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: "Invalid report ID" });
  }

  try {
    const result = await pool.query(
      `DELETE FROM reports WHERE id = $1 RETURNING ${REPORT_FIELDS}`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ message: "Report deleted", report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

export default router;