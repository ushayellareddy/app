const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const app = express();
let database = null;
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const initializeDbAndServer = async () => {
  try {
    database = await open({ filename: dbPath, driver: sqlite3.Database });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//API1

const ConvertMovieDbAPI1 = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `
    SELECT movie_name FROM movie;`;
  const moviesList = await database.all(getMoviesListQuery);
  response.send(moviesList.map((eachMovie) => ConvertMovieDbAPI1(eachMovie)));
});

//API2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const createMovieQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES (${directorId},'${movieName}','${leadActor}');`;
  const createMovie = await database.run(createMovieQuery);
  response.send(`Movie Successfully Added`);
});

//API3

const ConvertMovieDbAPI3 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieDetails = await database.get(getMovieDetailsQuery);
  response.send(ConvertMovieDbAPI3(movieDetails));
});

//API4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE movie SET director_id = ${directorId},
    movie_name = '${movieName}',lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};`;
  const updateMovie = await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API5

app.delete("movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId};`;
  const deleteMovie = await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API6

const ConvertDirectorDbAPI6 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT * FROM director;`;
  const getDirector = await database.all(getDirectorsQuery);
  response.send(getDirector.map((eachItem) => ConvertDirectorDbAPI6(eachItem)));
});

//API7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesDirectorsQuery = `
    SELECT movie_name AS movieName FROM movie WHERE director_id = ${directorId};`;
  const getMoviesByDirector = await database.all(getMoviesDirectorsQuery);
  response.send(getMoviesByDirector);
});
module.exports = app;
