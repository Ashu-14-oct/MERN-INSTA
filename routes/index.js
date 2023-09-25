const express = require('express');
const router = express.Router();
const controller = require('../controller/controller');
const verify = require('../middlewares/requireLogin');

router.post('/signup', controller.signUp);
router.post('/signin', controller.signIn);
router.post('/createPost',verify, controller.createPost);
router.put('/like', verify, controller.like);
router.put('/unlike', verify, controller.unlike);
router.put('/comment', verify, controller.comment);

router.get('/allposts', verify, controller.allPosts);
router.get('/myposts', verify,controller.myPosts);

//Api to delete
router.delete('/deletePost/:postId', verify, controller.deletePost);

//other use detail
router.get("/user/:id", controller.getUser);

//follow / unfollow
router.put('/follow', verify, controller.follow);
router.put('/unfollow', verify, controller.unfollow);

//to show following's posts
router.get("/myfollowingpost", verify, controller.followingPosts);

//to upload profile pic
router.put('/uploadProfilePic', verify, controller.uploadPfp);

module.exports = router;