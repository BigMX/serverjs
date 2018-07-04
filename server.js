'use strict';
var req= require("request");
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

function hashPassword(password){
    var hash=''
    for(var i=0;i<password.length;i++){
        hash+=password.charCodeAt(i)%256;
    }
    return hash;
}
 
const Hapi = require('hapi');
var request=require('request');

const server = new Hapi.Server();
server.connection({ port: 3000, host: '0.0.0.0', routes:{cors:true }});

server.state('session', {  
    ttl: 1000 * 60 * 60 * 24,    // 1 day lifetime
    encoding: 'base64json' 
})
//Initialize the mysql variable and create the connection object with necessary values
//Uses the https://www.npmjs.com/package/mysql package.
var mysql      = require('mysql');
var curr    = {ip:null,id:'',type:null};
var connection = mysql.createConnection({

    //host will be the name of the service from the docker-compose file. 
    host     : 'mysql',
    user     : 'root',
    password : 'go_away!',
    database : 'wx'
});

var aId=0
// var schedule = require('node-schedule');

var t2 = new Date("Mon Jul 02 2018 15:49:09 GMT+0000 (UTC)")
var t3 = new Date("Mon Jul 02 2018 05:26:09 GMT+0000 (UTC)")

// function scheduleCronstyle(){
//     schedule.scheduleJob('* * * * * 1', function(){
//         if(new Date()>t3){
//             connection.query("select people_id from People order by rand() limit 1;", function (error, results, fields){
//                 aId=JSON.stringify(results);
//             });
//             console.log('done');
//         }else{
//             console.log("undone")
//         }
//     }); 
// }

// scheduleCronstyle();

connection.connect();

server.route({
    method: 'GET',
    path: '/chou',
    handler: function (request, reply) {
        if(new Date()>t3){
                        connection.query("select people_id from People order by rand() limit 1;", function (error, results, fields){
                            aId=JSON.stringify(results);
                        });
                        console.log('done');
                        reply({success:202})
                    }else{
                        console.log("undone")
                        reply({fail:400})
                    }
    }
})

server.route({
    method: 'GET',
    path: '/showPrize',
    handler: function (request, reply) {
        var q = 'SELECT * FROM Prize;';
        
        console.log(q);
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});


server.route({
    method: 'POST',
    path:'/getOpenId',
    handler:function(request,reply){
        var url=request.payload['url'];
        console.log(url);
        var res;
        req(url,function(error,response,body){
            if(error)
                throw error;
            res=response;
        })
        reply(res);
    }
})



server.route({
    method: 'GET',
    path: '/getPrize/{round}/{class}',
    handler: function (request, reply) {
        var q = 'SELECT * FROM Prize WHERE prize_round = '
        q+=request.params.round;
        q+=' AND prize_class='
        q+=request.params.class;
        q+=";";
        
        console.log(q);
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/drawPrize/{round}/{class}',
    handler: function (request, reply) {
        var id;
        var q1="SELECT prize_id FROM Prize WHERE prize_round = "
        q1+=request.params.round;
        q1+=' AND prize_class='
        q1+=request.params.class;
        q1+=";";
        connection.query(q1,function(error,results, fields) {
            if (error)
                throw error;
            id=results[0].prize_id;
        });
        var temp;
        connection.query("select people_id, people_name from People WHERE prize_id is null order by rand() limit 1;", function (error, results, fields) {
            if (error)
                throw error;
            temp=results;
            console.log(temp);
            var q2='UPDATE People SET prize_id =';
            q2+=id;
            q2+=' WHERE people_id=';
            q2+=temp[0].people_id;
        q2+=';';
        connection.query(q2, function (error, results, fields) {
            if (error)
                throw error;
        });
        var q3='UPDATE Prize SET people_id =';
        q3+=temp[0].people_id;
        q3+=' AND people_name=';
        q3+=temp[0].people_name;
        q3+=' WHERE prize_id=';
        q3+=id;
        q3+=';';
        connection.query(q3, function (error, results, fields) {
            if (error)
                throw error;
        });
        reply({"success":202})
        });
        
        
    }
});

if(new Date()<t2){
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        var cookie = request.state['session']
        console.log('Server processing a / request');
        reply(aId)
    }
})
}else{
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            var cookie = request.state['session']
            console.log('Server processing a / request');
            reply(new Date()+'\n'+t2)
        }
    })
}


