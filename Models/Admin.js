const mongoose = require("mongoose");

//Configure admin schema...
const adminSchema = new mongoose.Schema({
    adminId: {
        type: String,
        required: false
    },
    adminName: {
        type: String,
        required: false
    },
    adminPassword: {
        type: String,
        required: false
    },
    adminGender: {
        type: String,
        required: false
    },
    adminNumber: {
        type: String,
        required: false
    },
    Teachers: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }
    ],
    Students: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
    ],
    DateOfCreation: {
        type: String,
        default: () => {
            const currentDate = new Date();
            const day = currentDate.getDate().toString().padStart(2, '0');
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const year = currentDate.getFullYear();
            return `${day}/${month}/${year}`;
        }
    },
});



const adminModel = mongoose.model("Admin", adminSchema);


module.exports = adminModel;