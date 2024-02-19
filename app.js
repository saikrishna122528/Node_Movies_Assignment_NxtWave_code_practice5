const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

app.use(express.json());

let db = null;

const initializeDataBaseServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is Running On Port 3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error}`);
    process.exit(1);
  }
};

initializeDataBaseServer();

//To get list of all movie names in the movie table

app.get("/movies/", async (request, response) => {
  const getWholeDataQuery = `SELECT movie_name AS 
  movieName 
    FROM movie;`;
  const resultData = await db.all(getWholeDataQuery);
  response.send(resultData);
});

//To create a new movie in the movie table

app.post("/movies/", async (request, response) => {
  const inputData = request.body;
  const { directorId, movieName, leadActor } = inputData;
  const addNewMovieQuery = `INSERT INTO 
    movie(director_id,movie_name,lead_actor) 
    VALUES (${directorId},'${movieName}'
    ,'${leadActor}');`;
  await db.run(addNewMovieQuery);
  response.send("Movie Successfully Added");
});

//To return a movie based on the movie ID

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const toGetAMovieQuery = `SELECT movie_id AS movieId,
  director_id AS directorId,movie_name AS movieName,
  lead_actor AS leadActor 
  FROM movie WHERE movie_id=${movieId};`;
  const result = await db.get(toGetAMovieQuery);
  response.send(result);
});

//To updates the details of a movie in the
//movie table based on the movie ID
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const gottenData = request.body;
  const { directorId, movieName, leadActor } = gottenData;
  const toUpdateAMovieDataQuery = `UPDATE movie 
    SET director_id=${directorId},
    movie_name='${movieName}',lead_actor='${leadActor}' 
    WHERE movie_id=${movieId};`;
  await db.run(toUpdateAMovieDataQuery);
  response.send("Movie Details Updated");
});

//To deletes a movie from the movie table based on the movie ID

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const toDeleteAMovieQuery = `DELETE FROM movie 
   WHERE movie_id=${movieId};`;
  await db.run(toDeleteAMovieQuery);
  response.send("Movie Removed");
});

//To return a list of all directors in the
//director table
app.get("/directors/", async (request, response) => {
  const toGetAllDirectorsData = `SELECT 
  director_id AS directorId,
  director_name AS directorName
   FROM director;`;
  const responseData = await db.all(toGetAllDirectorsData);
  response.send(responseData);
});

//To get a list of all movie names
//directed by a specific director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const toGetMoviesOfADirector = `SELECT movie_name 
  AS movieName FROM 
    director NATURAL JOIN movie 
    WHERE director_id=${directorId};`;
  const responseData = await db.all(toGetMoviesOfADirector);
  response.send(responseData);
});

module.exports = app;
