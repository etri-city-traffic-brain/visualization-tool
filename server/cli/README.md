# Mongo DB Installation
## reference
https://medium.com/founding-ithaka/setting-up-and-connecting-to-a-remote-mongodb-database-5df754a4da89

### ssh local port forwarding
```
ssh -i saltvmkeypair.pem -L 27017:127.0.0.1:27017 ubuntu@180.210.14.99
```

## mongoose usage example

```javascript
db.links.find({
  "properties.LINK_ID": {
    $in: [ "201", "200" ]
  } } )

  db.links.find({
  "properties.LINK_ID": {
    $in: [ "200" ]
  } } )


db.links.find({
  "properties.LINK_ID": {
    $in: links
  } } )

db.links.find({ 
  geometry: { 
    $geoWithin: { 
      $geometry: { 
        type: "Polygon", 
        coordinates: [[
          [ 127.133346, 37.550883 ],
          [ 127.161813, 37.550928],
          [ 127.150096, 37.536782 ],
          [ 127.133346, 37.550883 ],
        ]]
      } 
    } 
  }
})
```

## create INdex
```
db.cells.createIndex({geometry: '2dsphere'})
```

#### aggregation

```javascript
db.test.aggregate([
{
  $match: {name: { $in: ['user1', 'user2']}},
},
{
  $group: {_id:'$name', speeds: {$avg:'$mark'}}
},
])
```

##### aggregation example
```
db.inventory.insertMany([
  {linkId: 1, cellId: 10, values:[1,2,3]},
  {linkId: 1, cellId: 11, values:[4,5,6]},
  {linkId: 2, cellId: 21, values:[7,8,9]},
  {linkId: 3, cellId: 31, values:[9,8,7]},
]);

db.inventory.aggregate(
   [
      {
        $group : {
           _id : '$linkId',
		   values: { $push: '$values'},
        }
      }
   ]
)

```

### simulation result collection
```javascript
[
  {
    linkId: 000000001,
    cellId: 0000000010,
    values: [10, 20, 30, ...],
  }
]
```