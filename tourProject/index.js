import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' })
const server = express();

// NOTE Middlewares
server.use(express.json());
if (process.env.NODE_ENV === 'development') server.use(morgan('dev'));

// NOTE to use static files
server.use(express.static('./public'))

server.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
})

const customMiddleware = (req, res, next, val) => {
    // NOTE Val is the value of params
    next()
}

const tours = JSON.parse(fs.readFileSync('./devData/tours.json'));

// NOTE Routes handlers

const viewAllTours = (req, res) => {
    
    return res.status(200).json({
        status: 200,
        data: {
            requestTime: req.requestTime,
            tours
        }
    })
}

const getOneTour = (req, res) => {
    const { id } = req.params
    const tour = tours.find(tour => tour.id === Number(id));
    if (!tour) return res.status(404).json({status: 404, message: 'Tour not found'})
    return res.status(200).json({
        status: 200,
        data: {
            tour
        }
    })
}

const addNewTour = (req, res) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);
    fs.writeFile('./devData/tours.json', JSON.stringify(tours), err => {
        res.status(201).json({
            status: 201,
            message: 'Tour created'
        })
    });
}

const updateTour = (req, res) => {
}

const deleteTour = (req, res) => {
    res.status(204).json({
        status: 204,
        data: null
    });
}

const tourRoute = express.Router();
server.use('/api/v1/tours', tourRoute);

tourRoute
    .route('/')
    .get(viewAllTours)
    .post(addNewTour);

tourRoute
    .route('/:id')
    .get(getOneTour)
    .patch(updateTour)
    .delete(deleteTour)

server.listen(1000, () => {
    console.log('Server running')
})
