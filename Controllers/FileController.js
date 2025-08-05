const { supabase } = require("../Config/Db");
const multer = require("multer");
const FileModel = require("../Models/FileModel");
const { Readable } = require("stream");

//File Store Controller....
const fileStoreController = async (req, res) => {
  try {
    const file = req.file;

    // check file is getting or not..
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    // check file size..
    if (file.size >= 50 * 1024 * 1024) {
      return res
        .status(413)
        .json({ success: false, message: "File too large. Max size is 50MB." });
    }

    //create file path...
    const filePath = `uploads/${Date.now()}-${file.originalname}`;

    // file attributes...
     const { originalname, mimetype, buffer, size, encoding } = file;

    // handle supabase storage bucket..
    const { data, error } = await supabase.storage
      .from("croma")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    // Generate access code and store file metadata in MongoDB
    const accessCode = Math.floor(1000 + Math.random() * 9000);

    console.log("data return:",data);
    

    // store file details in atlas...
    const newFile = new FileModel({
      accessCode: accessCode,
      filename: originalname,
      contentType: mimetype,
      encoding: encoding,
      mimeType: mimetype,
      fileSize: size,
      bucketName: "croma",
      path: data.path,
    });

    // save data in mongo...
    await newFile.save();

    // handle error while upload...
    if (error) {
      console.error("Supabase Upload Error:", error.message || error);
      return res.status(500).json({
        success: false,
        message: "Supabase error during upload.",
        error,
      });
    }

    // handle successfull response...
    res.status(200).json({
      success: true,
      message: "File uploaded successfully.",
      data: accessCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error uploading file." });
  }
};

//File retireve Controller...
// const fileRetreiveController = async (req, res) => {
//   try {
//     const { code } = req.body;
//     console.log("code :",code);
    

//     // check code is getting or not?
//     if (!code) {
//       return res.status(400).json({ success: false, message: "Access code is required." });
//     }
    
//     // Check file is present or not in database...
//     const fileDoc = await FileModel.findOne({ accessCode: code });
//     if (!fileDoc) {
//       return res.status(404).json({ success: false, message: "File not found with this code." });
//     }

//     // Get public URL from Supabase
//     const { data, error } = await supabase.storage
//       .from("croma")
//       .getPublicUrl(fileDoc.path);

//     // check for errors..
//     if (error) {
//       return res.status(500).json({ success: false, message: "Error getting file URL." });
//     }

//     // // Delete file from Supabase
//     // await supabase.storage.from("croma").remove([fileDoc.path]);

//     // // Delete document from MongoDB
//     // await FileModel.deleteOne({ _id: fileDoc._id });

//     res.status(200).json({
//       success: true,
//       message: "File ready to download. It will be deleted after this.",
//       fileUrl: data.publicUrl,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Error retrieving file." });
//   }
// };

const fileRetreiveController = async (req, res) => {
  try {
    const { code } = req.body;
    console.log("Received code:", code);

    if (!code) {
      return res.status(400).json({ success: false, message: "Access code is required." });
    }

    const fileDoc = await FileModel.findOne({ accessCode: code });
    if (!fileDoc) {
      return res.status(404).json({ success: false, message: "File not found with this code." });
    }

    const filePath = fileDoc.path;
    const fileName = fileDoc.filename;
    const mimeType = fileDoc.contentType || "application/octet-stream";

    const { data: fileBuffer, error } = await supabase.storage
      .from("croma")
      .download(filePath);

    if (error || !fileBuffer) {
      return res.status(404).json({ success: false, message: "File not found in storage." });
    }

    const arrayBuffer = await fileBuffer.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const stream = Readable.from(buffer);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Cleanup logic after response is fully sent
    res.on("finish", async () => {
      try {
        // 1. Delete from Supabase
        await supabase.storage.from("croma").remove([filePath]);

        // 2. Delete from MongoDB
        await FileModel.deleteOne({ _id: fileDoc._id });

        console.log(`File ${fileName} deleted after successful download.`);
      } catch (cleanupErr) {
        console.error("Error during file cleanup:", cleanupErr);
      }
    });

    stream.pipe(res);

  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ success: false, message: "Error retrieving file." });
  }
};



module.exports = { fileStoreController, fileRetreiveController };
