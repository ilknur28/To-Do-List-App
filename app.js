//jshint esversion: 6
const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + "/currentDate.js"); // Calling Created module currentDate.js
const _ = require('lodash');

const app = express();
var port = 3000;

let day = date.getweekDay(); // assigning into variable the calling the function from currentDate module

app.set('view engine', 'ejs'); // Using EJS as view engine

app.use(express.static("public")); // Serve up the public folder as a static resource
app.use(bodyParser.urlencoded({
  extended: true
}));

//---------------------------------DB ---------------------------------
const mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
}); // Creating a new DB inside MongoDB

const itemsSchema = mongoose.Schema({ // Creating Schema
  name: {
    type: String,
    required: true
  }
});

const Item = mongoose.model('Item', itemsSchema); // Creating DB model

const item1 = new Item({
  name: "Welcome to Your To Do List"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<--Hit this button to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema] //
};
const List = mongoose.model("List", listSchema); // Creating List model from listSchema


//-----------------------------------------------------------------------End DB

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("defaultItems added to WS");
        }
      });
      res.redirect("/");
    } else {
      res.render('list', { //Rendering the list file
        listTitle: day,
        newListItems: foundItems //Array with the DB collection documents
      });
    }
  });
});

app.get("/:customListName", function(req, res) { // Express route param
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {

    if (!err) {
      if (!foundList) { // list doesn`t exist
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else { // Show an existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items //Array with the DB collection documents
        });
      }
    }
  });
});

app.post("/", function(req, res) {
  let taskName = req.body.newItem; // Grab value from the input
  let listName = req.body.list; // Grab the h1 from current page

  const item = new Item({ // Creating a new document
    name: taskName
  });

  if (listName === day) { // Checking in which list we try to add the item/task
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) { // Deleting Item from our DB

  let list = req.body.list; // Grab the h1 from current page
  const checkedItemsId = req.body.checkBox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.deleteOne({
      _id: checkedItemsId
    }, function(err) {
      if (err) {
        console.log("Error when deleting item");
      } else {
        console.log("Item Deleted");
      }
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemsId
        }
      }
    }, function(err, foundList) {
      if (!err) {
        console.log("Item Deleted");
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/about", function(req, res) {
  res.render("about", {
  });
});

app.listen(port, function() {
  console.log("Server is running on port  " + port);
});
