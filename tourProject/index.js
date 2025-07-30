import express from 'express';
import fs from 'fs';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Tour from './models/tourModel.js';

dotenv.config({ path: './.env' })
const DB = process.env.CONNECTION;

mongoose.connect(DB, {
    useNewUrlParser: true
}).then(() => {
    console.log('DB connection success!');
});

// const testTour = new Tour({
//     name: 'mora2',
//     price: 453
// });

// NOTE save document in db
// testTour.save()
//     .then(doc => {
//         console.log('doc created: ', doc);
//     })
//     .catch(err => {
//         console.log('Error creating doc: ', err);
//     });

const server = express();

// NOTE native Middlewares
server.use(express.json());
server.set('query parser', 'extended');



if (process.env.NODE_ENV === 'development') server.use(morgan('dev'));




// NOTE to use static files
server.use(express.static('./public'))

// NOTE custom Middlewares
server.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

const customMiddleware = (req, res, next, val) => {
    // NOTE Val is the value of params
    next()
}

// REVIEW Aliasing, help to prefill some params to the user, to avoid re-write code 
const aliasTopTours= (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

// const tours = JSON.parse(fs.readFileSync('./devData/tours.json'));

// NOTE Routes handlers

const viewAllTours = async (req, res) => {
    
    // return res.status(200).json({
    //     status: 200,
    //     data: {
    //         requestTime: req.requestTime,
    //         tours
    //     }
    // })
    try {
        // NOTE one way to add an aperator in an endpoint we can use this third parameter lol[gte]=2 and this will be recieved like this as a query
        // { lol: {gte: 2}}
        // ANCHOR we have to configurate a middleware that allows this server.set('query parser', 'extended');
        //const tours = await Tour.find();

        // Advanced filter
        const queryObj = { ...req.query };
        console.log(req.query)
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        let query = Tour.find(JSON.parse(queryStr));

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Limit fields
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' '); // NOTE This will separate the elementes like this 'name duration etc'
            query = query.select(fields);
        } else {
            // NOTE prefix - ignore the key __v
            query = query.select('-__v');
        }

        // Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page - 1) * limit;

        query = query.skip(skip).limit(limit);

        const tours = await query

        return res.status(200).json({
            status: 200,
            result: tours.length,
            data: {
                tours,
                requestTime: req.requestTime
            }
        });

    } catch (err) {
        console.log('viewAllTours::: ', err);
        return res.status(500).json({status: 500, message: 'Internal server error'});
    }

}

const getOneTour = async (req, res) => {
    // const { id } = req.params
    // const tour = tours.find(tour => tour.id === Number(id));
    // if (!tour) return res.status(404).json({status: 404, message: 'Tour not found'})
    // return res.status(200).json({
    //     status: 200,
    //     data: {
    //         tour
    //     }
    // })
    try {
        const tour = await Tour.findById(req.params.id);
        if(!tour) return res.status(404).json({status: 404, message: 'Tour not founded'});
        return res.status(200).json({
            status: 200,
            data: {
                tour
            }
        });
    } catch (err) {
        console.log('getOneTour::: ', err);
        return res.status(500).json({status: 500, message: 'Internal server error'});
    }
    
}

const addNewTour = async (req, res) => {
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body);

    // tours.push(newTour);
    // fs.writeFile('./devData/tours.json', JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: 201,
    //         message: 'Tour created'
    //     })
    // });
    // NOTE Method 1 to create a doc
    // const newTour = new Tour({});
    // newTour.save();

    try {
        // NOTE Method 2 to create a doc
        const newTour = await Tour.create(req.body);
        
        return res.status(201).json({
            status: 201,
            data: {
                tour: newTour
            }
        })
    } catch (err) {
        console.log('addNewTour::: ', err);
        return res.status(500).json({status: 500, message: 'Internal server error'})
    }
    
}

const updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true // NOTE Return the new object updated
        });
        if (!tour) return res.status(404).json({status: 404, message: 'Tour not found'});
        return res.status(200).json({
            status: 200,
            message: 'Tour updated',
            data: {
                tour
            }
        });
    } catch (err) {
        console.log('updateTour::: ', err);
        return res.status(500).json({status: 500, message: 'Internal server error'});
    }
}

const deleteTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndDelete(req.params.id);
        if (!tour) return res.status(404).json({status: 404, message: 'Tour not found'});
        return res.status(204).json({
            status: 204,
            message: 'tour deleted'
        });
    } catch (err) {
        console.log('deleteTour::: ', err);
        return res.status(500).json({status: 500, message: 'Internal server error'});
    }
}

const tourRoute = express.Router();
server.use('/api/v1/tours', tourRoute);

tourRoute
  .route('/top-5-cheap')
  .get(aliasTopTours, viewAllTours);

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
});
