'use strict';

function sanitized(payload){
    var r=payload;
    for(var i in r){
        var key = i;
        var val = r[i];
        if (val === parseInt(val, 10)){
            continue;
        }
        var newInput='';
        for(var k = 0;k<val.length;k++){
            if(val[k]!='\''){
                newInput+=val[k];
            }else{
                console.log("detected")
                newInput+='\'\''
            }
        }
        r[i]=newInput
    }
    return r;
}
const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: '0.0.0.0', routes:{cors:true }});

server.state('session', {  
    ttl: 1000 * 60 * 60 * 24,    // 1 day lifetime
    encoding: 'base64json' 
})
//Initialize the mysql variable and create the connection object with necessary values
//Uses the https://www.npmjs.com/package/mysql package.
var mysql      = require('mysql');
var curr    = {ip:null,id:''};
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
        var cookie = request.state['session']
        console.log('Server processing a / request');
        reply('Hello Future Studio').unstate('session')
    }
});

server.route({
    method: 'GET',
    path: '/mgwInClassApril4route',
    handler: function (request, reply) {
        reply('Responsible Party!')
    }
});

server.route({
    method: 'GET',
    path: '/2',
    handler: function (request, reply) {
        var cookie = request.state.session
        console.log('Server processing a / request');
        reply(cookie.username);
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
    path: '/showUsers',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        connection.query('SELECT * FROM users', function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/showGarages',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        connection.query('SELECT * FROM garages', function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/showTimeslots',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        var q='';
        q+='SELECT timeslot_time FROM timeslots'
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'POST',
    path: '/favorite',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        var q='';
        q+='UPDATE users SET favorite_garage =';
        q+=request.payload['favorite_garage'];
        q+=' WHERE user_id=';
        q+=request.payload['user_id'];
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (sanitized(request.payload));
        });
    }
});

server.route({
    method: 'POST',
    path: '/reserve',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        var q="";
        q+="INSERT INTO timeslots(garage_id,timeslot_time,timeslot_cost) VALUES ("
        q+=request.payload['garage_id'];
        q+=",";
        q+=request.payload['timeslot_time'];
        q+=",";
        q+=request.payload['timeslot_cost'];
        q+=");";

        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (q);
        });
    }
});

server.route({
    method: 'POST',
    path: '/showRepairsForUser',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        var vehicle_id=request.payload['vehicle_id'];
        var q = 'SELECT * FROM repairs WHERE vehicle_id = '
        q+=vehicle_id;
        q+=";";
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            //Sends back to the client the value of 1 + 1
            reply (results);
        });
    }
});

server.route({
    method: 'POST',
    path: '/login',
    config:{
        handler: function (request, reply) {
            var cookie=request.state.session;
            console.log('Server processing a / request');
            console.log('request: ', request);
            var q="";
            q+="SELECT user_id FROM users WHERE email = '";
            q+=request.payload['email'];
            q+="' AND user_password = '";
            q+=request.payload['user_password'];
            q+="';";
            console.log('q is: ', q);
            connection.query(q, function (error, results, fields) {
                if (error)
                    throw error;
                if (!cookie&&results!=[]) {
                    cookie = {
                        username: 'miaomiao',
                        firstVisit: false
                    }
                }
                cookie.lastVisit = Date.now()
                if (JSON.stringify(results) !== '[]'){
                    curr.id=results[0].user_id;
                    curr.ip=request.raw.req.connection.remoteAddress;
                }else{
                    curr.id=0;
                    curr.ip='';
                }
                reply(curr)
                .state('session', cookie)
            });
        }
    }
});

