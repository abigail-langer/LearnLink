const fs = require('fs');
const mysql = require('mysql2');
const express = require('express');
const queries = require('./queries');
const path = require('path');
require('dotenv').config();

const hostname = '127.0.0.1';
const port = 3000;

// Connect to DB
const db = mysql.createConnection({
    host: hostname,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'learn_link'
});

queries.addDB(db);

db.connect((err) => {
    if (err){
        throw err; 
    }
    console.log('Connected to MySQL');
});

const app = express();

app.use('/', express.static(path.join(__dirname, 'static')));

// Create DB
app.get('/createdb', (req, res) => {

    queries.query('CREATE DATABASE learn_link').then(x => {
        res.send('Database created');
    });
});

// Create DB Schema
app.get('/createschema', (req, res) => {

    Promise.all(queries.queryScript(fs.readFileSync('createDB.sql').toString())).then(x => {
        res.send('Created Schema');
    });
});

// Drop DB
app.get('/dropall', (req, res) => {

    queries.query('DROP DATABASE learn_link').then(x => {
        res.send('Database dropped');
    });
});

// Describe tables in DB
app.get('/desc', (req, res) => {

    let sql = [
        'DESCRIBE learn_link.questions;',
        'DESCRIBE learn_link.questions;',
        'DESCRIBE learn_link.question_to_subject;'
    ];

    Promise.all(queries.queryMany(sql)).then(x => {
        x.forEach(result => {
            console.log(result);
        });
        res.send('Database described');
    })

});

// Add a subject
app.get('/addSubject', (req, res) => {

    queries.addSubject(req.query.id).then(x => {
        res.send(`Subject ${req.query.id} added`);
    })
});

// Add a question
app.get('/addQuestion', (req, res) => {

    Promise.all(queries.addQuestion(req.query.question, req.query.subject_id)).then(x => {
        res.send('Question Added');
    })
});

// Log all data of a table
app.get('/showAllFromTable', (req, res) => {

    queries.query(`SELECT * FROM ${req.query.tableName};`).then(result => {
        console.log(result);
        res.send(`Table '${req.query.tableName}' Logged`);
    })
});

// Initialize Server
app.listen(port, () => {
    console.log('Server started on port ' + port);
});