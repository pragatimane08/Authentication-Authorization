const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//const { use } = require('bcrypt/promises')

const app = express();
const PORT = 3000;

//middleware
app.use(bodyParser.json());
app.use(express.static('public'));

//mongodb connection
mongoose.connect('mongodb://localhost:27017/db1')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));

//handle the / request
app.get('/', (req, res) => {
    res.send('Welcome to the API! Use /signup to create a user and /login to log in.');
});

//user scheme
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    amount: { type: Number, default: 0 }
});

//create user model
const User = mongoose.model('User', userSchema);

//signup route
app.post('/signup', async (req, res) => {
    const { username, password, amount } = req.body; // Include amount in the destructured request body

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create a new user including the amount field
        const newUser = new User({ 
            username, 
            password: hashedPassword, 
            amount: amount || 0 // Default to 0 if amount is not provided
        });

        await newUser.save();

        res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: "User already exists" });
        } else {
            res.status(500).json({ message: 'Server error' });
        }
    }
});


//login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isPassWordValid = await bcrypt.compare(password, user.password);
        if (!isPassWordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, 'secret-key', { expiresIn: '1h' });

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: 'server error' });
    }
});

// Middleware to authenticate user
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, 'secret-key', (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.userId = decoded.userId; // attach the userId to the request object
        next();
    });
};

// Delete account route
// Delete account route by username
app.delete('/delete-account', async (req, res) => {
    const { username } = req.body;

    try {
        // Find and delete the user by username
        const deletedUser = await User.findOneAndDelete({ username });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all users route
app.get('/users', async (req, res) => {
    try {
        // Fetch all users, excluding the password
        const users = await User.find({}, { password: 0 }); // { password: 0 } excludes the password field

        // Return all user details
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});