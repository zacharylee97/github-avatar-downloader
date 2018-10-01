var request = require('request');
var fs = require('fs');
var secrets = require('./secrets');

var owner = process.argv[2];
var repo = process.argv[3];

console.log('Welcome to Github Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization': secrets.GITHUB_TOKEN
    }
  };
  request(options, function(err, res, body) {
    var result = JSON.parse(body);
    cb(err, result);
  });
}

function downloadImageByURL(url, filePath) {
  request.get(url)
    .on('error', function(err) {
      throw err;
    })
    .pipe(fs.createWriteStream(filePath));
}

downloadImageByURL("https://avatars2.githubusercontent.com/u/2741?v=3&s=466", "avatars/kvirani.jpg")

getRepoContributors(owner, repo, function(err, result) {
  if (owner === undefined || repo === undefined) {
    console.log("Please input repo owner and name!");
    throw err;
  } else {
    result.forEach(function(element, index) {
      var url = element['avatar_url'];
      var filePath = "avatars/" + element['login'] + ".jpg";
      downloadImageByURL(url, filePath);
    });
    console.log("Errors:", err);
    console.log("Avatars downloaded!")
  }
});