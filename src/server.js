'use strict';

const Hapi = require('hapi');
var bcrypt = require('bcrypt');
var id = Math.floor((Math.random()*800) + 120);
var jwt2 = require('hapi-auth-jwt2');

// bring your own validation function
const validate = async function (email, passwordhash) {
    // do your checks to see if the person is valid
    var res = true;
    connection.query('SELECT email, password_hashes FROM employee WHERE email = "' + email + '"', function (error, results, fields) {
        if (email === results[0].email) {
            if (passwordhash === results[0].password_hashes) {
                res = true;
            }
            else {
                res = false;
            }
        }
        else {
            res = false;
        }
    });
    if (res) {
        return {isValid: true};
    }
    return {isValid: false};
}

const init = async () => {

var server = new Hapi.Server();
server.connection({
	host: '0.0.0.0',
    port: 3000,
    routes: { cors: true}
});
server.register(require('hapi-auth-jw2'));

server.auth.strategy('jwt', 'jwt', true,
 { key: 'whatifwearealllivinginasimulationcreatedbynaziscientistsandtheyactuallywonwwIIandtheyareexperimentingonthehumanrace', // Never Share your secret key
   validate: validate,            // validate function defined above
   verifyOptions: { algorithms: [ 'HS256' ] } // pick a strong algorithm
});

server.auth.default('jwt');

// adds global URI path prefix to incoming requests
// e.g. <domain>/api/dummy will get routed to /dummy
server.realm.modifiers.route.prefix = '/api';

//Initialize the mysql variable and create the connection object with necessary values
//Uses the https://www.npmjs.com/package/mysql package.
var mysql = require('mysql');
var connection = mysql.createConnection({
	//host will be the name of the service from the docker-compose file.
	host: 'database',
	port: 3306,
	database: process.env.MYSQL_DATABASE,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PASSWORD,
});


//REVIEW ROUTES
//adding a new review
server.route({
        method: 'POST',
        path: '/addReview',
        handler: function(request, reply) {
          var employee_num = request.payload.employee_num;
          var hotness = request.payload.hotness;
          var accountability = request.payload.accountability;
          var availability = request.payload.availability;
          var politeness = request.payload.politeness;
          var efficiency = request.payload.efficiency;
          var comments = request.payload.comments;
          connection.query('INSERT INTO employee_review(employee_num, hotness, accountability, availability, politeness, efficiency, comments) VALUES("' + employee_num + '", "' + hotness + '", "' + accountability + '", "' + availability + '","' + politeness + '","' + efficiency + '", "' + comments + '")', function (error, results, fields) {
           if (error)
             throw error;
          reply ('Review added to employee: ' + employee_num + '. Hotness: ' + hotness + '.');
          console.log(results);
        });
      }
});

//USER ACCOUNT ROUTES
//adding a new user -> making an account
server.route({
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    method: 'POST',
    path: '/newUser',
    handler: function(request, reply) {
        var username = request.payload.username;
        var password = request.payload.password;
        var first_name = request.payload.first_name;
        var last_name = request.payload.last_name;
        var employee_num = request.payload.employee_num;
        var department_name = request.payload.department_name;
        var position = request.payload.position;
        var email = request.payload.email;
        var employer = request.payload.employer;
        var location = request.payload.location;
        var newPass;
        if(employee_num===undefined){
            employee_num = id;
            id+=1;
        }
        bcrypt.hash(password, 10, function(err, hash) {
               newPass = hash;
               connection.query('INSERT INTO employee(username, password_hashes, first_name, last_name, employee_num, department_name, position, email, employer, location) VALUES("' + username + '", "' + newPass + '", "' + first_name + '", "' + last_name + '","' + employee_num + '","' + department_name + '", "' + position + '", "' + email + '", "' + employer +'", "' + location + '")', function (error, results, fields) {
                if (error)
                    throw error;
                reply('Employee Added: ' + first_name + ', '+ last_name);
                console.log(results);
            });
          });
    }
});

//login route
server.route({
        method: 'POST',
        path: '/login',
        handler: function(request, reply) {
          var email = request.payload.email;
          var password = request.payload.password;
          connection.query('SELECT password_hashes FROM employee WHERE email="' + email + '"', function (error, results, fields) { 
              if (error)
                  throw error;
              console.log(results[0].password_hashes);
              var hash = results[0].password_hashes;
              bcrypt.compare(password, hash, function(err, res) {
                  console.log(res);
                  if(res==true)
                    reply("login successful");
                  else 
                    reply("access denied");
              });
        });
      }
});

//User getting all of their reviews
server.route({
    method: 'GET',
    path: '/getEmployeeRevs/{eid}',
    handler: function (request, reply) {
        console.log('Server processing a /getEmployeeRevs request');
        const eid = request.params.eid;
        connection.query('SELECT hotness, accountability, availability, politeness, efficiency, comments FROM employee_review WHERE employee_num="' + eid + '"', function (error, results, fields) {
            if (error)
                throw error;
            reply(results);
            console.log(results);
        });

    }
});

//SEARCH ROUTES
//search by company name or by name, using "first_name last_name" format
server.route({
    method: 'GET',
    path: '/company/{name}',
    handler: function (request, reply) {
        console.log('Server processing a /company/{name} request');
        var name = request.params.name;
        console.log(name);
        connection.query('SELECT first_name,last_name FROM employee WHERE employer="' + name + '"', function (error1, results1, fields1) {
            var isEmpty = (results1 || []).length === 0;
            if (isEmpty) {
                var nameArr = name.split(" ");
                connection.query('SELECT first_name,last_name FROM employee WHERE first_name="' + nameArr[0] + '" AND last_name= "' + nameArr[1] + '"', function (error, results, fields) {
                    reply (results);
                    console.log(results);
                });
            }
            else {
                reply (results1);
                console.log(results1);
            }
        });
    }
});

//Getting all employee info
server.route({
    method: 'GET',
    path: '/getEmployees',
    handler: function (request, reply) {
        console.log('Server processing a /getEmployees request');
        connection.query('SELECT * FROM employee', function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
            console.log(results);
        });

    }
});

