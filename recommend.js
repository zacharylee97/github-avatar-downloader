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

//Check that owner and repo are provided as command line arguments
function checkInput(input) {
  if (input.length !== 4) {
    return false;
  } else {
    return true;
  }
}

//Get contributors for specific repo
function getRepoContributors(repoOwner, repoName, cb) {
  var options = {
    url: 'https://api.github.com/repos/' + repoOwner + '/' + repoName + '/contributors',
    headers: {
      'User-Agent': 'request',
      'Authorization': 'token ' + github.password
    }
  };
  request(options, function(err, res, body) {
    //Get repo contributors and parse JSON string to object
    var result = JSON.parse(body);
    //Pass result into callback function
    cb(err, result);
  });
}


function getStarredURLs(result) {
  //Save starred_url to output array
  var output = [];
  result.forEach(function(element) {
    var url = element['starred_url'];
    url = url.replace("{/owner}", "");
    url = url.replace("{/repo}", "");
    output.push(url);
  });
  return output;
}

//Get starred_url from each contributor to repo
function getStarredRepos(arr) {
  var counter = 0;
  var starredRepos = [];
  arr.forEach(function(element) {
    var starOptions = {
      url: element,
      headers: {
        'User-Agent': 'request',
        'Authorization': 'token ' + github.password
      }
    };
    request(starOptions, function(err, res, body) {
      //Get starred repos from user and parse JSON string to object
      var result = JSON.parse(body);
      var repos = [];
      //Store each starred repo of user
      result.forEach(function(element) {
        var fullName = element['full_name'];
        repos.push(fullName);
      });
      //Add user's starred repos to starredRepos array
      starredRepos.push(...repos);
      counter++;
      //When finished going through all users, pass starredRepos array into countStars
      if (counter === arr.length) {
        countStars(starredRepos);
      }
    });
  });
}

function countStars(arr) {
  var reposCount = {};
  var recs = {};
  //Go through starredRepos and count number of times repo is found
  arr.forEach(function(element) {
    if (reposCount.hasOwnProperty(element)) {
      reposCount[element] += 1;
    } else {
      reposCount[element] = 1;
    }
  });
  //Go through reposCount 5 times to determine 5 most recommended repos
  for (var i = 0; i < 5; i++) {
    var most = 0;
    var topRepo = "";
    for (repo in reposCount) {
      if (reposCount[repo] > most) {
        topRepo = repo;
        most = reposCount[repo];
      }
    }
    //Remove most recommended repo from reposCount
    delete reposCount[topRepo];
    recs[topRepo] = most;
  }
  //Pass recs to printRecs
  printRecs(recs);
}

function printRecs(recs) {
  //Print top 5 recommended repos
  var output = ""
  var counter = 1;
  for (repo in recs) {
    output += `[${recs[repo]} stars] ${repo}`;
    if (counter < 5) {
      output += "\n";
      counter++;
    }
  }
  console.log(output);
}

//Call getRepoContributors function
getRepoContributors(owner, repo, function(err, result) {
  var starredURL = getStarredURLs(result);
  getStarredRepos(starredURL);
});
