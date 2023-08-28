DROP TABLE IF EXISTS question_to_subject;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS subjects;
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT,
    subject_name VARCHAR(256) UNIQUE NOT NULL,
    course_name VARCHAR(256) NOT NULL,
    discipline_name VARCHAR(256) NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT,
    question_content UNIQUE TEXT NOT NULL,
    question_answer TEXT NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS question_to_subject (
    question_id INT UNIQUE,
    subject_id INT,
    FOREIGN KEY (subject_id) REFERENCES subjects(id),
    FOREIGN KEY (question_id) REFERENCES questions(id)
);