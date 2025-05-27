const Listing = require("../models/listing.js");

//show Route (listing)
module.exports.index =async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};


//new route
module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
};


//show Route (listing)
module.exports.showListing =async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
};


//Create route
module.exports.createListing = async (req, res, next) => {
   let url =  req.file.path;
   let filename = req.file.filename
    if (!req.file) {
        req.body.listing.image = {
            url: "/public/img/default.jpg",
            filename: "default"
        };
    } else {
        req.body.listing.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    const newlisting = new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
    await newlisting.save();
    req.flash("success", "New listing created successfully!");
    res.redirect("/listings");
};


//edit route
module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
};

//update route
module.exports.updateListing = async(req,res)=>{
    let {id} = req.params;
    // Ensure image is always an object with a url property and set default if empty
    let imageUrl = req.body.listing.image;
    if (!imageUrl || imageUrl.trim() === "") {
        imageUrl = "/public/img/default.jpg";
    }
    req.body.listing.image = {
        url: imageUrl,
        filename: ""
    };
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined"){ 
    let url =  req.file.path;
    let filename = req.file.filename
    listing.image = {url,filename};
    await listing.save();
    }

    req.flash("success", "Updated successfully!");
    res.redirect(`/listings/${id}`);
};

//destroy route
module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
