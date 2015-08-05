var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var multer = require('multer');
var db = require('monk')('localhost/nodeblog');



// Multer Storage para mantener la extenteción del archivo.
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads/'); // Directirio donde se guardaran los archivos.
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  }
});
var upload = multer({ storage: storage});


// HomePage Blog Posts 
router.get('/add', function(req, res, next) {
	var categories = db.get('categories');
	categories.find({},{},function(err, categories){
		res.render('addpost',{
			title: 'Add Post',
			categories: categories
		}); 
	});
	
});

router.post('/add', upload.single('mainimage'), function(req, res, next) {
	//get form values
	var title 		= req.body.title;
	var category 	= req.body.category;
	var body 		= req.body.body;
	var author		= req.body.author;
	var date 		= new Date();  
	
	
	// Check for image Field
	if(req.file){
		console.log('uploading file...');
		console.log(req.file);
		//File Info		
		var mainImageName 			= req.file.filename;
	}else{
		//Set a Default Image
		var mainImageName			= 'noImage.png';
	}
	
	//Form Validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body','Body field is required').notEmpty();
	
	//Check for errors
	var errors = req.validationErrors();
	
	//Save Post
	if (errors){
		res.render('addposts',{
			errors: errors,
			title: title,
			body: body
		});
	}else{
		var posts = db.get('posts');
		
		
		posts.insert({
			title: title,
			body: body,
			category: category,
			date: date,
			author: author,
			mainimage: mainImageName
		}, function(err, posts){
			if (err) {
				res.send('There was an issue submitting the post');
				
			}else{
				req.flash('success', 'Post Submitted');
				res.location('/');
				res.redirect('/');
			}
			
		});
		
	}
});

router.post('/addcomment', function(req, res, next) {
	//get form values
	var name 			= req.body.name;
	var email 			= req.body.email;
	var body	 		= req.body.body;
	var postid			= req.body.postid;
	var commentdate 	= new Date();  
	
	//Form Validation
	req.checkBody('name','Name field is required').notEmpty();
	req.checkBody('email','Email field is required').notEmpty();
	req.checkBody('email','Email field is required').isEmail();
	req.checkBody('body','Body field is required').notEmpty();
	
	
	var errors = req.validationErrors();
	
	//Save Post
	if (errors){
		var posts = db.get('posts');
		posts.findById(postid,function(err, post){
			res.render('show',{
				errors: errors,			
				post: post
			}); 
		});
	}else{
		var comment = {name : name, email: email, body: body, commentdate: commentdate}
		var posts = db.get('posts');
		posts.update({
			_id: postid
		},
		{
			$push:{
				comments: comment
			}
		},
		function (err, doc){
			if (err){
				throw err;
			} else{
				req.flash('success','Comment Added');
				res.location('/posts/show/'+postid);
				res.redirect('/posts/show/'+postid);
				
			}
			
		}
	);
		
	}
	
});

router.get('/show/:id', function(req, res, next) {
	var posts = db.get('posts');
	posts.findById(req.params.id,function(err, post){
		res.render('show',{			
			post: post
		}); 
	});
	
});



module.exports = router;
