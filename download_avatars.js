var request = require('request');
var secrets = require('./secrets');

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

getRepoContributors('jquery', 'jquery', function(err, result) {
  var output = "";
  result.forEach(function(element, index) {
    output += element['avatar_url'];
    if (index !== result.length - 1) {
      output += "\n";
    }
  })
  console.log("Errors:", err);
  console.log("Result:", output);
});