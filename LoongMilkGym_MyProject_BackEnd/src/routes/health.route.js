const express = require("express");
const router = express.Router();
const { httpCodes } = require("@/config/constants");

router.get("/", (req, res) => {
  res.success(
    {
      status: "ok",
      service: "gymlife-api",
    },
    httpCodes.success,
    "Health check successfully",
  );
});
module.exports = router;
