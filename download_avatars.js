var request = require('request');

console.log('Welcome to Github Avatar Downloader!');

function getRepoContributors(repoOwner, repoName, cb) {
}

getRepoContributors('jquery', 'jquery', function(err, result) {
  console.log("Errors:", err);
  console.log("Result:", result);
});