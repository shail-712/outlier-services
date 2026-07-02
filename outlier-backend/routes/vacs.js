const express = require('express');
const router = express.Router();
const { getVACs } = require('../controllers/vacController');

router.get('/', getVACs);

module.exports = router;
