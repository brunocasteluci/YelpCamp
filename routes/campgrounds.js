const express = require('express');
const Campground = require('../models/campground');
const middleware = require('../middleware/index');

const router = express.Router();

// INDEX - Show all Campgrounds
router.get('/', (req, res) => {
  // Get all campgrounds from DB
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log('Error!');
    } else {
      res.render('campgrounds/index', {
        campgrounds: allCampgrounds,
        currentUser: req.user
      });
    }
  });
});

// CREATE - ADD new campround to the DB

router.post('/', middleware.isLoggedIn, (req, res) => {
  // get data from form and add to campgrounds array
  let name = req.body.name;
  let price = req.body.price;
  let image = req.body.image;
  let dsc = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  let newCampground = {
    name: name,
    price: price,
    image: image,
    description: dsc,
    author: author
  };
  console.log(price);

  // Create new campground and save to the DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      // redirect back to campground page
      res.redirect('/campgrounds');
    }
  });
});

// NEW - Show from to create a new campground
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// SHOW - Shows more info about one campground
router.get('/:id', (req, res) => {
  // Find the campground with provided ID
  Campground.findById(req.params.id)
    .populate('comments')
    .exec((err, foundCampground) => {
      if (err) {
        console.log(err);
      } else {
        // render show template with that campground
        res.render('campgrounds/shows', { campground: foundCampground });
      }
    });
});

// EDIT Campground Route
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, function(err, foundCampground) {
    res.render('campgrounds/edit', { campground: foundCampground });
  });
});

// Update Campground Route
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  //find and update the correct campground

  Campground.findByIdAndUpdate(
    req.params.id,
    req.body.campground,
    (err, updatedCampground) => {
      if (err) {
        res.redirect('/campgrounds');
      } else {
        // redirect somewhere(show page)
        res.redirect('/campgrounds/' + req.params.id);
      }
    }
  );
});

// Destroy Camground Route
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, err => {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds');
    }
  });
});

module.exports = router;
