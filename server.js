
var HTTP_PORT = process.env.PORT || 8080;
var express = require('express');
var exphbs = require('express-handlebars');
var dataCollegeData = require('./modules/collegeData');
var path = require('path');

var app = express();



app.engine('.hbs', exphbs.engine({  
    extname: '.hbs' ,
    helpers: {
        // navigation helper function
        navLink: function( url , options) {
            return '<li' +
            ((url == app.locals.activeRoute)? ' class="nav-item active" ': ' class="nav-item" ' )+
            '><a class="nav-link" href="' + url + '">'+ options.fn(this) + '</a></li>';
        },
        // equal helper function
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebar Helper equal needs 2 parameter");
            if (lvalue != rvalue) {
                return options.inverse(this);
            }
            else {
                return options.fn(this);
            }
        }
    }

}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, '/views'));

app.use(express.static(__dirname + '/public'));

app.use(express.urlencoded({ extended: true }));

app.use(function(req,res,next){ 
    let route = req.path.substring(1); 
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));     
    next(); 
});


app.get("/students", (req,res)=> {
    // get course value 
    const course_id = req.query.course;
    if (course_id == undefined){
        get_function = dataCollegeData.getAllStudents();
    }
    else {
        get_function = dataCollegeData.getStudentsByCourse(course_id);
    }
    
    get_function.then(
        function(student_results) {
            if (student_results.length > 0){
                res.render('students', { students: student_results, layout: "main" });
            }
            else {
                res.render('students', { message: 'no results', layout: "main" }) ;
            }
            
        } 
    )
    .catch(
        () =>res.render('students', { message: 'no results', layout: "main" })  
    );
});

app.get("/courses", (req,res)=> {

    dataCollegeData.getCourses()
    .then(
        function(courses) {
            if (courses.length > 0){
                res.render('courses', { courses: courses, layout: "main" }) 
            }
            else {
                res.render('courses', { message: 'no results', layout: "main" })
            }
            
        }
    )
    .catch(
        () =>res.render('courses', { message: 'no results', layout: "main" })  
    );
});

app.get("/course/:id", (req,res)=> {
    const courseId = req.params.id;
    dataCollegeData.getCourseById(courseId)
    .then(
        function(course_data) {
            res.render('course',{ course: course_data[0] , layout: "main" });
        }
    )
    .catch(
        () =>{ res.render('course', { message: 'query returned 0 results', layout: "main" }) }
    );
});

app.get("/student/:studentNo", (req,res)=> {

    let viewData = {};
    const studentNo = req.params.studentNo;
    dataCollegeData.getStudentByNum(studentNo) 
    .then((student_data) => {
        if (student_data) {
            viewData.student = student_data[0];
        } else {
            viewData.student = null;
        }
    })
    .catch(
        () =>{ 
            viewData.student = null;
        }
    )
    .then(dataCollegeData.getCourses)
    .then((courseData) => {
        viewData.courses = courseData;

        for (let i=0; i < viewData.courses.length; i++) {
            if (viewData.courses[i].courseId == viewData.student.course) {
                viewData.courses[i].selected = true;
                // break;
            }
        }
    })
    .catch(() => { viewData.courses = [] })
    .then(() => {
        if(viewData.student == null ){
            res.status(404).send('Student Not Found!');
        } else {
            res.render('student', {viewData: viewData, layout : "main"});
        }
    });
});

app.get("/course/delete/:courseNo", (req,res)=> {
    const courseNo = req.params.courseNo;
    dataCollegeData.deleteCourse(courseNo)
    .then(
        function(courses) {
            res.redirect('/courses')
        }
    )
    .catch(
        () =>res.render('course', { message: 'Unable to Remove Course / Course not found', layout: "main" }) 
    );
});

app.get("/student/delete/:studentNum", (req,res)=> {
    const student_no = req.params.studentNum;
    dataCollegeData.deleteStudentByNum(student_no)
    .then(
        function(courses) {
            res.redirect('/students')
        }
    )
    .catch(
        () =>res.render('students', { message: 'Unable to Remove Student / Student not found', layout: "main" }) 
    );
});

app.get("/students/add", (req,res)=> {
    dataCollegeData.getCourses()
    .then(
        function(courses) {
            res.render('addStudent', {courses: courses, layout: "main"})
        }
    )
    .catch(
        ()=>res.render('addStudent', { layout: "main" }) 
    )
});

app.get("/", (req,res)=> {
    res.render('home', { layout: "main" });  
});

app.get("/about", (req,res)=> {
    res.render('about', { layout: "main" });  
});

app.get("/htmlDemo", (req,res)=> {
    res.render('htmlDemo', { layout: "main" });  
});


app.get("/courses/add", (req,res)=> {
    res.render('addCourse', { layout: 'main' });  
});



app.post("/students/add", (req, res) => {
    dataCollegeData.addStudent(req.body) 
    .then(
        function(courses) {
            res.redirect('/students')
        }
    )
    .catch(
        ()=>res.render('students', { layout: "main" }) 
    );
});

app.post("/courses/add", (req, res) => {
    dataCollegeData.addCourse(req.body) 
    .then(
        function() {
            res.redirect('/courses');
        }
    )
    .catch(
        ()=>res.render('courses', { layout: "main" }) 
    );
});

//updating the form
app.post("/students/update", (req, res) => { 
    dataCollegeData.updateStudent(req.body) 
    .then(
        function(courses) {
            res.redirect('/students')
        }
    )
    .catch(
        ()=>res.render('students', { layout: "main" }) 
    );
});

app.post("/course/update", (req, res) => {
    dataCollegeData.updateCourse(req.body) 
    .then(
        function(courses) {
            res.redirect('/courses')
        }
    )
    .catch(
        ()=>res.render('courses', { layout: "main" }) 
    );
});

app.use((req,res)=> {
    res.sendFile(path.join(__dirname,"/views/404.html"));
});

dataCollegeData.initialize()
.then(
    () => app.listen(HTTP_PORT, () => {console.log("server listening on port: http://127.0.0.1:" + HTTP_PORT)})
)
.catch(
    (err) => console.log(err) 
);
