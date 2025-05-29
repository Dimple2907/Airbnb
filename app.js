if(process.env.NODE_ENV !== "production"){  ///
    require('dotenv').config();
}


const express = require('express');
const app = express();
const mongoose = require('mongoose');
const ejs = require('ejs');
const path = require('path');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session');
const MongoStore = require('connect-mongo'); 
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const { generalLimiter } = require('./middleware/rateLimiter.js');

const listingsRouter = require('./routes/listing.js');
const reviewsRouter = require("./routes/review.js");
const userRouter = require('./routes/user.js');


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Apply general rate limiting to all routes
app.use(generalLimiter);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.engine('ejs',engine);  

const dbUrl = process.env.ATLASDB_URL || "mongodb://localhost:27017/wanderlust";

async function connectToDatabase() {
    try {
        await mongoose.connect(dbUrl);
        console.log("✅ Connected to MongoDB successfully");
        return true;
    } catch (err) {
        console.log("❌ Error connecting to MongoDB:", err.message);
        console.log("💡 Please install MongoDB or use MongoDB Atlas");
        console.log("📖 See MONGODB_ATLAS_SETUP.md for cloud setup instructions");
        return false;
    }
}

// Initialize database connection
connectToDatabase();

let store;
try {
    store = MongoStore.create({
        mongoUrl: dbUrl,
        crypto: {
            secret: process.env.SECRET || "fallbacksecretkey",
        },
        touchAfter: 24 * 3600, // time period in seconds after which the session will be updated
        connectTimeout: 10000, // 10 seconds timeout
        serverSelectionTimeoutMS: 10000 // 10 seconds timeout
    });

    store.on("error", (e) => {
        console.log("Session Store Error", e);
        console.log("⚠️  Falling back to memory store");
    });

    console.log("✅ MongoDB session store created successfully");
} catch (err) {
    console.log("⚠️  Session store creation failed:", err.message);
    console.log("⚠️  Using memory store (sessions won't persist between restarts)");
    store = null;
}


const sessionOptions = {
    store: store || undefined, // Use memory store if MongoDB store fails
    secret: process.env.SECRET || "fallbacksecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3, // 3 day
        maxAge: 1000 * 60 * 60 * 24 * 3, // 3 day
        httpOnly: true,
    }
};





app.use(session(sessionOptions));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});


// app.get("/demo", async (req, res) => {
//     let fakeUser = new User(
//         {
//             email: "student@gmail.com",
//             username: "delta-student",
//         }
//     );
//     let  registedUser = await User.register(fakeUser, "helloword");
//     res.send(registedUser);
// });



app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);


app.all('/{*any}', (req,res,next)=>{
    next(new ExpressError(404,"Page not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message); 
});

app.listen(8080, () =>{
    console.log('Server started on port 8080');
});