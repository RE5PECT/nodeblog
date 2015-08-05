var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var multer = require('multer');
var db = require('monk')('localhost/nodeblog');



// HomePage Blog Posts 
router.get('/add', function(req, res, next) {
	res.render('addcategory',{
		title: 'Add Category'
	})
});

router.post('/add', function(req, res, next) {
	//get form values
	var title 		= req.body.title;
	
	//Form Validation
	req.checkBody('title','Title field is required').notEmpty();
	
	//Check for errors
	var errors = req.validationErrors();
	
	//Save Post
	if (errors){
		res.render('addcategory',{
			errors: errors
		});
	}else{
		var categories = db.get('categories');
		
		
		categories.insert({
			title: title
		}, function(err, category){
			if (err) {
				res.send('There was an issue submitting the category');
				
			}else{
				req.flash('success', 'Category Submitted');
				res.location('/');
				res.redirect('/');
			}
			
		});
		
	}
});

module.exports = router;
