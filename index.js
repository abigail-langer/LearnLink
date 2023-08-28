const fs = require('fs');
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const queries = require('./queries');
const path = require('path');
const nunjucks = require('nunjucks');
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

nunjucks.configure('templates', {
    autoescape: true,
    express: app
});

app.use('/', express.static(path.join(__dirname, 'static')));

// courses.html Page
app.get('/courses.html', (req, res) => {

    queries.query('SELECT * FROM subjects').then(x => {
        
        let courses = {}

        x.forEach(subject => {
            let discipline = subject['discipline_name'];

            if (courses[discipline] === undefined) {
                courses[discipline] = [subject['course_name']];
            }
            else {
                !courses[discipline].includes(subject['course_name']) && courses[discipline].push(subject['course_name']);
            }
        });

        let data = {
            courses: courses
        }

        res.render('courses.html', data);
    });
});

// subjects.html Page
app.get('/subjects.html', (req, res) => {

    queries.query(`SELECT * FROM subjects WHERE discipline_name = "${req.query.discipline}" AND course_name = "${req.query.course}"`).then(x => {
        
        let subjects = []
        
        x.forEach(subject => {
            subjects.push(subject['subject_name']);
        })
        
        console.log(subjects);
        let data = {
            discipline_name: req.query.discipline,
            course_name: req.query.course,
            subjects: subjects
        }

        res.render('subjects.html', data);
    });
});

// question.html Page
app.get('/question.html', (req, res) => {
    
    if (req.query.discipline == undefined || req.query.course == undefined || req.query.subject == undefined){
        res.send("Missing Parameter");
        return;
    }
    
    queries.query(`
        SELECT questions.id, question_content 
        FROM questions
        CROSS JOIN question_to_subject ON questions.id = question_to_subject.question_id
        CROSS JOIN subjects ON question_to_subject.subject_id = subjects.id
        WHERE discipline_name = "${req.query.discipline}" AND course_name = "${req.query.course}" AND subject_name = "${req.query.subject}"
    `).then(x => {
        console.log(x);
        if (x.length == 0)
        {
            res.send("No questions found");
            return;
        } 
        let data = {
            question: x[0]['question_content'],
            question_id: x[0]['id']
        }
        
        res.render('question.html', data);
    });
});

app.post('/question.html', (req, res) => {

    let data = req.body;

    queries.query(`SELECT question_answer from questions WHERE id = ${data.question_id}`).then(x => {
        console.log(x);
        if (x[0]['question_answer'] == data['answerBox'])
        {
            res.send('Correct!');
        }
        else
        {
            res.send(`Incorrect. The right answer is ${x[0].question_answer}`);
        }
    })

});

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

    if (req.query.subject == undefined || req.query.course == undefined || req.query.discipline == undefined){
        res.send("Missing Parameter");
        return;
    }
    
    queries.addSubject(req.query.subject, req.query.course, req.query.discipline).then(x => {
        res.send(`Subject ${req.query.subject} added`);
    })
});

// Add a question
app.get('/addQuestion', (req, res) => {

    if (req.query.question == undefined || req.query.answer == undefined || req.query.subject_id == undefined){
        res.send("Missing Parameter");
        return;
    }

    Promise.all(queries.addQuestion(req.query.question, req.query.answer, req.query.subject_id)).then(x => {
        res.send('Question Added');
    })
});

// Log all data of a table
app.get('/showAllFromTable', (req, res) => {

    if (req.query.tableName == undefined){
        res.send("Missing Parameter");
        return;
    }

    queries.query(`SELECT * FROM ${req.query.tableName};`).then(result => {
        console.log(result);
        res.send(`Table '${req.query.tableName}' Logged`);
    })
});

// Initialize Server
app.listen(port, () => {
    console.log('Server started on port ' + port);
});