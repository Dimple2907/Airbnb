const Listing = require("../models/listing.js");

//show Route (listing) with search and filters
module.exports.index = async(req,res)=>{
    let { search, category, minPrice, maxPrice, country, location, sortBy } = req.query;
    
    // Build query object
    let query = {};
    
    // Search functionality
    if (search && search.trim() !== '') {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
            { country: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Category filter (based on title/description keywords)
    if (category && category !== 'all') {
        const categoryKeywords = {
            trending: ['trending', 'popular', 'hot'],
            rooms: ['room', 'bedroom', 'private'],
            food: ['kitchen', 'restaurant', 'dining'],
            wifi: ['wifi', 'internet', 'wireless'],
            pool: ['pool', 'swimming', 'swim'],
            cities: ['city', 'urban', 'downtown'],
            beach: ['beach', 'coastal', 'ocean', 'sea'],
            mountains: ['mountain', 'hill', 'valley'],
            castles: ['castle', 'palace', 'historic'],
            adventure: ['adventure', 'hiking', 'outdoor'],
            hiking: ['hiking', 'trail', 'nature']
        };
        
        if (categoryKeywords[category]) {
            const keywords = categoryKeywords[category];
            query.$or = [
                ...(query.$or || []),
                ...keywords.map(keyword => ({ title: { $regex: keyword, $options: 'i' } })),
                ...keywords.map(keyword => ({ description: { $regex: keyword, $options: 'i' } }))
            ];
        }
    }
    
    // Price range filter
    if (minPrice && !isNaN(minPrice)) {
        query.price = { ...query.price, $gte: parseInt(minPrice) };
    }
    if (maxPrice && !isNaN(maxPrice)) {
        query.price = { ...query.price, $lte: parseInt(maxPrice) };
    }
    
    // Location filter
    if (location && location.trim() !== '') {
        query.location = { $regex: location, $options: 'i' };
    }
    
    // Country filter
    if (country && country.trim() !== '') {
        query.country = { $regex: country, $options: 'i' };
    }
    
    // Build sort object
    let sort = {};
    switch(sortBy) {
        case 'priceHigh':
            sort.price = -1;
            break;
        case 'priceLow':
            sort.price = 1;
            break;
        case 'newest':
            sort.createdAt = -1;
            break;
        case 'oldest':
            sort.createdAt = 1;
            break;
        default:
            sort.title = 1;
    }
      try {
        const allListings = await Listing.find(query).sort(sort);
        
        // Helper function to remove parameters for filter tags
        const removeParam = (paramToRemove, searchParams) => {
            const params = new URLSearchParams();
            const paramsToRemove = Array.isArray(paramToRemove) ? paramToRemove : [paramToRemove];
            
            Object.keys(searchParams).forEach(key => {
                if (!paramsToRemove.includes(key) && searchParams[key]) {
                    params.append(key, searchParams[key]);
                }
            });
            
            return `/listings${params.toString() ? '?' + params.toString() : ''}`;
        };
        
        res.render("listings/index.ejs", { 
            allListings, 
            searchParams: { search, category, minPrice, maxPrice, country, location, sortBy },
            removeParam 
        });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong while searching!");
        res.redirect("/listings");
    }
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

//Search suggestions API
module.exports.searchSuggestions = async(req, res) => {
    try {
        const { q, type } = req.query;
        
        if (!q || q.trim().length < 2) {
            return res.json([]);
        }
        
        let suggestions = [];
        
        if (type === 'location') {
            // Get unique locations
            suggestions = await Listing.distinct('location', {
                location: { $regex: q, $options: 'i' }
            });
        } else if (type === 'country') {
            // Get unique countries
            suggestions = await Listing.distinct('country', {
                country: { $regex: q, $options: 'i' }
            });
        } else {
            // General search suggestions from titles and descriptions
            const titleSuggestions = await Listing.find({
                title: { $regex: q, $options: 'i' }
            }).select('title').limit(5);
            
            suggestions = titleSuggestions.map(listing => listing.title);
        }
        
        // Limit suggestions to 10 items
        suggestions = suggestions.slice(0, 10);
        
        res.json(suggestions);
    } catch (error) {
        console.error(error);
        res.status(500).json([]);
    }
};
