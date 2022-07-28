var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
// BANIEX
const mongodb = require("mongodb");
const nodemailer = require("nodemailer");
require('dotenv').config();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
//BANIEX
const simple_timerRouter = require("./routes/simple_timer");

// BANIEX
// create mongodbclient
const MongoClient = mongodb.MongoClient;
const client = new MongoClient(
  process.env.DB_URI
);

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
// BANIEX
app.use("/simple_timer", simple_timerRouter);


var transporter = nodemailer.createTransport({
  host: "smtp.mail.yahoo.com",
  port: 465,
  secure: true,
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});



setInterval(email_send, 30000);

//Email Setup
async function email_send() {
  let time_now = new Date().toLocaleTimeString("en-GB");
  time_now = time_now.slice(0, -3);
  console.log(time_now);




  // BANIEX TESTING VARIABLE BELOW

  // time_now = '00:55'

  // TESTING VARIABLE ABOVE

 

  let user_due_for_mails = await client
    .db("db1")
    .collection("reminder_info")
    .find({ alarm_time: time_now })
    .toArray(function (error, result) {
      if(error) throw error;
      for (elements of result){
        if(elements.alarm_time == time_now){


          const mailOptions =  {
            from: 'banjibaniex1@yahoo.com',
            to: elements.email,
            subject: `BANIEX REMINDER APP`,
            html: `<body>
                        <h3>${elements.reminder_topic}</h3>
                        <hr>
                        <br>
                        <p>${elements.reminder_content}</p>
                </body>`
          };

          transporter.sendMail(mailOptions, async function(error, info){
            if (error) {
                console.log(error);
                throw error
              } else {
                console.log('Reminder mail sent to: ' + elements.email);
      
                // save to database
                const feedback = await client.db("db1").collection("reminder_info").findOneAndDelete({
                  reminder_id: elements.reminder_id,
                  email: elements.email,
      
                })
                
                if(feedback){
                  console.log('Specific reminder deleted')
                }
                
        
              
              }
        
        
          })
          





        }
      }
      console.log(result)
    });
  // console.log(user_due_for_mails);
  // console.log('user')
  // console.log(time_now)

 

  
}

app.post("/reminder_details", async function (request, response) {
  let reminder_id = request.body.reminder_id;
  let reminder_topic = request.body.reminder_topic;
  let reminder_content = request.body.reminder_content;
  let reminder_hour = request.body.reminder_hour;
  let reminder_minute = request.body.reminder_minute;
  let reminder_median = request.body.reminder_median;
  let email = request.body.email;
  let alarm_time = request.body.alarm_time;
  let time_of_setting = request.body.time_of_setting;

  let time_today = new Date();
  let time_changed = time_today.setHours(time_today.getHours() + 5);
  let new_time_changed = time_changed.toLocaleString();
  let time_to_send = time_today.setHours(5, 5).toLocaleString();

  // console.log(time_front, time_today, time_changed, new_time_changed);

  let users = {
    email: email,
  };

  let details = {
    email,
    reminder_id,
    reminder_topic,
    reminder_content,
    alarm_time,
    time_of_setting,
  };

  const user_exists = await client
    .db("db1")
    .collection("reminder_users")
    .findOne({ email: email });

  console.log(user_exists);

  if (user_exists == null) {
    try {
      const feedback_user = await client
        .db("db1")
        .collection("reminder_users")
        .insertOne(users);

      const feedback_reminder_info = await client
        .db("db1")
        .collection("remider_info")
        .insertOne(details);

      console.log(feedback_user);

      response.send({
        new_User: true,
        message: "User and reminder stored",
      });
    } catch (error) {
      console.log(
        "Could not store in the users collection with the following error: " +
          error
      );
    }
  } else {
    let confirm_id = await client
      .db("db1")
      .collection("reminder_info")
      .findOne({ email: email, reminder_id: reminder_id });
    if (confirm_id) {
      response.send({
        new_User: false,
        message: "Previous user but this message ID has been used",
      });
    }
    if (confirm_id == null) {
      const feedback = await client
        .db("db1")
        .collection("reminder_info")
        .insertOne(details);

      if (feedback) {
        console.log("Successfully stored info");
      }

      response.send({
        new_User: false,
        message: "Reminder info succesfully stored",
      });
    }
  }

  // console.log(email);
  // console.table(request.body)
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