server.route({
    method: 'GET',
    path:'/showPeople',
    handler:function(request,reply){
        console.log('showing people');
        connection.query("SELECT * FROM People", function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
})

server.route({
    method: 'POST',
    path:'/addPeople',
    handler:function(request,reply){
        console.log('adding people');
        var q = 'INSERT INTO People(people_name) VALUES("'
        q+=request.payload['nickName'];
        q+='")';
        console.log(q);
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
})



















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
        console.log('Server processing a /2 request');
        reply(cookie.username);
    }
});

server.route({
    method: 'GET',
    path: '/showPartsForGarage',
    handler: function (request, reply) {
        console.log('Server processing a /showParts request');
        var q='SELECT * FROM parts WHERE garage_id='
        q+=curr.id;
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/showPartsForUser',
    handler: function (request, reply) {
        console.log('Server processing a /showPartsForUser request');
        var q='SELECT * FROM parts WHERE parts.customer ='
        q+= curr.id;
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/showUsers',
    handler: function (request, reply) {
        console.log('Server processing a /showUsers request');
        connection.query('SELECT * FROM users', function (error, results, fields) {
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
        console.log('Server processing a /showTimeslots request');
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
    method: 'PUT',
    path: '/favorite',
    handler: function (request, reply) {
        console.log('Server processing a /favorite request');
	console.log(request.payload);
        var q='';
        q+='UPDATE users SET favorite_garage =';
        q+=request.payload;
        q+=' WHERE user_id=';
        q+=curr.id;
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (sanitized(request.payload));
        });
    }
});
server.route({
    method: 'PUT',
    path: '/unfavorite',
    handler: function (request, reply) {
        console.log('Server processing a /unfavorite request');
        var q='';
        q+='UPDATE users SET favorite_garage = 0';
        q+=' WHERE user_id=';
        q+=curr.id;
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (sanitized(request.payload));
        });
    }
});


server.route({
   method: 'PUT',
   path: '/updateAppointment',
   handler: function(request, reply){
       var query = "";
       query += "UPDATE appoinments SET appt_type = ";
       query += request.payload['appt_type'];
       query += ", user_comments = ";
       query += request.payload['user_comments'];
       query += " WHERE user_id = ";
       query += request.payload['user_id'];
       query += " AND timeslot_id = ";
       query += request.payload['timeslot_id'];
       query += " AND garage_id = ";
       query += request.payload['garage_id'];
       query += ";";

       connection.query(query, function (error, results, fields){
           if(error)
               throw error;
       });
       reply(query);
   }
});

server.route({
   method: 'POST',
   path: '/makeAppointment',
   handler: function(request, reply){
       var r=sanitized(request.payload);
       var q="";
       q+="INSERT INTO appointments(user_id,timeslot_id,garage_id,appt_type,user_comments) VALUES ('"
       q+=r['user_id'];
       q+="','";
       q+=r['timeslot_id'];
       q+="','";
       q+=r['garage_id'];
       q+="','";
       q+=r['appt_type'];
       q+="','";
       q+=r['user_comments'];
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
    method: 'GET',
    path: '/showUserInfo',
    handler: function (request, reply) {
        console.log('Server processing a /showUserInfo request');
        var q='';
        q+='SELECT * FROM users WHERE user_id=';
        q+=curr.id;
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/getUserType',
    handler: function (request, reply) {
        console.log('Server processing a /getUserType request');
        var q='';
        q+='SELECT * FROM users WHERE user_id=';
        q+=curr.id;
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
	console.log(curr);            
	reply (curr);
        });
    }
});

server.route({
    method: 'POST',
    path: '/reserve',
    handler: function (request, reply) {
        console.log('Server processing a /reserve request');
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
    method: 'GET',
    path: '/showRepairsForUser/{vehicle_id}',
    handler: function (request, reply) {
        console.log('Server processing a /showRepairsForUser request');
        var vehicle_id=request.params.vehicle_id;
        var q = 'SELECT * FROM repairs WHERE vehicle_id = '
        q+=vehicle_id;
        q+=";";
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/showGarageForUser/{garage_id}',
    handler: function (request, reply) {
        console.log('Server processing a / request');
        var q = 'SELECT * FROM garages WHERE garage_id = '
        q+=request.params.garage_id;
        q+=";";
        connection.query(q, function (error, results, fields) {
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
        console.log('Server processing a /showGarages request');
        var q = 'SELECT * FROM garages g1 INNER JOIN vehicles v1 ON g1.garage_id=v1.garage_id WHERE g1.garage_id = '
        q+=curr.id;
        q+=";";
        var r;
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            r=results;
        });
        var q = 'SELECT * FROM garages g1 INNER JOIN parts p1 ON g1.garage_id=p1.garage_id WHERE g1.garage_id = '
        q+=curr.id;
        q+=";";
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply({parts:results,vehicles:r})
        });
    }
});


server.route({
    method: 'POST',
    path: '/login',
    config:{
        handler: function (request, reply) {
            var cookie=request.state.session;
            console.log('Server processing a /login request');
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
                    curr.type='customer';
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
                    curr.type='garage';
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

server.route({
    method: 'PUT',
    path: '/deleteVehicle/{vehicle_id}',
    handler: function(request, reply){
        var q='DELETE FROM vehicles WHERE vehicle_id='
        q+=request.params.vehicle_id;
        q+=';';
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
        });
       var q = 'DELETE FROM repairs WHERE vehicle_id = ';
       q += request.params.vehicle_id;
       q+=';';
       connection.query(q, function (error, results, fields) {
           if (error)
               throw error;
       });    
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
    method: 'PUT',
    path: '/updateRepair',
    handler: function(request, reply){
	console.log(request.payload);
        var r=sanitized(request.payload)
        var q="";
        q+="UPDATE repairs SET repair_status ='";
        q+=r['repair_status'];
        q+="' WHERE repair_id=";
        q+=r['repair_id'];
        q+=';';
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
	reply({status:200});
    }
});

server.route({
    method: 'POST',
    path: '/addRepair',
    handler: function(request, reply){
        var r=sanitized(request.payload)
        var q="";
        q+="INSERT INTO repairs(vehicle_id, cost, repair_status,repair_date,repair_notes,repair_title,repair_x_cord,repair_y_cord) VALUES ("
        q+=r['vehicle_id'];
        q+=",";
        q+=r['cost'];
        q+=",'";
        q+=r['repair_status'];
        q+="','";
        q+=r['repair_date'];
        q+="','";
        q+=r['repair_notes'];
        q+="','";
        q+=r['repair_title'];
        q+="',";
        q+=r['repair_x_cord'];
        q+=",";
        q+=r['repair_y_cord'];
        q+=");";
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        console.log(q);
        reply({'status':200});
    }
});
//server.route()
server.route({
    method: 'POST',
    path: '/addVehicle',
    handler: function(request, reply){
        // if(request.raw.req.connection.remoteAddress!=curr.ip){
        //     throw('you need to log in');
        // }
        var r=sanitized(request.payload)
        
        var q = "";
        q += "INSERT INTO vehicles(user_id, vehicle_make, vehicle_model, vehicle_year, vehicle_color, vehicle_init_diagnosis, vehicle_vin, vehicle_manager, garage_id) VALUES (";
        q += curr.id;
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
	    q += "','";
	    q += r['garage_id']
        q += "');";

        connection.query(q, function (error, results, fields){
            if(error)
                throw error;
        });
        console.log(q)
        reply({status:200});
    }
 });

server.route({
    method: 'GET',
    path: '/showVehicle',
    handler: function(request, reply){
        var q=''
        q='SELECT * FROM vehicles WHERE user_id = '
        q+=curr.id;
        q+=";"
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
	    console.log(results);
            reply(results);
        });
    }
});


server.route({
    method: 'GET',
    path: '/showOneVehicle/{vehicle_id}',
    handler: function(request, reply){
        var q=''
        q='SELECT * FROM vehicles WHERE user_id='
        q+=curr.id;
        q+=" AND vehicle_id="
        q+=request.params.vehicle_id;
        q+=";";
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
            reply(results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/showOneVehicleGarage/{vehicle_id}',
    handler: function(request, reply){
        var q=''
        q='SELECT * FROM vehicles WHERE garage_id='
        q+=curr.id;
        q+=" AND vehicle_id="
        q+=request.params.vehicle_id;
        q+=";";
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
        reply({"status": 200});
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
        q+="INSERT INTO parts(vehicle_make_model, garage_id, customer,  part_name, part_serial_number, part_status) VALUES ('"
	q+=r['vehicle_make_model'];
        q+="',";
        q+=curr.id
        q+=",'";
	q+=r['customer'];
	q+="','";
        q+=r['part_name'];
        q+="','";
        q+=r['part_serial_number'];
        q+="','"
        q+=r['part_status'];
        q+="');"

        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
         reply({"status": 200});;
    }
});


server.route({
    method: 'POST',
    path: '/addTimeSlot',
    handler: function(request, reply){
        var r=sanitized(request.payload);
        var timeslot=r['timeslot_time'];
        var q1="SELECT timeslots.timeslot_time FROM timeslots INNER JOIN garages ON garages.garage_id WHERE timeslots.timeslot_time ='"
        q1+=timeslot;
        q1+="';";
        var stat={"status": 0};
        connection.query(q1, function (error, results, fields){
            if (error){
                throw error;
            }
            console.log(results);
            var str=JSON.stringify(results);
            
            console.log(str);
            if(str=='[]'){
                console.log('hahah');
                stat.status=1;
                var q="INSERT INTO timeslots(garage_id,timeslot_time,timeslot_Booked) VALUES("
                 q+=r['garage_id'];
                 q+=",'"
                 q+=timeslot;
                 q+="',"
                 q+='1'
                 q+=");";         
                console.log(q);
                 connection.query(q, function (error, results, fields){
                    if (error)
                        throw error;
		reply({"status": 1});
                });
            }
	    else{
		reply(stat);
	    }
        });
    }
});

server.route({
    method: 'PUT',
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

server.route({
    method: 'GET',
    path: '/logout',
    handler: function (request, reply) {
        curr.id=0;
        curr.ip=null;
	curr.type=null;
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});

server.route({
    method: 'PUT',
    path: '/updatePartStatus',
    handler: function(request, reply){
        console.log(request.payload);
        var r=sanitized(request.payload)
        var q="";
        q+="UPDATE parts SET part_status ='";
        q+=r['part_status'];
        q+="' WHERE part_id=";
        q+=r['part_id'];
        q+=';';
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply({status:200});
    }
});

server.route({
    method: 'PUT',
    path: '/addCarToGarage',
    handler: function(request, reply){
        console.log(request.payload);
        var r=sanitized(request.payload)
        var q="";
        q+="UPDATE vehicles SET garage_id ='";
        q+=r['garage_id'];
        q+="' WHERE vehicle_id=";
        q+=r['vehicle_id'];
        q+=';';
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply({status:200});
    }
});

server.route({
    method: 'PUT',
    path: '/attachRepair',
    handler: function(request, reply){
        console.log(request.payload);
        var r=sanitized(request.payload)
        var q="";
        q+="UPDATE parts SET repair_id ='";
        q+=r['repair_id'];
        q+="' WHERE part_id=";
        q+=r['part_id'];
        q+=';';
	console.log("Processing a /attachRepair ");
	console.log("query = ", q);
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
        });
        reply({status:200});
    }
});

server.route({
    method: 'GET',
    path: '/showAllGarages',
    handler: function (request, reply) {
        console.log('Server processing a /showAllGarages request');
        var q='SELECT garage_id, garage_name, garage_location, garage_description FROM garages;'
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply ({"garages": results});
        });
    }
});

server.route({
    method: 'GET',
    path: '/lengthTable',
    handler: function(request, reply){
        var q="";
        q+="SELECT repair_id FROM repairs ORDER BY repair_id DESC LIMIT 1;";
	console.log(q);
        connection.query(q, function (error, results, fields){
            if (error)
                throw error;
	    reply({results});
        });
    }
});

server.route({
    method: 'GET',
    path: '/showAllUserCars',
    handler: function (request, reply) {
        console.log('Server processing a /showAllUserCars request');
        var q='SELECT * FROM vehicles NATURAL JOIN users WHERE user_id = ';
        q += curr.id;
        connection.query(q, function (error, results, fields) {
            if (error)
                throw error;
            reply (results);
        });
    }
});

server.route({
    method: 'GET',
    path: '/testHash',
    handler: function (request, reply) {
        var unHashed='passwordabc123';
        var hashed=hashPassword(unHashed)
        console.log('hash password: ',hashed);
        reply({'hash password':hashed});
    }
 });