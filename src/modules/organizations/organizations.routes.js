const express = require("express");
const {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} = require("./organizations.controller");

const router = express.Router();

router.post("/", createOrganization);
router.get("/", getOrganizations);
router.get("/:id", getOrganization);
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);

module.exports = router;
