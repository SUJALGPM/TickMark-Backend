const mongoose = require("mongoose");
const { createClient } = require('@supabase/supabase-js');

// Load environment variables before accessing them
const dotenv = require('dotenv');
dotenv.config(); 

//Configure database connection with mongodb atlas...
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`SmartShare Successfully Connected to Mongodb Atlas Database...`.bgGreen.white);
    } catch (err) {
        console.log(`Mongo server ${err}`.bgRed.white);
        console.log(`SmartShare Failed to connect to Database...`.bgRed.white);

    }
}

//Configure database connection with supabase ...
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

if(supabase){
    console.log(`SmartShare Successfully Connected to Supabase Database...`.bgMagenta.white);
}else{
    console.log(`SmartShare not Connected to Supabase Database...`.bgRed.white);
}

module.exports = {connectDB,supabase};

