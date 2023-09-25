const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { jwt_secret } = require("../keys");
const Post = require("../models/postSchema");

module.exports.signUp = async function (req, res) {
  try {
    const { name, userName, email, password } = req.body;
    //check if all the fields are provided
    if (!name || !userName || !email || !password) {
      return res.status(422).json({ error: "Provide all the required fields" });
    }
    //check if user alreadu existed
    const newUser = await User.findOne({
      $or: [{ email: email }, { userName: userName }],
    });
    if (newUser) {
      console.log("user already been made");
      return res.status(422).json({ error: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      userName,
      email,
      password: hashedPassword,
    });
    await user.save();
    res.status(201).json({ messages: "User created successfully", data: user });
  } catch (err) {
    res.status(500).json({ messages: "internal server error" });
  }
};

module.exports.signIn = async function (req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: "Please add email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(422).json({ error: "Invalid email" });
    }

    const ComparePassword = await bcrypt.compare(password, user.password);

    if (ComparePassword) {
      const { _id, name, email, userName } = user;
      // return res.status(200).json({ messages: "Signed in successfully" });
      const token = jwt.sign({ _id: user._id }, jwt_secret);
      res.json({
        token,
        user: { _id, name, email, userName },
        messages: "Signed in successfully",
      });
      // console.log(token);
    } else {
      return res.status(422).json({ error: "Invalid password" });
    }
    console.log(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//create post
module.exports.createPost = async function (req, res) {
  try {
    const { pic, body } = req.body;
    if (!body || !pic) {
      return res.status(422).json({ messages: "provide all the fields" });
    }

    const post = await Post.create({
      body,
      photo: pic,
      postedBy: req.user,
    });

    return res.json({ post: post });
  } catch (err) {
    return res.status(500).json({ messages: "Internal server error" });
  }
};

//allposts
module.exports.allPosts = async function (req, res) {
  try {
    const posts = await Post.find()
      .populate("postedBy", "_id name photo")
      .populate("comments.postedBy", "_id name")
      .sort("-createdAt")
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", err });
  }
};

//my posts
module.exports.myPosts = async function (req, res) {
  const posts = await Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .populate("comments.postedBy", "_id name")
    .sort("-createdAt")

  res.json(posts);
};

//like a post
module.exports.like = async function (req, res) {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { likes: req.user._id },
      },
      {
        new: true,
      }
    ).populate("postedBy", "_id name photo");

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

//unlike
module.exports.unlike = async function (req, res) {
  try {
    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $pull: { likes: req.user._id },
      },
      {
        new: true,
      }
    ).populate("postedBy", "_id name photo");

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

//comments
module.exports.comment = async function (req, res) {
  try {
    const comment = {
      comment: req.body.text,
      postedBy: req.user._id,
    };
    const post = await Post.findByIdAndUpdate(
      req.body.postId,
      {
        $push: { comments: comment },
      },
      {
        new: true,
      }
    )
      .populate("comments.postedBy", "_id name")
      .populate("postedBy", "_id name photo");

    return res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

//delete post
module.exports.deletePost = async function (req, res) {
  try {
    const post = await Post.findOne({ _id: req.params.postId }).populate(
      "postedBy",
      "_id"
    );
    if (!post) {
      return res.status(422).json({ message: "Post not found" });
    }
    if (post.postedBy._id.toString() == req.user._id.toString()) {
      const result = await post.deleteOne();
      return res.json({ message: "Post removed successfully" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

//other user detail
module.exports.getUser = async function (req, res) {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("-password");
    if (!user) {
      return res.status(422).json({ message: "user not found" });
    }
    const post = await Post.find({ postedBy: req.params.id }).populate(
      "postedBy",
      "_id"
    );

    return res.status(200).json({ user, post });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

//follow an user
module.exports.follow = async function (req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.followId,
      {
        $push: { followers: req.user._id },
      },
      {
        new: true,
      }
    );

    const currentUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: { following: req.body.followId },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({ user, currentUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};

//unfollow
module.exports.unfollow = async function (req, res) {
  try {
    const user = await User.findByIdAndUpdate(
      req.body.followId,
      {
        $pull: { followers: req.user._id },
      },
      {
        new: true,
      }
    );

    const currentUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: { following: req.body.followId },
      },
      {
        new: true,
      }
    );

    return res.status(200).json({ user, currentUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "internal server error" });
  }
};
//following's post
module.exports.followingPosts = async function (req, res) {
  try {
    const posts = await Post.find({
      postedBy: { $in: req.user.following },
    }).populate("postedBy", "_id name").populate("comments.postedBy", "_id name");

    return res.json(posts);

  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};

//upload pic 
module.exports.uploadPfp = async (req, res) => {
    try{
      const user = await User.findByIdAndUpdate(req.user._id, {
        $set: {photo: req.body.pic}
      }, {
        new: true
      });

      res.json(user);
    }catch(err){
      res.status(500).json({ message: "internal server error" });
    }
}
