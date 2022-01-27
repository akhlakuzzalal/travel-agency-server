const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectId
require('dotenv').config();


const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

// Connect with mongo DB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rolps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// mongoDB connection
async function run() {
   try {
      await client.connect();
      const database = client.db('blackcoffer');
      const dataCollection = database.collection('data');
      const articleCollection = database.collection('article');

      // get approve Blogs
      app.get('/data', async (req, res) => {
         const page = req.query.page;
         const size = parseInt(req.query.size);
         const query = { stutus: "Approved" };
         const cursor = dataCollection.find(query);
         let data;
         const count = await cursor.count();
         if (page) {
            data = await cursor.skip((page - 1) * size).limit(size).toArray();
         }
         else {
            data = await cursor.toArray();
         }
         res.json({ data, count });
      });

      // All Blogs
      app.get('/blogs', async (req, res) => {
         const page = req.query.page;
         const size = parseInt(req.query.size);
         const cursor = dataCollection.find({});
         let data;
         const count = await cursor.count();
         if (page) {
            data = await cursor.skip((page - 1) * size).limit(size).toArray();
         }
         else {
            data = await cursor.toArray();
         }
         res.json({ data, count });
      });

      // Blog Details
      app.get('/details/:id', async (req, res) => {
         const id = req.params;
         const query = { _id: ObjectID(id) }
         const cursor = dataCollection.find(query);
         const result = await cursor.toArray();
         res.json(result);
      });

      // Update Stutus
      app.put('/blogs/:id', async (req, res) => {
         const id = req.params.id;
         const stutus = req.body.stutus;
         const filter = { _id: ObjectID(id) };
         const option = { upsert: true };
         const updateDoc = {
            $set: {
               stutus: stutus
            }
         };
         const result = await dataCollection.updateOne(filter, updateDoc, option);
         res.json(result);
      })

      //Delete a Blog
      app.delete('/deleteblog/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectID(id) };
         const result = await dataCollection.deleteOne(query);
         res.json(result);
      });
      app.delete('/deletearticle/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectID(id) };
         const result = await articleCollection.deleteOne(query);
         res.json(result);
      });

      // Post a article
      app.post('/articlepost', async (req, res) => {
         const article = req.body;
         const result = await articleCollection.insertOne(article);
         res.json(result);
      });
      // post a blog
      app.post('/blogpost', async (req, res) => {
         const blog = req.body;
         const result = await dataCollection.insertOne(blog);
         res.json(result);
      });

      // get article
      app.get('/articles', async (req, res) => {
         const cursor = articleCollection.find({});
         const result = await cursor.toArray();
         res.json(result);
      })

      // UpdateArticle 
      app.put('/updatearticle/:id', async (req, res) => {
         const id = req.params.id;
         const stutus = req.body;
         console.log(stutus)
         const filter = { _id: ObjectID(id) };
         const option = { upsert: true };
         const updateDoc = {
            $set: {
               image: stutus.image,
               title: stutus.title,
               info: stutus.info,
               field: stutus.field,
               catagory: stutus.catagory,
               cost: stutus.cost,
               location: stutus.location
            }
         };
         const result = await articleCollection.updateOne(filter, updateDoc, option);
         res.json(result);
      })

      // get one article
      app.get('/article/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectID(id) }
         const result = await articleCollection.findOne(query);
         res.json(result);
      });

   }

   finally {
      // await client.close();
   }
}
run().catch(console.dir)

app.get('/', (req, res) => {
   res.send('Running blackcoffer serverm side');
});

app.listen(port, () => console.log('running on', port));