//Add all required modules
var request = require('request');
var fs = require('fs');

//Store command line arguments
var owner = process.argv[2];
var repo = process.argv[3];

console.log('Welcome to Github Avatar Downloader!');

//Configure dotenv to access .env
require('dotenv').config();
var github = {
  password: process.env.GH_TOKEN
}

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization': "token" + github.password
    }
  };

  request(options, function(err, res, body) {
    //Get repo contributors and parse JSON string to object
    var result = JSON.parse(body);
    //Pass result into callback function
    cb(err, result);
  });
}

//Retrieve image from URL and save it to file path on disk
function downloadImageByURL(url, filePath) {
  request.get(url)
    .on('error', function(err) {
      throw err;
    })
    .pipe(fs.createWriteStream(filePath));
}

//Call getRepoContributors
getRepoContributors(owner, repo, function(err, result) {
  //If repo owner and name are not specified, throw error
  if (owner === undefined || repo === undefined) {
    console.log("Please input repo owner and name!");
    throw err;
  } else {
    //Iterate through repo contributors and store avatar_url
    result.forEach(function(element, index) {
      var url = element['avatar_url'];
      //Save avatars to "avatars" folder in current directory
      //Store image as "login".jpg
      var filePath = "avatars/" + element['login'] + ".jpg";
      downloadImageByURL(url, filePath);
    });
    console.log("Errors:", err);
    console.log("Avatars downloaded!")
  }
});