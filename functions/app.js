const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const serverless = require("serverless-http");
const router = express.Router();
var dotenv = require('dotenv');
const corsOptions = {
  // origin: "https://managed-backend.netlify.app",
  origin: "http://localhost:8000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
  exposedHeaders: "**",
};
app.use(cors(corsOptions));

dotenv.config();

var url = process.env.MONGOLAB_URI;

var jwt_token = process.env.JWT_SECRET;



mongoose.connect(url, {
    useNewUrlParser: true,
})
.then(() => {
    console.log("Connected to Database");
})
.catch((e) => console.log(e));

require('./userDetails')



const User = mongoose.model("UserInfo")

router.get("/", (req,res) => {
  res.send("Hello");
})

router.post("/register", async (req,res) => {
    const { email, password} = req.body;
    const encryptedPassword = await bcrypt.hash(password,10);
    try{
        const oldUser = await User.findOne({email});

        if(oldUser){
           return res.send({ error: "User Exists" });
        }
        await User.create({
            email,
            password: encryptedPassword,
        });
        
        res.send({status: 'ok'});
    } catch(error){
        res.send({status: 'error'});
    }
});

router.post("/login-user", async (req, res) => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ email: user.email }, jwt_token
      , {expiresIn: 10,}
      );
      
      if (res.status(201)) {
        return res.json({ status: "ok", data: token });
      } else {
        return res.json({ error: "error" });
      }
    }
    res.json({ status: "error", error: "Invalid Password" });
  });
  
  router.post("/userData", async (req, res) => {
    const { token } = req.body;
    try {
      const user = jwt.verify(token, jwt_token, (err, res) => {
        if (err) {
          return "token expired";
        }
        return res;
      });
      console.log(user);
      if (user == "token expired") {
        return res.send({ status: "error", data: "token expired" });
      }
  
      const useremail = user.email;
      User.findOne({ email: useremail })
        .then((data) => {
          res.send({ status: "ok", data: data });
        })
        .catch((error) => {
          res.send({ status: "error", data: error });
        });
    } catch (error) {}
  });

app.listen(9000, ()=> {
    console.log("Server Started");
});

app.use("/", router);
module.exports.handler = serverless(app);