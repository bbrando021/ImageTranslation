var express = require('express')
var app = express();
var path = require('path');
var fs = require('fs');
var watson = require('watson-developer-cloud');
var multer = require('multer');
var upload = multer();
var visual_recognition = watson.visual_recognition({
  api_key: '85bf3743ee85a6a7d7afb9fff14ab09398778170',
  version: 'v3',
  version_date: '2016-05-20'
});
var language_translator = watson.language_translator({
  url: 'https://gateway.watsonplatform.net/language-translator/api',
  username: "e9577394-980d-47c5-a1da-933302d637c3",
  password: "zoDvJFX34yj4",
  version: 'v2'
});
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: false
}));

var high = [0, 0, 0];
var highName = ["", "", ""];
var trans = ['', '', ''];

app.use(bodyParser.json());
app.use(express.static('resources'));


//GET//
app.get('/', function(req, res) {
  /* Sends the index html page to the user */
  fs.readFile('ImageAnalyzer.html', 'utf8', function(err, data) {
    if (!err) res.send(data);
    else return console.log(err);
  });
});

app.get('/Logo', function(req, res) {
  /* Sends the logo file to the user */
  fs.readFile('resources/Logo.png', 'utf8', function(err, data) {
    if (!err) res.send(data);
    else return console.log(err);
  });
});

app.get('/HowTo', function(req, res) {
  /* Sends the how to file to the user */
  fs.readFile('resources/HowTo.png', 'utf8', function(err, data) {
    if (!err) res.send(data);
    else return console.log(err);
  });
});


//New Post

app.post('/upload', upload.single('image_data'), (req, res) => {
  var formData = req.body;
  //console.log(req.file);
  res.send(200);
  var formData = req.body;
  var imagetoSave = req.file;
  var decodedImage = new Buffer(imagetoSave.buffer, 'base64').toString('binary');
  fs.writeFile(__dirname + '/image.jpg', req.file.buffer, 'base64', function(err, data) {
    if (err) {
      console.log(err);
    }
  });

});



//POST//
app.post('/image', function(req, request) {
  high = [0, 0, 0];
  highName = ['', '', ''];
  trans = ['', '', ''];
  var fromOrigLang = ['', '', ''];

  var image = req.body.link;
  var toLang = req.body.toLang;
  var fromLang = req.body.fromLang;
  //console.log(image);
  var params = {
    images_file: fs.createReadStream("./image.jpg")
  };


  //VISUAL RECOGNITION//
  visual_recognition.classify(params, function(err, res) {
    if (err)
      console.log(err);
    else {
      console.log(JSON.stringify(res, null, 2))
      for (var i = 0; i < res.images[0].classifiers[0].classes.length; i++) {

        var score = parseFloat(res.images[0].classifiers[0].classes[i].score);
        var name = res.images[0].classifiers[0].classes[i].class;

        if (score > high[0] && !name.includes("color")) {
          high[2] = high[1];
          highName[2] = highName[1];
          high[1] = high[0];
          highName[1] = highName[0];
          high[0] = score;
          highName[0] = res.images[0].classifiers[0].classes[i].class;
        }
        else if (score > high[1] && !name.includes("color")) {
          high[2] = high[1];
          highName[2] = highName[1];
          high[1] = score;
          highName[1] = res.images[0].classifiers[0].classes[i].class;
        }
        else if (score > high[2] && !name.includes("color")) {
          high[2] = score;
          highName[2] = res.images[0].classifiers[0].classes[i].class;
        }
      }
      translate();
    }
  });

  //FOR DOUBLE TRANSLATION
  /*  function translateTemp(){
      
        language_translator.translate({
          text: highName,
          source: 'en',
          target: fromLang
          },
        
        function(err, translation) {
          if (err)
            console.log(err)
          else {
            console.log(translation.translations[0].translation);
            console.log(translation.trasnslations[1].translation);
            //console.log(translation.translations[2].translation);
            if(typeof translation.translations[0] !== 'undefined')
              fromOrigLang[0] = translation.translations[0].translation
            if(typeof translation.translations[1] !== 'undefined')
              fromOrigLang[1] = translation.translations[1].translation
            if(typeof translation.translations[2] !== 'undefined')
              fromOrigLang[2] = translation.translations[2].translation
          }
        });
      
      
    }*/

  //LANGUAGE TRANSLATOR//
  function translate() {
    console.log(highName)
    console.log(toLang)
    if (toLang != "English") {
      language_translator.translate({
          text: highName,
          source: "English",
          target: toLang
        },
        function(err, translation) {
          if (err)
            console.log(err)
          else {
            if (typeof translation.translations[0] !== 'undefined')
              trans[0] = translation.translations[0].translation;
            if (typeof translation.translations[1] !== 'undefined')
              trans[1] = translation.translations[1].translation;
            if (typeof translation.translations[2] !== 'undefined')
              trans[2] = translation.translations[2].translation;

            request.send({
              translations: {
                from: highName,
                to: trans
              }
            });
          }
        });
    }
    else {
      trans = highName;
      request.send({
        translations: {
          from: highName,
          to: trans
        }
      });
    }
  }
});

var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  if (process.env.PORT) {
    console.log("https://netcentric-bbrando0211.c9users.io/");
  }
  else {
    console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  }
});
