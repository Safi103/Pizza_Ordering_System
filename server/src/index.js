import express from 'express'
import cors from 'cors' 


const app = express();
app.use(cors());         // register the cors middleware
app.use(express.json()); // register express's built-in JSON parser

const PORT = process.env.PORT || 3001; // use env. var. port if one is set or 3001

// start the server and listen for incoming connections on chosen PORT
app.listen(PORT, () => {
    console.log(`Pizza server listening on http://localhost:${PORT}`);
});


export default app;