const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const {ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const admin = require('firebase-admin');
const serviceAccount = require("./volunteer-network-gr-firebase-adminsdk-2ua1k-40d98b3708.json");
require('dotenv').config();


const app = express()
app.use(bodyParser.json());
app.use(cors());


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-gr.firebaseio.com"
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.phsvt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


client.connect(err => {
  const volunteersCollection = client.db("VolunteerNetwork").collection("allvolunteers");
  const volunteerMemberCollection = client.db("VolunteerNetwork").collection("volunteermembers");
  
  app.get('/', (req, res) =>{
    res.send('Wellcome Backend')
  })
  //POST
  app.post('/addVolunteer', (req, res) =>{
    const allvolunteers = req.body;
    volunteersCollection.insertMany(allvolunteers)
    .then(result =>{
      res.send(result.insertedCount)
    })
  })

  //POST volunteer member
  app.post('/addVolunteerMember', (req, res) =>{
    volunteerMemberCollection.insertOne(req.body)
    .then(result => {
      res.send(result.insertedCount > 0)
    })
  })

  //Delete VolunTeer Member
  app.delete('/deleteVolunteerMember/:id', (req, res) =>{
    volunteerMemberCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
      res.send(result.deletedCount > 0)
    })
  })

  //GET all volunteers
  app.get('/allVolunteersData', (req, res) =>{
    volunteersCollection.find({})
    .toArray((err, documents) =>{
      res.send(documents)
    })
  }) 

  //GET volunteer member
  app.get('/volunteersMember', (req, res) =>{
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')[1]
      // console.log({idToken})
      admin.auth().verifyIdToken(idToken)
      .then(decodedToken => {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email;
          if(tokenEmail === queryEmail){
            volunteerMemberCollection.find({email: queryEmail})
            .toArray((err, documents) =>{
              res.status(200).send(documents)
            })
          }
          else{
            res.status(401).send('Unauthorized access')
          }
      })
      .catch((err) =>{
        res.status(401).send('Unauthorized access')
      })
    }
    else{
      res.status(401).send('Unauthorized access')
    }
  }) 

  // GET allvolunteersMembers
  app.get('/allVolunteersMembers', (req, res) =>{
    volunteerMemberCollection.find({})
    .toArray((err, documents) =>{
      res.send(documents)
    })
  })

});


app.listen(4000, console.log('port 4000'))