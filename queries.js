var db = null;

function addDB(database) {
    db = database;
}

function _query(sql) {
    
    return new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
        if (err) {
            reject(err);
        }
        else {
            resolve(result);
        }
        });
    });
}

function query(sql) {
    
    if (sql != ''){
        return _query(sql).catch(err => {
            throw err;
        });
    }
}

function addSubject(subject_name, course_name, discipline_name) {
    return query(`INSERT INTO subjects (subject_name, course_name, discipline_name) VALUES ("${subject_name}", "${course_name}", "${discipline_name}");`);
}

function addQuestion(question_content, question_answer, subject_id) {
    return queryMany([
        `INSERT INTO questions (id, question_content, question_answer) VALUES (DEFAULT, "${question_content}", "${question_answer}");`,
        `INSERT INTO question_to_subject (question_id, subject_id) VALUES (LAST_INSERT_ID(), ${subject_id});`
    ]);
}

function queryMany(script) {
    let res = [];
    script.forEach(sql => {
        res.push(query(sql));
    });
    return res;
}

function queryScript(script) {
    let res = [];
    for (sql of script.split(';')){
        query(sql);
    }
    return res;
}

module.exports = {
    addDB, query, addSubject, addQuestion, queryMany, queryScript
}