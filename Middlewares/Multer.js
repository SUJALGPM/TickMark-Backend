const multer = require('multer');

// Use memory storage (you can also use disk storage if needed)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
