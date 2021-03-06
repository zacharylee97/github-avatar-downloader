//Add all required modules
var request = require('request');
var fs = require('fs');

//Store command line arguments
var owner = process.argv[2];
var repo = process.argv[3];

//Configure dotenv to access .env
const result = require('dotenv').config();
if (result.error) {                                 //if .env does not exist, throw error
  console.log(result.error);
  process.exit();
} else if (process.env.GH_TOKEN === undefined) {    //if GH_TOKEN does not exist in .env, throw error
  console.log("Please provide token!");
  process.exit();
} else {
  var github = {
    password: process.env.GH_TOKEN
  }
}

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors',
    headers: {
      'User-Agent': 'request',
      'Authorization': 'token' + github.password
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
function downloadImageByURL(url, filePath, fileName) {
  //If "avatars" folder does not exist, throw error
  if (!fs.existsSync(filePath)) {
    console.log('Please create file called "avatars"!');
    process.exit();
  } else {
    request.get(url)
      .on('error', function(err) {
        throw err;
      })
      .pipe(fs.createWriteStream(fileName));
  }
}

function checkInput(input) {
  if (input.length !== 4) {
    return false;
  } else {
    return true;
  }
}

//Call getRepoContributors
getRepoContributors(owner, repo, function(err, result) {
  //Check input for owner and repo
  if (!checkInput(process.argv)) {
    console.log("Please input repo owner and name!");
    process.exit();
  } else {
    console.log('Welcome to Github Avatar Downloader!');
    //Iterate through repo contributors and store avatar_url
    result.forEach(function(element, index) {
      var url = element['avatar_url'];
      //Save avatars to "avatars" folder in current directory
      //Store image as "login".jpg
      var filePath = "avatars/"
      var fileName = "avatars/" + element['login'] + ".jpg";
      downloadImageByURL(url, filePath, fileName);
    });
    console.log("Errors:", err);
    console.log("Avatars downloaded!")
  }
});