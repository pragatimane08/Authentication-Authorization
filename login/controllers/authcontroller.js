const jwt = require('jsonwebtoken');
const bcrypt =require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

//defining schema
const userSchema = new mongoose.Schema({
    username: {type: String,required: true, unique: true},
    password: {type: String,required: true}
});

//user model
const user = mongoose.model('User',userSchema);

//function to register a new user
const register = async(req,res) =>{
    const {username, password} = req.body;
    console.log(username, password);

    try{
        const existingUser = await User.findOne({username});
        if(existingUser){
            return res.status(400).send('User already exist');
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const newUser = new User({username, password: hashedPassword});
        await newUser.save();

        res.status(201).send('User registred successfully');
    }catch (err){
        res.status(500).send(err.message);
    }
};

//function to log in a user
const login = async(res,req) =>{
    const {username,password} = req.body;
    try{
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).send('Invalid credentials');
        }

        const validPassoword = await bcrypt.compare(password, user.password);
        if(!validPassoword){
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({userId: user._id},process.env.JWT_SECRET,{expireIn:'1h'});
        res.json({token});
    }catch(err){
        res.status(500).send(err.message);
    }
};

//exort function
module.exports = { register, login};

//connect to mongoDB
mongoose.connect(process.env.DB_URI,{
    userNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('connected to MongoDB'))
.catch(err => console.error('Failed to connect ',err));