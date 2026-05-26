const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.success(
    {
      status: "ok",
      service: "gymlife-api",
    },
    200,
    "Health check successfully",
  );
});
module.exports = router;
