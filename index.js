const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nuk8vmz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        app.get('/home-toys', async (req, res) => {
            const result = await toysCollection.find().toArray()
            res.send(result)
        })

        const toysCollection = client.db('heroicHavensDB').collection('toys')

        const indexKeys = { name: 1 }
        const indexOptions = { name: 'toysTitle' }

        const result = await toysCollection.createIndex(indexKeys, indexOptions)

        app.get('/all-toys', async (req, res) => {
            const cursor = toysCollection.find().limit(20)
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })

        app.get('/toySearchByTitle/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toysCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: "i" } }
                ],
            }).toArray()
            res.send(result)
        })

        app.get('/mytoySearch/:text', async (req, res) => {
            const searchText = req.params.text;
            const email = req.query.email;
            const sortOrder = req.query.sortOrder || 'asc';
            const result = await toysCollection.find({
                $or: [
                    { name: { $regex: searchText, $options: "i" } }
                ],
                email: email
            }).sort({ price: sortOrder === 'asc' ? 1 : -1 }).toArray()
            res.send(result)
        })

        app.get('/mytoys/:email', async (req, res) => {
            const email = req.params.email;
            const sortOrder = req.query.sortOrder || 'asc';
            const result = await toysCollection.find({ email: email }).sort({ price: sortOrder === 'asc' ? 1 : -1 }).toArray();
            res.send(result)
        })

        app.get('/updatetoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.findOne(query)
            res.send(result)
        })


        app.post('/add-toys', async (req, res) => {
            const toys = req.body
            const result = await toysCollection.insertOne(toys)
            res.send(result)
        })



        app.put('/updatetoys/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            // console.log(id, toy);
            const filter = { _id: new ObjectId(id) }
            const updateToys = {
                $set: {
                    name: toy.name,
                    subcategory: {
                        value: toy.subcategory.value,
                        label: toy.subcategory.label,
                    },
                    price: parseInt(toy.price),
                    quantity: parseInt(toy.quantity),
                    photo: toy.photo,
                    rating: toy.rating,
                    description: toy.description
                }
            }
            const result = await toysCollection.updateOne(filter, updateToys)
            res.send(result)
        })


        app.delete('/deletetoys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toysCollection.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Heroic Havens is Running....')
})


app.listen(port, () => {
    console.log(`Heroic Havens Server Running on Port : ${port}`);
})