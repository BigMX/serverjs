'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: '0.0.0.0' });

//Initialize the mysql variable and create the connection object with necessary values
//Uses the https://www.npmjs.com/package/mysql package.
var mysql      = require('mysql');
var connection = mysql.createConnection({

    //host will be the name of the service from the docker-compose file. 
    host     : 'mysql',
    user     : 'root',
    password : 'go_away!',
    database : 'cse3330'
});


connection.connect();

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        reply('Hello, worlsds!');
    }
});

server.route({
    method: 'GET',
    path: '/showParts',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        connection.query('SELECT * FROM parts', function (error, results, fields) {
            if (error)
                throw error;
            //Sends back to the client the value of 1 + 1
            reply (results);
        });
    }
});
server.route({
    method: 'GET',
    path: '/showRepairs',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        connection.query('SELECT * FROM repairs', function (error, results, fields) {
            if (error)
                throw error;
            //Sends back to the client the value of 1 + 1
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/show',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        connection.query('SHOW DATABASES', function (error, results, fields) {
            if (error)
                throw error;
            //Sends back to the client the value of 1 + 1
            reply (results);
        });
    }
});

//A new route to test connectivity to MySQL
server.route({
    method: 'GET',
    path: '/getData',
    handler: function (request, reply) {
        console.log('Server processing a /getData request');

        //Creates the connection

        //Does a simple select, not from a table, but essentially just uses MySQL
        //to add 1 + 1.
        //function (error, results, fields){...} is a call-back function that the
        //MySQL lib uses to send info back such as if there was an error, and/or the
        //actual results.
        connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
            if (error)
                throw error;
            //Sends back to the client the value of 1 + 1
            reply ('The solution is ' + results[0].solution);

            //for exemplar purposes, stores the returned value in a variable to be
            //printed to log
            var solution = results[0].solution;
            console.log('The solution is: ', solution);
        });
        //close the connection to MySQL
    }
});

server.route({
    method: 'POST',
    path: '/user',
    handler: function(request, reply){
        reply('User Added: '+request.payload['lName'] +', '+request.payload['fName']);
    }
});

server.route({
    method: 'POST',
    path: '/addRepair',
    handler: function(request, reply){
        
        var q="";
        q+="INSERT INTO repairs(repair_id,vehicle_id, cost, repair_status) VALUES ("
        q+=request.payload['repair_id'];
        q+=",";
        q+=request.payload['vehicle_id'];
        q+=",";
        q+=request.payload['cost'];
        q+=",";
        q+=request.payload['repair_status'];
        q+=");";

        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply(q);
    }
});

server.route({
    method: 'POST',
    path: '/addUser',
    handler: function(request, reply){
        
        var q="";
        q+="INSERT INTO users(user_id,user_name, user_password,full_name,email,address,favorite_garage) VALUES ("
        q+=request.payload['user_id'];
        q+=",";
        q+=request.payload['user_name'];
        q+=",";
        q+=request.payload['user_password'];
        q+=",";
        q+=request.payload['full_name'];
        q+=",";
        q+=request.payload['email'];
        q+=",";
        q+=request.payload['address'];
        q+=",";
        q+=request.payload['favorite_garage'];
        q+=");";

        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply(q);
    }
});

server.route({
    method: 'POST',
    path: '/addPart',
    handler: function(request, reply){
        
        var q="";
        q+="INSERT INTO parts(vehicle_make_model,garage_id, part_id, part_name,part_serial_number,part_description) VALUES ("
        q+=request.payload['vehicle_make_model'];
        q+=",";
        q+=request.payload['garage_id'];
        q+=",";
        q+=request.payload['part_id'];
        q+=",";
        q+=request.payload['part_name'];
        q+=",";
        q+=request.payload['part_serial_number'];
        q+=","
        q+=request.payload['part_description'];
        q+=");"

        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply(q);
    }
});
server.route({
    method: 'POST',
    path: '/updateDescription',
    handler: function(request, reply){
        
        var q="";
        q+="UPDATE parts SET part_description = " 
        q+=request.payload['part_description'];
        q+=" WHERE part_id = ";
        q+=request.payload['part_id'];
        q+=";";

        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply(q);
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        console.log('Server processing /name request');
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});


server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
