
            
            else {
                var email = results[0].email;
                var hash = results[0].password_hashes;
                bcrypt.compare(password, hash, function(err, res) {
                    //if the passwords match
                    if(res==true) {
                        //creates a token with an expiration of 10 minutes
                        var response = {
                            "token": jwt.sign({"employee_num": results[0].employee_num, exp: Math.floor(Date.now() / 1000) + (60 * 10)}, secretkey)
                        };
                        reply(JSON.stringify(response)).code(200);
                    }
                    //if the emails match but the passwords don't
                    else {
                        var response = {
                            "success": false,
                            "message": "Unable to log in with provided credentials."
                        }
                        reply(JSON.stringify(response)).code(400);
                    }
                });
            }
        });
    }
});

//Search
//DONE :)
server.route({
    method: 'POST',
    path: '/search',
    handler: function (request, reply) {
        var search_term = request.payload["search_term"];
        connection.query('SELECT first_name,last_name FROM employee WHERE employer="' + search_term + '"', function (error1, results1, fields1) {
            if (error1) {
                var response = {
                    "success": false,
                    "message": "Experienced error when attempting to search for: " + search_term
                };
                reply(JSON.stringify(response)).code(500);
            }
            var isEmpty = (results1 || []).length === 0;
            if (isEmpty) {
                var nameArr = search_term.split(" ");
                connection.query('SELECT first_name,last_name FROM employee WHERE first_name="' + nameArr[0] + '" AND last_name= "' + nameArr[1] + '"', function (error, results, fields) {
                    if (error) {
                        var response = {
                            "success": false,
                            "message": "Experienced error when attempting to search for: " + search_term
                        };
                        reply(JSON.stringify(response)).code(500);
                    }
                    else {
                        var response = {
                            "users": results
                        };
                        reply(JSON.stringify(response)).code(200);
                    }
                });
            }
            else {
                var response = {
                    "users": results1
                };
                reply(JSON.stringify(response)).code(200);
            }
        });
    }
});

