const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'movie title must be a string',
        required_error: 'movie title is required'
    }),
    year: z.number().int().min(1900).max(2026),
    director: z.string(),
    duration: z.number().int().positive(),
    poster: z.string().url({ message: 'poster must be a valid url' }),
    genre: z.array(z.enum(["Drama", "Action", "Crime", "Adventure", "Sci-Fi", "Romance", "Animation", "Biography", "Fantasy"]),
        {
            invalid_type_error: 'genre must be an array of strings',
            required_error: 'genre is required',
        }),
    rate: z.number().min(0).max(10).default(5)
})

function validateMovie(input) {
    return movieSchema.safeParse(input)
    
}

function validarPartialMovie(input) {
    return movieSchema.partial().safeParse(input)
}

module.exports = {
    validateMovie,
    validarPartialMovie
}