//updating a user account
server.route({
    method: 'PUT',
    path: '/updateUser',
    handler: function (request, reply) {
        console.log('Server is updating a user profile...');
        var first_name = request.payload.first_name;
        var last_name = request.payload.last_name;
        var email = request.payload.email;
        var company = request.payload.company;
        var password = request.payload.password;
        var current_emp_no = request.payload.current_emp_no;
        var newPass;
        bcrypt.hash(password,10,function(err,hash) {
            newPass = hash;
        });
        var token = jwt.sign({
            emp_no:current_emp_no,
            email:email,
            password_hashes:newPass
        }, 'secret');
        connection.query('UPDATE employee SET first_name = "' + first_name + '", last_name = "' + last_name + '", email = "' + email + '", employer = "' + company + '", password = "' + password + '" WHERE employee_num = "' + current_emp_no + '";', function (error, results, fields) {
            reply(token);
        });
    }
});

//Deleting a user and all of their reviews
server.route({
    method: 'DELETE',
    path: '/deleteUser/{eid}',
    handler: function (request, reply) {
        console.log('Server processing a /deleteUser request');
        const eid = request.params.eid;
        connection.query('DELETE FROM employee WHERE employee_num="' + eid + '"' , function (error, results, fields) {
            if (error)
                throw error;
            reply ('Account deleted for employee with id: ' + eid);
            console.log(results);
        });
        connection.query('DELETE FROM employee_review WHERE employee_num="' + eid + '"' , function (error, results, fields) {
            if (error)
                throw error;
            console.log(results);
        });
    }
});

//Getting all employee info
server.route({
    method: 'GET',
    path: '/getReviews',
    handler: function (request, reply) {
        console.log('Server processing a /getReviews request');
        connection.query('SELECT * FROM employee_review', function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
            console.log(results);
        });
    }
});
await server.start();
return server;
};



init().then(server => {
    console.log(`Server running at: ${server.info.uri}`);
  })
  .catch(error => {
    console.log(error);
});