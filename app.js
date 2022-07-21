let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let cors = require('cors');

let dotenv = require('dotenv');
dotenv.config()
let port = process.env.PORT || 9870;
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
// let mongoUrl = process.env.MonogUrl;
let mongoUrl = process.env.MonogLiveUrl;
let db;

// Middleware (Supporting Libraries)
app.use(bodyParser.urlencoded({ extended:true}))
app.use(bodyParser.json());
app.use(cors());

// Default Route
app.get('/', (req, res) => {
    res.send(`Express Server Default Route`);
})

//One Routes for all
// app.get('/item/:collections', (req,res) => {
//     db.collection(req.params.collections).find().toArray((err, result) => {
//         if (err) throw err;
//         res.send(result);
//    }) 
// })

// Location Route
app.get('/location', (req, res) => {
    db.collection('location').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})



// Restaurant Route
app.get('/restaurant', (req, res) => {
    let stateId = Number(req.query.stateId);
    let mealId = Number(req.query.mealId);
    let query = {}

    if (stateId) {
        query = { state_id: stateId }
    }

    if (stateId && mealId) {
        query = { state_id: stateId, "mealTypes.mealtype_id": mealId }
    }

    else if (mealId) {
        query = { "mealTypes.mealtype_id": mealId }
    }
    db.collection('Restaurants').find(query).toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })

})


// MealType Route
app.get('/mealType', (req, res) => {
    db.collection('MealTypes').find().toArray((err, result) => {
        if (err) throw err;
        res.send(result);
    })
})

// Filters Route

app.get('/filter/:mealId', (req, res) => {
    let mealId = Number(req.params.mealId);
    let cuisineId = Number(req.query.cuisineId);
    let lcost = Number(req.query.lcost);
    let hcost = Number(req.query.hcost);
    let sort = { cost: 1 }  // defaul sort value
    let query = {}

    if (req.query.sort) {
        sort = { cost: req.query.sort }
    }

    if (lcost && hcost && cuisineId) {
        query =
        {
            'mealTypes.mealtype_id': mealId,
            $and: [{ cost: { $gt: lcost, $lt: hcost } }],
            'cuisines.cuisine_id': cuisineId
        }
    }

    else if (lcost && hcost) {
        query =
        {
            'mealTypes.mealtype_id': mealId,
            $and: [{ cost: { $gt: lcost, $lt: hcost } }]
        }
    }


    else if (cuisineId) {
        query =
        {
            'mealTypes.mealtype_id': mealId,
            'cuisines.cuisine_id': cuisineId
        }
    }
    else {
        query = {
            'mealTypes.mealtype_id': mealId
        }
    }



    db.collection('Restaurants').find(query).sort(sort).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })


})

// Restaurants Details 
// On the basis of ObjectId;

// app.get('/details/:id', (req, res) => {

//     let id = mongo.ObjectId(req.params.id);

//     db.collection('Restaurants').find({_id:id}).toArray((err, result) => {
//         if (err) throw err;
//         res.send(result)
//     })

// })


// menu on the basis of user selected id -
app.post('/menuItem', (req, res) => {
    if(Array.isArray(req.body)){
        db.collection('RestaurantsMenu').find({menu_id:{$in:req.body}}).toArray((err, result) => {
            if(err) throw err;
            res.send(result);
        })
    }else{
        res.send('Invalid Input')
    }
})


// On the basis of Normal id;

app.get('/details/:id', (req, res) => {

    let id = Number(req.params.id);

    db.collection('Restaurants').find({restaurant_id:id}).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

// Menu Routing

app.get('/menu/:id', (req, res) => {

    let id = Number(req.params.id);

    db.collection('RestaurantsMenu').find({restaurant_id:id}).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

// Order- 
app.get('/orders', (req, res) => {

    let email = req.query.email;
    let query = {}

    if(email){
        query = {email:email}
    }

    db.collection('Orders').find(query).toArray((err, result) => {
        if (err) throw err;
        res.send(result)
    })
})

// Placed Order (POST)

app.post('/placeOrder', (req,res) => {
    db.collection('Orders').insert(req.body, (err, result) => {
        if(err) throw err;
        res.send(result);
    });
})



// Update Order
 app.put('/updateOrder/:id', (req,res) => {
    let oid = Number(req.params.id);
    db.collection('Orders').updateOne(
        {orderId:oid},
        {
            $set: {
                "status": req.body.status,
                "bank_name": req.body.bank_name,
                "date": req.body.date,
            }
        },(err,result) => {
            if(err) throw err;
            res.send("Order Updated")
        }
    )
 })



// Deleting Order

app.delete('/deleteOrder/:id', (req, res) => {
     let oid = mongo.ObjectId(req.params.id);
     db.collection('Orders').remove({_id:oid}, (err,result) => {
        if(err) throw err;
        res.send('Order deleted successfully');
     })
})











// Connecting MongoDB 
MongoClient.connect(mongoUrl, (err, client) => {
    if (err) console.log(`Error While Connecting`);
    db = client.db('internfeb');
    app.listen(port, (err) => {
        if (err) throw err;
        console.log(`Express Server listening on port ${port}`)
    })
})


// Param QueryParam Concept
// app.get('/restaurants/:id',(req,res) => {
//     let id = req.params.id;
//     let state = req.query.state;
//     let country = req.query.country;

//     console.log(`>>>>>>>state`,state);
//     console.log(`>>>>>>>country`,country);
//     res.send(id);
// })