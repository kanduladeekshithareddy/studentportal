const mysql = require("mysql");
const express = require ("express");
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const bodyparser =require("body-parser");
const encoder =bodyparser.urlencoded();

const app = express();
app.set('view engine', 'ejs');
var username;
app.use(bodyparser.json());
var password;
var roll;
var recipient;
var examid;
var uid;
app.use('/assets',express.static('assets'));
var key;
const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"20072004",
    database:"minipro"
});
//connect to the database

connection.connect(function(error){
    if (error) throw error
    else console.log("connected to server database successfully")
});

app.get("/",function(req,res){
    res.sendFile(__dirname+'/home.html');
})
app.post("/",encoder,function(req,res){
     username =req.body.username;
     console.log(username);
     password=req.body.pass;
    connection.query("select * from login where username = ? and pass = ?",[username,password],function(error,results,fields){
        if(results.length >0){
            res.redirect('/welcome');
        }
        else{
            res.redirect('/');

            console.log("do not happen");
        }
        res.end();
    })
})
app.get('/welcome', (req, res) => {
    var uname=username;
    // console.log(uname);
    const query = "SELECT *FROM login u INNER JOIN profile p ON u.userid = p.userid inner JOIN branch b ON p.bid = b.bid where u.username=?";
    connection.query(query,[uname] ,(err, results) => {
      if (err) throw err;
      key = results[0].bid;
      roll=results[0].rollnumber;
      res.render('welcome.ejs', { data: results });
      // console.log(key);
    });
  });

app.get('/acedemics', function(req, res) {
    const sql = 'SELECT * FROM courses where bid=?';
    var year=key;
    connection.query(sql,[year], function(err, rows, fields) {
      if (err) throw err;
      mentid=rows[0].mentorid;
      res.render('academics.ejs', { datas :rows });
    });
  });
  app.get('/academics/mentor',function(req,res){
    const sql='select * from mentor m inner join courses c on m.mentorid=c.mentorid where bid=?';
    connection.query(sql,[key],function(err,result){
      if (err) throw err;
      res.render('mentor.ejs',{item :result});
    })
  })
  app.post('/academics/mentor',encoder,function(req,res){
     var un=username;
     var pw=password;
     recipient =req.body.email;
     texts=req.body.query;
     console.log(un+" bellow");
     console.log(pw);
     console.log(recipient);
     console.log(texts);
      let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: un,
        pass: pw
      },
      tls: {
        minVersion: 'TLSv1.2'
      }
    });
    transporter.verify(function (error, success) {
      if (error) {
        console.log("in here"+error);
      } else {
        //res.redirect('/emailsent');
        console.log("Server is ready to take our messages");
      }
    });
    var mailOptions = {
      from:username,
      to:recipient,
      subject: 'Sending Email using Node.js[nodemailer]',
      text: texts
    };
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
          console.log("hello" +error);
      } else {
          console.log('Email sent: ' + info.response);
          res.sendFile(__dirname+'/mailcon.html');
      }
    });
  })
  app.get('/academics/attendance',function(req,res){
    const sql='select * from attendance where rollnumber=?';
    connection.query(sql,[roll],function(err,result){
      if (err) throw err;
      res.render('attend.ejs',{items :result});
    })
  })
  app.get('/academics/timetable',function(req,res){
    const sql='select * from timetable where bid=?';
    connection.query(sql,[key],function(err,resu){
      if (err) throw err;
      res.render('timetable.ejs',{itemstt :resu});
    })
  })
  app.get("/academics/bonafide",function(req,res){
      res.render('bonafide.ejs');
      
   })
  app.post('/academics/bonafide',encoder,function(req,res){
    const bonreq=req.body.bon;
    console.log(bonreq);
    let transporter1 = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: username,
        pass: password
      },
      tls: {
        minVersion: 'TLSv1.2'
      }
    });
    transporter1.verify(function (error, success) {
      if (error) {
        console.log("in here"+error);
      } else {
        //res.redirect('/emailsent');
        console.log("Server is ready to take our messages");
      }
    });
    var mailOptions = {
      from:username,
      to:'admissions@nitandhra.ac.in',
      subject: 'Sending Email using Node.js[nodemailer]',
      text: bonreq
    };
    transporter1.sendMail(mailOptions, function(error, info) {
      if (error) {
          console.log("hello" +error);
      } else {
          console.log('Email sent: ' + info.response);
          res.sendFile(__dirname+'/mailcon.html');
      }
    });
  })
  app.get('/examsection', function(req, res) {
    const sql = 'SELECT * FROM exam e inner join examvenue ev on e.eid=ev.eid where bid=? and rollnumber=?';
    var year=key;
    connection.query(sql,[year,roll], function(err, rows, fields) {
      if (err) throw err;
      examid=rows[0].eid;
      console.log(examid);
      res.render('exam.ejs', { edata :rows });
    });
  });
  app.get('/examsection/results', function(req, res) {
    const sql = 'SELECT * FROM results where eid=? and rollno=?';
    connection.query(sql,[examid,roll], function(err, rows, fields) {
      if (err) throw err;
      res.render('examres.ejs', { erdata :rows });
    });
  });
  app.get('/examsection/hallticket', function(req, res) {
    const sql = 'select * from courses where bid=?';
    const sql1='select * from profile where rollnumber=?'
    connection.query(sql,[key], function(err, row, fields) {
      connection.query(sql1,[roll], function(err, rows, fields) {
        if (err) throw err;
        res.render('hallticket.ejs', { ehdata :rows,edata :row });
      });
      // if (err) throw err;
      // res.render('hallticket.ejs', { ehdata :rows });
    });
  });
  app.get ('/feesection',function(req,res){
    res.sendFile(__dirname+'/fee.html');
  })
  
// set app port 
app.listen(4500);
