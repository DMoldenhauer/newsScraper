
//DEPENDENCIES
//Load npm packages

var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var logger = require("morgan");
var request = require("request");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Sets up Express app
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//handle data parsing
//  parse application/x-www-form-urlencoded
app.use(bodyParser.json());

// Set Handlebars.
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
// app.set('view options', { layout: "saved" });

// require("./controllers/html-routes.js")(app);

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/newsScraper");

// var db = mongoose.connection;

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// // Connect to the Mongo DB
// mongoose.Promise = Promise;
// mongoose.connect(MONGODB_URI);


// Routes

app.get("/", function (req, res) {

  db.Article.find({

  }).then(function (data) {
    var hbsObjext = {
      articles: data
    };
    res.render('index', hbsObjext);
  });
});

app.put("/articles/:id", function (req, res) {
  db.Article.findOneAndUpdate({
    _id: req.params.id
  },

    {
      $set: { isSaved: true },

      // function(err,doc) {
      //   if (err) { throw err; }
      //   else { console.log("Updated isSaved to true"); }
      // );


    }).then(function (data) {
      var hbsObjext = {
        articles: data
      };
      res.render('saved', hbsObjext);
    });
});

app.delete("/articles/:id", function (req, res) {
  db.Article.remove({ _id: req.params.id }



      // function(err,doc) {
      //   if (err) { throw err; }
      //   else { console.log("Updated isSaved to true"); }
      // );


    ).then(function (data) {
    var hbsObjext = {
      articles: data
    };
    res.render('saved', hbsObjext);
  });
});


app.get("/saved", function (req, res) {
  db.Article.find({

  }).then(function (data) {
    var hbsObjext = {
      articles: data
    };
    res.render('saved', hbsObjext);
  });
});



// A GET route for scraping the NYT website
app.get("/scrape", function (req, res) {
  // First, we grab the body of the html with request
  axios.get("https://www.nytimes.com/").then(function (response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);


    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function (i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("h2").text();
      result.summary = $(this).children(".summary").text();
      result.link = $(this).children("h2").children("a").attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function (dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

app.listen(PORT, function () {
  console.log("App listening on PORT " + PORT);
});
