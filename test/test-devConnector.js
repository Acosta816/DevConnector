// 'use strict';
// const chai = require('chai');
// const chaiHttp = require('chai-http');
// const mongoose = require('mongoose');
// const faker = require('faker');

// const expect = chai.expect;
// const should = chai.should();

// const { Post } = require('../models/Post');
// const { Profile } = require('../models/Profile');
// const { User } = require('../models/User');
// const { app, runServer, closeServer } = require('../server');
// const { TEST_DATABASE_URL } = require('../config');


// chai.use(chaiHttp);

// //-----------------------setting up our Test TOOL FUNCTIONS---------------------------------------

// //declaring a funcion that we'll use later to delete the database.
// //we'll call it in afterEach() hook to ensure data from one test
// //doesn't stick for the next
// function tearDownDb() {
//     return new Promise((resolve, reject) => {
//         console.warn('DELETING DATABASE, ZEROING OUT!');
//         mongoose.connection.dropDatabase()
//             .then(zeroedDb => resolve(zeroedDb))
//             .catch(err => reject(err));
//     });
// };

// //Seed the database
// function seedBlogData() {
//     console.info('SEEDING blog post data');
//     const seedData = [];
//     for (let i = 1; i <= 10; i++) {
//         seedData.push({
//             author: {
//                 firstName: faker.name.firstName(),
//                 lastName: faker.name.lastName()
//             },
//             title: faker.lorem.sentence(),
//             content: faker.lorem.text()
//         })
//     }
//     return BlogPost.insertMany(seedData);
// };


// //--------------------------TESTS BEGIN-----------------------------------------




// describe('blog-posts api CRUD test suite', function () {
//     before(function () {
//         return runServer(TEST_DATABASE_URL);
//     });

//     // beforeEach(function () {
//     //     return seedBlogData();
//     // })

//     afterEach(function () {
//         // tear down database so we ensure no state from this test
//         // effects any coming after.
//         return tearDownDb();
//     });

//     after(function () {
//         return closeServer();
//     });

//     runServer(TEST_DATABASE_URL);


//     describe('GET/api/users', function () {

//         it('should return all existing posts', function () {
//             //strategy:
//             //  1. get back all posts returned by GET request to '/'
//             //  2. prove res has right status, data type
//             //  3. prove the number of posts we got back is equal to number in db.
//             let res;
//             return chai.request(app)
//                 .post('/api/users').send({ "name": "Ban", "email": "ban@gmail.com", "password": "123abc" })
//                 .then(_res => {
//                     res = _res;//loading our empty res variable with resulting _res response object from our GET call
//                     console.log("HERE YOU GO!!!!!!!! ", res.body);
//                     res.should.have.status(201);
//                     return BlogPost.count();
//                 })

//         });//end of it(1A)//end of GET

//     })//end of describe('GET/blog-posts'

// });//end of test suite
