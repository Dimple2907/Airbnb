const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const {isLoggedIn ,isOwner, validateListing} = require('../middleware.js');

const listingController = require('../controllers/listing.js');



//file uploads
const multer = require('multer');
const {storage} = require('../cloudConfig.js');
const upload = multer({storage});

router
    .route("/")
    .get(wrapAsync(listingController.index))  //index route with search
    .post(
        isLoggedIn,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync(listingController.createListing)
    );

// Search route
router.get("/search", wrapAsync(listingController.index));

// Search suggestions API
router.get("/api/suggestions", wrapAsync(listingController.searchSuggestions));

//New route
router.get("/new",isLoggedIn,listingController.renderNewForm);

router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))   //show route
    .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing ,wrapAsync(listingController.updateListing))  //update route
    .delete(isLoggedIn,isOwner,wrapAsync (listingController.destroyListing));   //delete route



//edit route
router.get("/:id/edit", isLoggedIn,isOwner,wrapAsync(listingController.renderEditForm));

module.exports = router;