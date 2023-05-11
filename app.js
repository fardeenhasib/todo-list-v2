//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true })

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const itemOne = new Item({
  name: "Welcome to our todolist",
});

const itemTwo = new Item({
  name: "Hit + button to add a new item",
});


const itemThree = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [itemOne, itemTwo, itemThree]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {

  Item.find({}, function (err, data) {
    if (data.length === 0) {
      const defaultItems = [itemOne, itemTwo, itemThree];

      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Data was successfully inserted");
        }
      });
      res.redirect("/");
    }

    res.render("list", { listTitle: "Today", newListItems: data });
  });

});

app.get("/:customList", function (req, res) {
  const customList = req.params.customList;
  List.findOne({ name: customList }, function (err, foundResult) {
    if (!err) {
      if (foundResult) {
        console.log(foundResult)
        res.render("list", { listTitle: customList, newListItems: foundResult.items })

      } else {
        // painai. ekhn new list create korbo eitar jonno
        const listForNewRoute = new List({
          name: customList,
          items: defaultItems
        })
        listForNewRoute.save();
        res.redirect("/" + customList);

      }

    }
  })
})

app.post("/", function (req, res) {

  const item = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: item,
  });



  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    // save in corresponding list
    List.findOne({ name: listName }, function (err, foundResult) {
      if (err) { console.log("Something went wrong") }
      else {
        // no error 
        foundResult.items.push(newItem);
        foundResult.save();
        res.redirect("/" + listName);
      }
    })
  }

});

app.post("/delete", function (req, res) {
  const deletedItemID = req.body.deletedItem;
  Item.findByIdAndRemove(deletedItemID, function (err) {
    if (!err) {
      console.log("Item Successfully deleted");
      res.redirect("/");
    }
  })
})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
