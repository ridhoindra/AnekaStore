const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const swaggerJsDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      version: "1.0.0",
      title: "Customer API",
      description: "AnekaStore",
      contact: {
        name: "Ridho Indra"
      },
      servers: ["http://localhost:3000"]
    }
  },
  // ['.routes/*.js']
  apis: ["app.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "prakerin"
  });
  db.connect(err => {
    if (err) throw err;
    console.log("Database connected");
  });


  /**
 * @swagger
 * /user:
 *  get:
 *    tags:
 *        - Get User
 *    description: Use to request all customers
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.get("/user",(req,res)=>{
    db.query(`select * from user`,
    (err, result) => {
      if (err) throw err;    
      res.json({
        message: "berhasil menampilkan data user",
        data: result
      });
    }
  );
})

/**
 * @swagger
 * /addUser:
 *  post:
 *    tags:
 *        - CRUD User
 *    description: Use to create a user data
 *    parameters:
 *        - name: reqBody
 *          description: request body
 *          in: body
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *              email:
 *                type: string
 *                format: email
 *              password: 
 *                type: string
 *            required:
 *                - username
 *                - email
 *                - password
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.post("/addUser", (req, res) => {
      const username= req.body.username;
      const email= req.body.email;
      const password= req.body.password;

    db.query('select count(email) as email from user where email = ?',email,(err,data)=>{
        if(err) throw err;
        if(data[0].email > 0){
            res.status(400).send('User already exist')
        }else{
            db.query('INSERT INTO user(username,email,password) Values("'+username+'","'+email+'","'+password+'")', function(err, result) {
                if (err) throw err;
                else {
                  res.status(200).json({
                    success: true,
                    message: "Data user masuk"
                  });
                }
              });
        }
    })

    // Coba Swagger
    // res.status(200).json({
    //   username,email,password
    // })
  });

  /**
 * @swagger
 * /editUser/{id}:
 *  put:
 *    tags:
 *        - CRUD User
 *    description: Use to edit a user data by id
 *    parameters:
 *        - name : id
 *          description: id to update
 *          in: path
 *          type: integer
 *          required: true
 *        - name: reqBody
 *          description: request body
 *          in: body
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *              alamat:
 *                type: string
 *              telepon: 
 *                type: string
 *              status:
 *                type: string
 *            required:
 *                - username
 *                - alamat
 *                - telepon
 *                - status
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.put("/editUser/:id", function(req, res) {
    let data = 
      'UPDATE user SET username="' +
      req.body.username +
      '", alamat="' +
      req.body.alamat +
      '", no_telp="' +
      req.body.telepon +
      '", status="' +
      req.body.status +
      '" where id=' +
      req.params.id;
    db.query(data, function(err, result) {
      if (err) throw err;
      else {
        res.status(200).json({
          success: true,
          message: "Data berhasil diupdate"
        });
      }
    });
  });
  
  /**
 * @swagger
 * /deleteUser/{id}:
 *  delete:
 *    tags:
 *        - CRUD User
 *    description: Use to delete a user data by id
 *    parameters:
 *        - name : id
 *          description: id to update
 *          in: path
 *          type: integer
 *          required: true
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.delete("/deleteUser/:id", function(req, res) {
    let id = "delete from user where id=" + req.params.id;
  
    db.query(id, function(err, result) {
      if (err) throw err;
      else {
        res.status(200).json({
          success: true,
          message: "Data berhasil dihapus"
        });
      }
    });
  });

  /**
 * @swagger
 * /softdelete/{id}:
 *  put:
 *    tags:
 *        - CRUD User
 *    description: Use to edit a status user data by id
 *    parameters:
 *        - name : id
 *          description: id to update
 *          in: path
 *          type: integer
 *          required: true
 *        - name: reqBody
 *          description: request body
 *          in: body
 *          schema:
 *            type: object
 *            properties:
 *              status:
 *                type: string
 *            required:
 *                - status
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.put("/softdelete/:id", function(req, res) {
    let data = 
      'UPDATE user SET status="' +
      req.body.status +
      '" where id=' +
      req.params.id;
    db.query(data, function(err, result) {
      if (err) throw err;
      else {
        res.status(200).json({
          success: true,
          message: "Data berhasil diupdate"
        });
      }
    });
  });


/**
 * @swagger
 * /api/login:
 *  post:
 *    tags:
 *        - API Login User
 *    description: Use to login as user
 *    parameters:
 *        - name: reqBody
 *          description: request body
 *          in: body
 *          schema:
 *            type: object
 *            properties:
 *              email:
 *                type: string
 *                format: email
 *              password: 
 *                type: string
 *            required:
 *                - email
 *                - password
 *    responses:
 *      '200':
 *        description: A successful response
 */
app.post("/api/login", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    const date = new Date()
    const sql = "SELECT * FROM user WHERE email = ? AND password = ? AND status = 'ACTIVE'"; // mencocokkan data form dengan data tabel
    if (email && password) {
      // jika email dan password ada
      db.query(sql, [email, password], function(err, rows) {
        if (err) throw err;
        // jika error akan menampilkan errornya
        else if (rows.length > 0) {
            db.query('update user set last_login_at = ? where email = ?',[date,email],(err,result)=>{
                jwt.sign(
                    
                    { email, password },
                    "SuperSecRetKey",
                    {
                      expiresIn: 60 * 60 * 7 // waktu durasi token yang dikeluarkan
                    },
                    (err, token) => {
                      res.send(token); // menampilkan token yang sudah ada
                    }
                  );
            })
        } else {
          res.json({
            message: "Email dan Password salah atau tidak tersedia"
          }); // jika semua if tidak terpenuhi maka menampilkan kalimat tersebut
        }
      });
    }
  });

  /**
 * @swagger
 * /api/editUser/{id}:
 *  put:
 *    tags:
 *        - API Edit User
 *    description: Use to edit a user data by id
 *    parameters:
 *        - name : id
 *          description: id to update
 *          in: path
 *          type: integer
 *          required: true
 *        - name: reqBody
 *          description: request body
 *          in: body
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *              alamat:
 *                type: string
 *              telepon: 
 *                type: string
 *              password:
 *                type: string
 *            required:
 *                - username
 *                - alamat
 *                - telepon
 *                - password
 *    responses:
 *      '200':
 *        description: A successful response
 */
  app.put("/api/editUser/:id", function(req, res) {
    let data = 
      'UPDATE user SET username="' +
      req.body.username +
      '", alamat="' +
      req.body.alamat +
      '", no_telp="' +
      req.body.telepon +
      '", password="' +
      req.body.password +
      '" where id=' +
      req.params.id;
    db.query(data, function(err, result) {
      if (err) throw err;
      else {
        res.status(200).json({
          success: true,
          message: "Data berhasil diupdate"
        });
      }
    });
  });
app.listen(port, () => console.log(`Example app listening on port port!`))