require('pg');
const Sequalize = require('sequelize');

const PGHOST='ep-fragrant-hall-a51zqr6n.us-east-2.aws.neon.tech'
const PGDATABASE='senecadb'
const PGUSER='senecadb_owner'
const PGPASSWORD='EMlf7rQoUF2V'

var sequelize = new Sequalize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    dialect: 'postgres',
    port: '5432',
    dialectOptions: {
        ssl: {rejectUnauthorized: false }
    },
    query: { raw: true}
});

var Student = sequelize.define('Student', {
    studentNum: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequalize.STRING,
    lastName: Sequalize.STRING,
    email: Sequalize.STRING,
    addressStreet: Sequalize.STRING,
    addressCity: Sequalize.STRING,
    addressProvince: Sequalize.STRING,
    TA: Sequalize.BOOLEAN,
    status: Sequalize.STRING
});

var Course = sequelize.define('Course', {
    courseId: {
        type: Sequalize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequalize.STRING,
    courseDescription: Sequalize.STRING,
});

Course.hasMany(Student, { foreignKey: 'course' });

initialize = function () {
    return new Promise( (resolve, reject) => {
        sequelize.sync()
        .then( function() {
            resolve('connection successful!!');
        })
        .catch(function() {
            reject('unable to sync the database !!');
        });
        return;
    });
}

getAllStudents = function(){
    return new Promise((resolve,reject)=>{
        Student.findAll()
        .then( function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned !!');
        });
        return;
    });
}

getCourses = function(){
    return new Promise((resolve,reject)=>{
        Course.findAll()
        .then( function(courses) {
            resolve(courses);
        })
        .catch(function() {
            reject('no results returned !!');
        });
        return;
    });
};

getStudentByNum = function (studentNum) {
    return new Promise((resolve,reject)=>{
        Student.findAll({
            where: {
                studentNum: studentNum
            }
        })
        .then( function(student) {
            resolve(student);
        })
        .catch(function() {
            reject('no results returned !!');
        });
        return;
    });
};


getCourseById = function (courseId) {
    return new Promise((resolve,reject)=>{
        Course.findAll({
            where: {
                courseId: courseId,
            }
        })
        .then( function(courses) {
            resolve(courses);
        })
        .catch(function() {
            reject('no results returned !!');
        });
        return;
    });
};

getStudentsByCourse = function (course) {
    return new Promise((resolve,reject)=>{
        Student.findAll({
            where: {
                course: course
            }
        })
        .then( function(data) {
            resolve(data);
        })
        .catch(function() {
            reject('no results returned !!');
        });
        return;
    });
};

addStudent = function (studentData) {
    return new Promise( function (resolve, reject) {
        studentData.TA = (studentData.TA)? true: false;

        Student.create(studentData)
        .then(function(){
            resolve();
        })
        .catch(function(){
            reject('unable to create student. ');
        });
        return;
    } );
}

updateStudent = function (studentData) {
    return new Promise( function (resolve, reject) {
        studentData.TA = (studentData.TA)? true: false;

        Student.update(studentData, {
            where: {
                studentNum: studentData.studentNum
            }
        })
        .then(function(){
            resolve();
        })
        .catch(function(){
            reject('unable to create student. ');
        });
        return;
    } );
}

addCourse = function (courseData) {
    return new Promise( function (resolve, reject) {
        Course.create(courseData)
        .then(function(){
            resolve();
        })
        .catch(function(){
            reject('unable to create course.');
        });
        return;
    } );
}

updateCourse = function (courseData) {
    return new Promise( function (resolve, reject) {
        Course.update(courseData, {
            where: {
                courseId: courseData.courseId
            }
        })
        .then(function(){
            resolve();
        })
        .catch(function(){
            reject('unable to update course. ');
        });
        return;
    } );
}

deleteCourse = function (courseID) {
    return new Promise( function (resolve, reject) {
        Course.destroy( {
            where: {
                courseId: courseID
            }
        })
        .then(function(){
            resolve();
        })
        .catch(function(){
            reject('unable to delete course. ');
        });
        return;
    } );
}

deleteStudentByNum = function (id) {
    return new Promise( function (resolve, reject) {
        Student.destroy( {
            where: {
                studentNum: id
            }
        })
        .then(function(){
            resolve(); return;
        })
        .catch(function(){
            reject('unable to delete student. '); return;
        });
    } );
}

module.exports = {
    deleteStudentByNum,
    deleteCourse,
    updateCourse,
    addCourse,
    updateStudent,
    addStudent,
    getStudentByNum,
    getStudentsByCourse,
    getCourses,
    getCourseById,
    getAllStudents,
    initialize
};