const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./models/User");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {
    res.send("AI Fitness Coach Backend is Running!");
});


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        message: "Backend is working correctly"
    });

});


// ==========================================
// SIGNUP
// ==========================================

app.post("/api/signup", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        // Check required fields

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }


        // ==========================================
        // PASSWORD LENGTH VALIDATION
        // ==========================================

        if (password.length < 8 || password.length > 20) {

            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 20 characters"
            });

        }


        // Check existing user

        const existingUser =
            await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });

        }


        // Create user

        const user = new User({
            name,
            email,
            password
        });

        await user.save();


        // Success response

        res.status(201).json({
            success: true,
            message: "Account created successfully"
        });

    } catch (error) {

        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});


// ==========================================
// LOGIN
// ==========================================

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });

        }

        const user =
            await User.findOne({ email });

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.status(200).json({

            success: true,

            message: "Login successful",

            token: token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },

            progress: user.progress || {
                workoutsCompleted: 0,
                weeklyGoal: 0,
                percentage: 0
            }

        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});


// ==========================================
// SAVE PROGRESS FUNCTION
// ==========================================

async function saveProgress(req, res) {

    try {

        const {
            userId,
            workoutsCompleted,
            weeklyGoal
        } = req.body;

        console.log("Progress request:", req.body);


        // Check user ID

        if (!userId) {

            return res.status(400).json({

                success: false,

                message: "User ID is required"

            });

        }


        // Check values

        const completed =
            Number(workoutsCompleted);

        const goal =
            Number(weeklyGoal);


        if (
            completed < 0 ||
            goal <= 0 ||
            isNaN(completed) ||
            isNaN(goal)
        ) {

            return res.status(400).json({

                success: false,

                message: "Please enter valid progress values"

            });

        }


        // Calculate percentage

        const percentage =
            Math.min(
                Math.round(
                    (completed / goal) * 100
                ),
                100
            );


        // Find user

        const user =
            await User.findById(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // Save progress

        user.progress = {

            workoutsCompleted:
                completed,

            weeklyGoal:
                goal,

            percentage:
                percentage

        };


        await user.save();


        // Send response

        res.status(200).json({

            success: true,

            message:
                "Progress saved successfully",

            progress: {

                workoutsCompleted:
                    completed,

                weeklyGoal:
                    goal,

                percentage:
                    percentage

            }

        });


    } catch (error) {

        console.error(
            "Progress save error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

}


// ==========================================
// SAVE PROGRESS
// Supports BOTH POST and PUT
// ==========================================

app.post(
    "/api/progress",
    saveProgress
);

app.put(
    "/api/progress",
    saveProgress
);


// ==========================================
// GET PROGRESS
// ==========================================

app.get(
    "/api/progress/:userId",
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message: "User not found"

                });

            }


            res.status(200).json({

                success: true,

                progress:
                    user.progress || {

                        workoutsCompleted: 0,

                        weeklyGoal: 0,

                        percentage: 0

                    }

            });


        } catch (error) {

            console.error(
                "Progress fetch error:",
                error
            );

            res.status(500).json({

                success: false,

                message: "Server error"

            });

        }

    }
);


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)

    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );

        console.log(
            "Connected DB:",
            mongoose.connection.name
        );


        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running at http://localhost:${PORT}`
                );

            }
        );

    })

    .catch((error) => {

        console.error(
            "MongoDB connection failed:"
        );

        console.error(
            error.message
        );

    });