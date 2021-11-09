const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x89oq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    console.log(process.env.DB_USER, process.env.DB_PASS)
    try {
        await client.connect();
        const database = client.db('doctors_portal');
        const appointmentsCollection = database.collection('appointments');
        const usersCollection = database.collection('users');
        console.log('connect to mdb')
        app.get('/appointments', async (req, res) => {
            const email = req.query.email;
            const date = new Date(req.query.date).toLocaleDateString();

            const query = { email: email, date: date }

            const cursor = appointmentsCollection.find(query);
            const appointments = await cursor.toArray();
            res.json(appointments);
        })

        app.post('/appointments', async (req, res) => {
            const appointment = req.body;
            const result = await appointmentsCollection.insertOne(appointment);
            console.log(result);
            res.json(result)
        });
        // save users
        app.post('/users', async (req, res) => {
            const user = req.body
            console.log(user)
            const filter = { email: user.email }
            const createdUser = {
                $set: { name: user.name }
            }
            const option = { upsert: true }
            console.log(user)
            const result = await usersCollection.updateOne(filter, createdUser, option)
            res.json(result)
        })
        // add admin role
         app.post('/addAdmin', async(req,res)=>{
             const user = req.body;
             const filter = {email : user.email}
             const updateDoc = {
                 $set: {role : 'admin'}
             }
             console.log(user.email)
             const result = await usersCollection.updateOne(filter, updateDoc)
             res.json(result)
         })

         // get admin role
         app.get('/getAdmin/:email', async(req,res)=>{
             const email = req.params.email;
             const query = {email: email,role:'admin'}
             const result = await usersCollection.findOne(query);
             console.log(result)
             let admin = {admin : false}
             if(result?.role == 'admin'){
                 admin.admin = true
             }
             res.json(admin)
         })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Doctors portal!')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})

// app.get('/users')
// app.post('/users')
// app.get('/users/:id')
// app.put('/users/:id');
// app.delete('/users/:id')
// users: get
// users: post
