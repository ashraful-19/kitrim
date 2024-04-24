const express = require ("express");
const {User} = require("../models/userModel");
const {Post} = require("../models/postModel");
const slugify = require('slugify');


const getIndex = async (req, res) => {
  try {
    const posts = await Post.find()
    .sort({ createdAt: -1 }) 
    .limit(3); 
    res.render('issb/index.ejs', { posts });

  } catch (error) {
    console.log(error.message);
    // Handle errors appropriately
    res.status(500).send('Internal Server Error');
  }
};



const getAllBlogs = async (req, res) => {
  try {
    const posts = await Post.find()
    .sort({ createdAt: -1 }); 
    res.render('issb/all_blog.ejs', { posts });

  } catch (error) {
    console.log(error.message);
    // Handle errors appropriately
    res.status(500).send('Internal Server Error');
  }
};


const getReadBlog = async (req, res) => {
  try {
  
    
    const slug = req.params.slug;

    const post = await Post.findOne({slug: slug});
    post.views++;
    await post.save();
    const posts = await Post.find();
    
    res.render('issb/read-blog.ejs', { post, posts });

  } catch (error) {
    console.log(error.message);
    // Handle errors appropriately
    res.status(500).send('Internal Server Error');
  }
};




const getUpdateBlog = async (req, res) => {
  try {
    // Retrieve all posts from the Post model
    const posts = await Post.find();
// console.log(posts)
 const id = req.query.id;

 let singlePost;
    if (id) {
      singlePost = await Post.findById(id);
    }

    res.render('issb/blog-admin.ejs', { posts, id, singlePost });

  }  catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};



const deleteBlog = async (req, res) => {
  try {
      const id = req.params.id;
    
      await Post.findByIdAndDelete(id);


      res.redirect('/admin/blog-post');

  }  catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


  const updateBlog = async (req, res) => {
    try {
      // If req.body.id exists, update the post
      const slug = slugify(req.body.content_title, { lower: true });


      
      if (req.body.id) {
        const updatedPost = await Post.findByIdAndUpdate(req.body.id, {
          author: req.user._id,
          slug: slug,
          tags: req.body.tags,
          content_title: req.body.content_title,
          content_image: req.body.content_image,
          content: req.body.content,
          read_time: req.body.read_time,
          categories: req.body.categories,
          likes: req.body.likes,
          createdAt: req.body.createdAt,
          views: req.body.views,
        }, { new: true });
  
        res.json(updatedPost);
      } else {
        const mappedBody = {
          author: req.user._id,
          slug: slug,
          tags: req.body.tags,
          content_title: req.body.content_title,
          content_image: req.body.content_image,
          content: req.body.content,
          read_time: req.body.read_time,
          categories: req.body.categories,
          likes: req.body.likes,
          createdAt: req.body.createdAt,
          views: req.body.views,
        };
  
        const newPost = new Post(mappedBody);
        const savedPost = await newPost.save();
        res.json(savedPost);
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  };
  

  
module.exports = {
  getIndex,
  getAllBlogs,
  getReadBlog,
  updateBlog,
  getUpdateBlog,
  deleteBlog,
};