//Create User
//NEEDS TO HAVE EMPLOYEE_NUM AUTO GENERATED
server.route({
    config: {
        cors: {
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    method: 'POST',
    path: '/users',
    handler: function(request, reply) {
        var email = request.payload["email"];
        var password = request.payload["password"];
        var first_name = request.payload["first_name"];
        var last_name = request.payload["last_name"];
        var employee_num = id;
        id += 1;
        //if any data is missing
        if(password===undefined||first_name===undefined||last_name===undefined||email===undefined) {
            var response = {
                "success": false,
                "message": "Request body had missing or malformed fields."
            };
            reply(JSON.stringify(response)).code(400);
        }
        //if data is present
        else {
            connection.query('SELECT email FROM employee WHERE email = "' + email + '"', function (error, results, fields) {
                //if a user already exists for that email
                if (results.length>0) {
                    var response = {
                        "success": false,
                        "message": "Account already exists for user with given email address."
                    }
                    reply(JSON.stringify(response)).code(409);
                }
                else {
                    var newPass;
                    bcrypt.hash(password, 10, function(err, hash) {
                        newPass = hash;
                        //if all is good, insert the user into the table
                        connection.query('INSERT INTO employee(username, password_hashes, first_name, last_name, email, employee_num) VALUES(NULL,"' + newPass + '", "' + first_name + '", "' + last_name + '","'  + email + '","'  + employee_num + '")', function (error, results, fields) {
                            if (error) {
                                console.log("TEST");
                                console.log(error);
                                var response = {
                                    "success": false,
                                    "message": "Experienced error when attempting to create the user."
                                };
                                reply(JSON.stringify(response)).code(500);
                            }
                            else {
                                var response = {
                                    "success": true,
                                    "message": "Successfully created account."
                                };
                                reply(JSON.stringify(response)).code(200);
                            }
                        });
                    }); 
                }
            });
        }
    }
});

//Get User
//DONE :)
server.route({
    method: 'GET',
    path: '/users/{user_id}',
    handler: function(request, reply) {
        var user_id = request.params["user_id"];
        //if the parameters are missing
        if (user_id===undefined) {
            var response = {
                "success": false,
                "message": "Request body had missing or malformed fields."
            };
            reply(JSON.stringify(response)).code(400);
        }
        //if the parameters are defined
        else {
            connection.query('SELECT employee_num, email, first_name, last_name, position, employer, location FROM employee WHERE employee_num="' + user_id + '"', function (error, results, fields) {
                if (error) {
                    var response = {
                        "success" : false,
                        "message": "Experienced error when attempting to retrieve the user."
                    };
                    reply(JSON.stringify(response)).code(500);
                }
                if (results.length==0) {
                    var response = {
                        "success" : false,
                        "message" : "The user with ID " +  user_id + " does not exist."
                    }
                    reply(JSON.stringify(response)).code(404);
                }
                else {
                    var response = {
                        "message": results
                    }
                    reply(JSON.stringify(response)).code(200);
                }
            });
        }
    }
});

//Get reviews
//Done :)
server.route({
    method: 'GET',
    path: '/users/{user_id}/reviews',
    handler: function (request, reply) {
        const user_id = request.params["user_id"];
        //first, checks to see if the user with given id exists
        connection.query('SELECT * FROM employee WHERE employee_num="' + user_id + '"', function(error, results, fields) {
            if (error) {
                var response = {
                    "success" : false,
                    "message": "Experienced error when attempting to retrieve reviews for the user."
                };
                reply(JSON.stringify(response)).code(500);
            }
            //if the user does not exist
            if (results.length==0) {
                var response = {
                    "success" : false,
                    "message" : "The user with ID " +  user_id + " does not exist."
                };
                reply(JSON.stringify(response)).code(404);
            }
            //if the user exists
            else {
                connection.query('SELECT * FROM employee_review WHERE employee_num="' + user_id + '"', function (error, results, fields) {
                    if (error) {
                        var response = {
                            "success" : false,
                            "message": "Experienced error when attempting to retrieve reviews for the user."
                        };
                        reply(JSON.stringify(response)).code(500);
                    }
                    //whether reviews exist for that user or not
                    var response = {
                        "reviews": results            
                    }
                    reply(JSON.stringify(response)).code(200);
                });
            }
        });
    }
});

//END UNAUTHENTICATED ROUTES
//START AUTHENTICATED ROUTES

//Refresh token
//DONE :)
server.route({
    config: {
        cors: {
            headers: ['Authorization'],
            origin: ['*'],
            additionalHeaders: ['cache-control', 'x-requested-with']
        }
    },
    method: 'GET',
    path: '/refreshToken',
    handler: function(request, reply) {
        var token = request.headers.authorization.split(' ')[1];
        if (token===undefined) {
            var response =  {
                "success": false,
                "message": "Request body has missing fields."
            };
            reply(JSON.stringify(response)).code(400);
        }
        else {
            try {
                var verified = jwt.verify(token, secretkey);
                var response = {
                    "token": jwt.sign({"employee_num": verified.employee_num, exp: (Math.floor(Date.now() / 1000) + (60 * 10))}, secretkey)
                };
                reply(JSON.stringify(response)).code(200);
            } catch (error) {
                var response = {
                    "success": false,
                    "message": "Unable to refresh the given token."
                };
                reply(JSON.stringify(response)).code(400);
            }
        }
    }
});

//Creating review for user
//NOT DONE :( (TIME ERROR)
server.route({
    method: 'POST',
    path: '/users/{user_id}/reviews',
    handler: function(request, reply) {
        var receiver = request.params["user_id"];
        var token = request.headers.authorization.split(' ')[1];
        var job_title = request.payload["job_title"];
        var employer = request.payload["employer"];
        var hotness = request.payload["hotness_rating"];
        var accountability = request.payload["accountability_rating"];
        var availability = request.payload["availability_rating"];
        var politeness = request.payload["politeness_rating"];
        var efficiency = request.payload["efficiency_rating"];
        var comment = request.payload["comment"];
        var datestamp = new Date(request.payload["datestamp"]);
        //console.log(typeof(datestamp));
        //if any of the fields are missing
        if (token===undefined || receiver === undefined || job_title===undefined || employer === undefined || hotness===undefined || accountability === undefined
            || availability===undefined || politeness=== undefined || efficiency===undefined || comment === undefined || datestamp===undefined) {
            var response =  {
                "success": false,
                "message": "Request body had missing or malformed fields."
            };
            reply(JSON.stringify(response)).code(400);
        }
        //if the fields are there, check if the user is logged in
        else {
            //do that  here
            try {
                var decoded = jwt.decode(token, secretkey);
                connection.query('SELECT * FROM employee WHERE employee_num ="' + decoded.employee_num + '"', function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        var response = {
                            "success": false,
                            "message": "Experienced error when attempting to create a review for a user."
                        };
                        reply(JSON.stringify(response)).code(500);
                    }
                    else {
                        if (results.length==0) {
                            var response = {
                                "success": false,
                                "message": "Attempted to add a review without being logged in."
                            };
                            reply(JSON.stringify(response)).code(403);
                        }
                        //now we know that that token was valid
                        else {
                            connection.query('INSERT INTO employee_review(employee_num, hotness, accountability, availability, politeness, efficiency, comments, employer, position, review_time) VALUES("' + receiver + '", "' + hotness + '", "' + accountability + '", "' + availability + '","' + politeness + '","' + efficiency + '", "' + comment + '", "' + employer + '", "' + job_title + '","' + datestamp + '")', function (error, results, fields) {
                                if (error) {
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to create a review for a user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                                else {
                                    var response = {
                                        "success": true,
                                        "message": "Successfully created review."
                                    };
                                    reply(JSON.stringify(response)).code(200);
                                }
                            });
                        }
                    }
                });
            } catch(err) {
                var response = {
                    "success": false,
                    "message": "Experienced error when attempting to create a review for a user."
                };
                reply(JSON.stringify(response)).code(500);
            }
        }
    }
});

//updating a user account
//Done :)
server.route({
    method: 'PUT',
    path: '/users/{user_id}',
    handler: function (request, reply) {
        var token = request.headers.authorization.split(' ')[1];
        var first_name = request.payload["first_name"];
        var last_name = request.payload["last_name"];
        var email = request.payload["email"];
        var employer = request.payload["employer"];
        var password = request.payload["password"];
        var job_title = request.payload["job_title"];
        var location = request.payload["location"];
        var user_id = request.params["user_id"];
        var newPass;
        var flag = true;
        try {
            var decoded = jwt.decode(token, secretkey);
            connection.query('SELECT * FROM employee WHERE employee_num="' + decoded.employee_num + '"', function (error, results, fields) {
                if (error) {
                    var response = {
                        "success": false,
                        "message": "Experienced error when attempting to update the user."
                    };
                    reply(JSON.stringify(response)).code(500);
                }
                else {
                    //if there are no users that match that token
                    if (results.length==0) {
                        var response = {
                            "success": false,
                            "message": "Attempted to update a user without being logged in."
                        };
                        reply(JSON.stringify(response)).code(403);
                    }
                    else{
                        if (first_name!==null) {
                            connection.query('UPDATE employee SET first_name = "' + first_name + '" WHERE employee_num = "' + user_id + '"', function (error, results, fields) {
                                if (error) {
                                    flag = false;
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to update the user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                            });
                        }
                        if (last_name!==null) {
                            connection.query('UPDATE employee SET last_name = "' + last_name + '" WHERE employee_num = "' + user_id + '"', function (error, results, fields) {
                                if (error) {
                                    flag = false;
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to update the user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                            });
                        }
                        if (email!==null) {
                            connection.query('UPDATE employee SET email = "' + email + '" WHERE employee_num = "' + user_id + '"', function (error, results, fields) {
                                if (error) {
                                    flag = false;
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to update the user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                            });
                        }
                        if (employer!==null) {
                            connection.query('UPDATE employee SET employer = "' + employer + '" WHERE employee_num = "' + user_id + '"', function (error, results, fields) {
                                if (error) {
                                    flag = false;
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to update the user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                            });
                        }
                        if (password!==null) {
                            bcrypt.hash(password, 10, function(err, hash) {
                                newPass = hash;
                                connection.query('UPDATE employee SET password_hashes = "' + newPass + '" WHERE employee_num = "' + user_id + '"', function (error, results, fields) {
                                    if (error) {
                                        flag = false;
                                        var response = {
                                            "success": false,
                                            "message": "Experienced error when attempting to update the user."
                                        };
                                        reply(JSON.stringify(response)).code(500);
                                    }
                                });
                            });
                        }
                        if (job_title!==null) {
                            connection.query('UPDATE employee SET position = "' + job_title + '" WHERE employee_num = "' + user_id + '"', function (error, results, fields) {
                                if (error) {
                                    flag = false;
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to update the user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                            });
                        }
                        if (location!==null) {
                            connection.query('UPDATE employee SET location = "' + location + '" WHERE employee_num = "' + user_id + '"', function (error, results, fields) {
                                if (error) {
                                    flag = false;
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to update the user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                            });
                        }
                    }
                } 
            });
        } catch (err) {
            var response = {
                "success": false,
                "message": "Experienced error when attempting to update the user."
            };
            reply(JSON.stringify(response)).code(500);
        } 
        if (flag) {
            var response = {
                "success": true,
                "message": "Successfully updated account."
            };
            reply(JSON.stringify(response)).code(200);
        }
    }  
});

//Deleting a user and all of their reviews
//Done :)
server.route({
    method: 'DELETE',
    path: '/user/{user_id}',
    handler: function (request, reply) {
        var user_id = request.params["user_id"];
        var token = request.headers.authorization.split(' ')[1];
        try {
            var decoded = jwt.decode(token, secretkey);
            connection.query('SELECT * FROM employee WHERE employee_num ="' + decoded.employee_num + '"', function (error, results, fields) {
                if (error) {
                    var response = {
                        "success": false,
                        "message": "Experienced error when attempting to delete the user."
                    };
                    reply(JSON.stringify(response)).code(500);
                }
                else if (results.length==0) {
                    var response = {
                        "success": false,
                        "message": "Attempted to delete a user without proper authorization."
                    };
                    reply(JSON.stringify(response)).code(403);
                }
                else {
                    connection.query('DELETE FROM employee WHERE employee_num="' + user_id + '"' , function (error, results, fields) {
                        if (error) {
                            var response = {
                                "success": false,
                                "message": "Experienced error when attempting to delete the user."
                            };
                            reply(JSON.stringify(response)).code(500);
                        }
                        else {
                            connection.query('DELETE FROM employee_review WHERE employee_num="' + user_id + '"' , function (error, results, fields) {
                                if (error) {
                                    var response = {
                                        "success": false,
                                        "message": "Experienced error when attempting to delete the user."
                                    };
                                    reply(JSON.stringify(response)).code(500);
                                }
                                else {
                                    var response = {
                                        "success": true,
                                        "message": "Successfully deleted user with ID: " + user_id
                                    };
                                    reply(JSON.stringify(response)).code(200);
                                }
                            });
                        }
                    });
                }
            });
        } catch (err) {
            var response = {
                "success": false,
                "message": "Given token could not be decoded."
            };
            reply (JSON.stringify(response)).code(400);
        }
    }
});

//END AUTHENTICATED ROUTES
//START DEBUGGING ROUTES

//Getting all employees
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

//Getting all reviews
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

//END DEBUGGING ROUTES

//Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});