
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  slug: { type: String },
  content_title: { type: String },
  content_image: { type: String },
  tags: { type: String },
  content: { type: String },
  read_time: { type: String },
  categories: { type: String },
  likes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  views: { type: Number, default: 0 },
});

  
  const Post = mongoose.model('Post', postSchema);
  
  module.exports = {
  Post,
  };
  