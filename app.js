const express = require('express'); // requiere -> commonJS
const cors = require('cors');
const movies = require('./movies.json');
const crypto = require('node:crypto')

const { validateMovie, validarPartialMovie } = require('./schemas/movies');

const app = express();
app.use(express.json())

app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:5500',
            'http://localhost:1234',
            'http://localhost:8080',
            'https://movies.com',
            'https://midu.com',
        ]

        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }

        if (!origin) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}))

app.disable('x-powered-by'); // desabilita la cabecera x-powered-by


// todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {

    const {genre} = req.query
    if (genre) {
        const filterMovies = movies.filter(movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
        return res.json(filterMovies)
    }
    res.json(movies)
})

/*mio */
app.get('/movies/geners', (req, res) => {
    const genres = movies.reduce((acc, movie) => { // acc -> acumulador
        movie.genre.forEach(g => {
            if (!acc.includes(g)) acc.push(g)
        })
        return acc
    }, [])
    res.json(genres)
})
/*mio */


app.get('/movies/:id', (req, res) => { // path-to-regesp
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)

    res.status(404).json({error: 'movie not found'})
})

app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)

    if (!result.success) {
        return res.status(400).json({error: JSON.parse(result.error.message)})
        
    }

    const newMovie = {
        id: crypto.randomUUID(), // uuid v4
        ...result.data
    }
    // esto no seria REST, porque estamos gurdadndo el estado de la apliacion en la memoria
    movies.push(newMovie)

    res.status(201).json(newMovie)
})


app.delete('/movies/:id', (req, res) => {

    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1) return res.status(404).json({message: 'Movie not found'})

    movies.splice(movieIndex, 1)

    
    return res.json({message: 'Movie deleted'})

})


app.patch('/movies/:id', (req, res) => {
    const result = validarPartialMovie(req.body)
    
    if (!result.success) return res.status(400).json({error: JSON.parse(result.error.message)})
    
    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    
    if (movieIndex=== -1) return res.status(404).json({error: 'movie not found'})

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})


app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin)
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    }

    res.send()
})


/*Escuchar el PORT */

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
    
})