server.route({
    method: 'POST',
    path: '/loginAsGarage',
    config:{
        handler: function (request, reply) {
            var q="";
            q+="SELECT garage_id FROM garages WHERE garage_email = '";
            q+=request.payload['garage_email'];
            q+="' AND garage_password = '";
            q+=request.payload['garage_password'];
            q+="';";
            console.log('q is: ', q);
            connection.query(q, function (error, results, fields) {
                if (error)
                    throw error;
                if (JSON.stringify(results) !== '[]'){
                    curr.id=results[0].garage_id;
                    curr.ip=request.raw.req.connection.remoteAddress;
                }else{
                    curr.id=0;
                    curr.ip='';
                }
                reply(curr);
            });
        }
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
        var r=sanitized(request.payload)
        var q="";
        q+="INSERT INTO repairs(repair_id,vehicle_id, cost, repair_status,repair_notes,repair_title,repair_x_cord,repair_y_cord) VALUES ("
        q+=r['repair_id'];
        q+=",";
        q+=r['vehicle_id'];
        q+=",";
        q+=r['cost'];
        q+=",";
        q+=r['repair_status'];
        q+=",";
        q+=r['repair_notes'];
        q+=",";
        q+=r['repair_title'];
        q+=",";
        q+=r['repair_x_cord'];
        q+=",";
        q+=r['repair_y_cord'];
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
    path: '/addVehicle',
    handler: function(request, reply){
        // if(request.raw.req.connection.remoteAddress!=curr.ip){
        //     throw('you need to log in');
        // }
        var r=sanitized(request.payload)
        
        var q = "";
        q += "INSERT INTO vehicles(user_id, garage_id, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_init_diagnosis, vehicle_vin,vehicle_manager) VALUES (";
        q += curr.id;
        q += ",";
        q += r['garage_id'];
        q += ",'";
        q += r['vehicle_make'];
        q += "','";
        q += r['vehicle_model'];
        q += "','";
        q += r['vehicle_year'];
        q += "','";
        q += r['vehicle_color'];
        q += "','";
        q += r['vehicle_init_diagnosis'];
        q += "','";
        q += r['vehicle_vin'];
        q += "','";
        q += r['vehicle_manager'];
        q += "');";

        connection.query(q, function (error, results, fields){
            if(error)
                throw error;
        });
        console.log(q)
        reply(q);
    }
 });

server.route({
    method: 'GET',
    path: '/showVehicle',
    handler: function(request, reply){
        var q=''
        q='SELECT * FROM vehicles WHERE user_id='
        q+=curr.id;
        q+=";"
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
            reply(results);
        });
    }
});

server.route({
    method: 'POST',
    path: '/addUser',
    handler: function(request, reply){
        var r=sanitized(request.payload)
        var q="";
        q+="INSERT INTO users(username, user_password,full_name,email,address,favorite_garage) VALUES ('"
        q+=r['username'];
        q+="','";
        q+=r['user_password'];
        q+="','";
        q+=r['full_name'];
        q+="','";
        q+=r['email'];
        q+="','";
        q+=r['address'];
        q+="',";
        q+=r['favorite_garage'];
        q+=");";

        console.log("q is :",q);
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply(q);
    }
});

server.route({
    method: 'POST',
    path: '/addGarage',
    handler: function(request, reply){
        var r=sanitized(request.payload);
        var q="";
        q+="INSERT INTO garages(garage_password,garage_name,garage_email,garage_location,garage_description) VALUES ('"
        q+=r['garage_password'];
        q+="','";
        q+=r['garage_name'];
        q+="','";
        q+=r['garage_email'];
        q+="','";
        q+=r['garage_location'];
        q+="','";
        q+=r['garage_description'];
        q+="');";

        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        console.log(q);
        reply(r);
    }
});


server.route({
    method: 'POST',
    path: '/addPart',
    handler: function(request, reply){
        var r=sanitized(request.payload);
        var q="";
        q+="INSERT INTO parts(vehicle_make_model,garage_id, part_name,part_serial_number,part_description) VALUES ('"
        q+=r['vehicle_make_model'];
        q+="',";
        q+=r['garage_id'];
        q+=",'";
        q+=r['part_name'];
        q+="','";
        q+=r['part_serial_number'];
        q+="','"
        q+=r['part_description'];
        q+="');"

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
        var r=sanitized(request.payload);
        var q="";
        q+="UPDATE parts SET part_description = " 
        q+=r['part_description'];
        q+=" WHERE part_id = ";
        q+=r['part_id'];
        q+=" AND user_id = ";
        q+=curr.id;
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
