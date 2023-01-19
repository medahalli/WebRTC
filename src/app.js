let express = require( 'express' );
let app = express();
let stream = require( './ws/stream' );
let path = require( 'path' );
const bcrypt = require('bcrypt');

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('Data_Base.db');

const {openDb} = require("../db");

const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


const session = require('express-session');

const port = process.env.PORT || 8081;
const env = process.env.NODE_ENV || 'development';

var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('src/sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('src/sslcert/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};



// Redirect to https
// app.get('*', (req, res, next) => {
//     if (req.headers['x-forwarded-proto'] !== 'https' && env !== 'development') {
//         return res.redirect(['https://', req.get('Host'), req.url].join(''));
//     }
    
//     next();
// });

// Set views path
app.set('views', path.join(__dirname, 'views'));
// Set public path
app.use(express.static(path.join(__dirname, 'public')));
// Set pug as view engine
app.set('view engine', 'pug');
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

//app.set('trust proxy', 1)
app.use(session(
    {
        secret: 'secret key',
        resave: true,
        rolling: true,
        saveUninitialized: true,
        cookie: { 
            maxAge: 1000 * 3600 //ms    
        },
        saveUninitialized: true
    }
))





app.get('/', async (req, res)=>{
  if(!req.session.pseudo){
      res.redirect('/authen')
  }else{
      let db_select = await openDb();
     
      let user = {
          id : req.session.user_id,
          pseudo : req.session.pseudo
      }
      let data = {
          user : user,
          tag : req.session.tag
      }
      res.render("index.pug", { user: user.pseudo});
  }
});


app.get('/inscription', (req, res)=>{

  res.render('inscription.pug');

});

/*app.post('/inscription', (req, res)=>{
  // Checking info & saving data
  db.run(`
      INSERT INTO Users(pseudo, email, password)
      VALUES
          (?, ?, ?);
  `, req.body.pseudo, req.body.email, req.body.password);
  res.redirect('/');
});*/

app.get('/authen', (req, res)=>{

  data = {
      err_msg : ""
  }
  res.render('authen.pug', data);

});





app.post('/inscription', (req, res)=>{
  // Génération du sel
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function(err, salt) {
    // Chiffrement du mot de passe
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      // Sauvegarde des informations dans la base de données
      db.run(`
          INSERT INTO Users(pseudo, email, password)
          VALUES
              (?, ?, ?);
      `, req.body.pseudo, req.body.email, hash);
      res.redirect('/');
    });
  });
});



/*app.post('/authen', (req, res)=>{
    // Récupération du mot de passe stocké dans la base de données
    db.get(`
        SELECT * FROM Users WHERE email = ?;
    `, req.body.email, (err, row) => {
      if (row) {
        // Comparaison du mot de passe entré avec celui stocké chiffré
        bcrypt.compare(req.body.password, row.password, function(err, match) {
          if (match) {
            // Si les mots de passe correspondent, connecter l'utilisateur
            req.session.authenticated = true;
            res.redirect('/');
          } else {
            // Sinon, afficher un message d'erreur
            res.render('authen.pug', {err_msg: "Mot de passe incorrect"});
          }
        });
      } else {
        // Si l'utilisateur n'est pas trouvé, afficher un message d'erreur
        res.render('authen.pug', {err_msg: "Utilisateur non trouvé"});
      }
    });
  });*/




  app.post('/authen', (req, res)=>{
    // Récupération des informations de l'utilisateur
    err_msg = "2892";
    err = false;
    db.get("SELECT * FROM Users WHERE email = ?", [req.body.email],
    (err, row)=>{
        if(typeof row === 'undefined'){
            err_msg = "There is no user with this email";
            err = true;
        }
    
        // Comparaison des mots de passe
        bcrypt.compare(req.body.password, row.password, function(err, result) {
        if(result == true) {
        // Connexion de l'utilisateur
            req.session.authenticated = true;
            req.session.email = row.email
            req.session.user_id = row.id
            req.session.pseudo = row.pseudo
            res.redirect('/');
        } else {
        // Erreur de mot de passe
                data = {
                    err_msg : "Mot de passe incorrect"
                }
                res.render('authen.pug', data);
        }
        });
         
    });
    });





  

/*app.post('/authen', (req, res)=>{
  // Checking info & saving data
  err_msg = "2892";
  err = false;
  db.get("SELECT password FROM Users WHERE email = ?", [req.body.email],
  (err, row)=>{
      if(typeof row === 'undefined'){
          err_msg = "There is no user with this email";
          err = true;
      }
      console.log(req.body.password);
      console.log(row.password);
      bcrypt.compare(req.body.password, row.password, function(err, result) {
        if(result === false) {
            err_msg = "Wrong password";
            err = true;
        }
      })
      

      if(err){
          data = {
              err_msg : err_msg
          }
          res.render('authen.pug', data);
      }else{
          req.session.user_id = row.id
          req.session.pseudo = row.pseudo
          req.session.email = row.email
          res.redirect('/');
      }
  });
});*/


app.get('/deconnect', (req, res)=>{
    req.session.destroy()
    res.redirect('/')
  })




// app.get( '/', ( req, res ) => {
//     res.sendFile( __dirname + '/index.html' );
// } );



const server = https.createServer(credentials, app);
server.listen(port, () => {
    console.log(`listening on port ${port}`);
});

let io = require( 'socket.io' )( server );


/**
 * Socket.io events
 */
io.of( '/stream' ).on( 'connection', stream );
