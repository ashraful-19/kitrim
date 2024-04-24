const express = require('express');
const homeController = require('../controllers/homeControllers');
const app = express();
const router = express.Router();
const { checkAuthenticated, checkLoggedIn } = require('../config/auth');
const { updateUser, checkPayment,checkAccess,authenticateExamAccess,authenticatePracticeAccess,checkCourseAccess,checkPurchasedCourse} = require("../middlewares/updateUser");

router.get('/', homeController.getIndex);
router.get('/blog/:slug', homeController.getReadBlog);
router.get('/blogs', homeController.getAllBlogs);
router.get('/delete/blog/:id', homeController.deleteBlog);

router.get('/admin/blog-post',checkAuthenticated, homeController.getUpdateBlog);
router.post('/admin/blog-post', homeController.updateBlog);
module.exports = router;