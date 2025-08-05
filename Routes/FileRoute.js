const express = require('express');
const router = express.Router();
const upload = require('../Middlewares/Multer');
const { fileStoreController, fileRetreiveController } = require('../Controllers/FileController');

// Upload Route
router.post('/upload-file', upload.single('file'), fileStoreController);

// Get File Route
router.post('/get-file', fileRetreiveController);

module.exports = router;
