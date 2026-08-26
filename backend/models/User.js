const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({

    // ==========================================
    // USER DETAILS
    // ==========================================

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },


    // ==========================================
    // FITNESS PROGRESS
    // ==========================================

    progress: {

        workoutsCompleted: {
            type: Number,
            default: 0
        },

        weeklyGoal: {
            type: Number,
            default: 0
        },

        percentage: {
            type: Number,
            default: 0
        }

    }

});


// ==========================================
// PASSWORD HASHING
// ==========================================

userSchema.pre("save", async function () {

    if (!this.isModified("password")) {
        return;
    }

    const salt =
        await bcrypt.genSalt(10);

    this.password =
        await bcrypt.hash(
            this.password,
            salt
        );

});


// ==========================================
// EXPORT USER MODEL
// ==========================================

module.exports =
    mongoose.model("User", userSchema);