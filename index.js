const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors');
const {ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


const app = express()
app.use(bodyParser.json());
app.use(cors())

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
  app.get('/allVolunteers', (req, res) =>{
    volunteersCollection.find({})
    .toArray((err, documents) =>{
      res.send(documents)
    })
  }) 

  //GET volunteer member
  app.get('/volunteersMember', (req, res) =>{
    volunteerMemberCollection.find({})
    .toArray((err, documents) =>{
      res.send(documents)
    })
  }) 

});


app.listen(4000, console.log('port 4000'))