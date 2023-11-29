const FileSystem = require("fs");
var query = `
query($search: String){
  Media(search: $search) {
    title {
      romaji
      english
      native
    }
    averageScore
    
    reviews {
      edges {
        node {
          score
          body
        }
      }
    }
  }
}
`;


// Define our query variables and values that will be used in the query request
var variables = {
    search: 'Lucky☆Star'
};

// Define the config we'll need for our Api request
var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };

// Make the HTTP Api request
fetch(url, options).then(handleResponse)
                   .then(handleData)
                   .then(handleError);

 function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
  //If average score is null, Media was not found, so notify user and return
    if (data.data.Media.averageScore == null) {
        console.log("Series not found.");
        return;
    }
    //If Media was found, get overall review data (avg score, # of reviews, and titles) and save as data.json
    const reviewData = {
      averageScore: data.data.Media.averageScore,
      reviewCount: data.data.Media.reviews.edges.length,
      title: data.data.Media.title
    };
   FileSystem.writeFile('./reviews/data.json', JSON.stringify(reviewData), (error) => {
    if (error) throw error;
   });
   //Saving reviews w/ score and body of text as reviews.json
   FileSystem.writeFile('./reviews/reviews.json', JSON.stringify(data.data.Media.reviews.edges), (error) => {
    if (error) throw error;
   })
  }

function handleError(error) {
    if (error) {
    throw error;
    }
}