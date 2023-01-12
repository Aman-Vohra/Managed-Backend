const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema(
    {
        email: { type: String, unique: true },
        password: String,
    },
    {
        collection: "UserInfo"
    }
);

mongoose.model("UserInfo", UserDetailsSchema);