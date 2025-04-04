const Blog = require("../models/blogSchema");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");
const ShortUniqueId = require("short-unique-id");
const { randomUUID } = new ShortUniqueId({ length: 10 });
const {
  uploadImage,
  deleteImagefromCloudinary,
} = require("../utils/uploadImage");

// safe controllers

async function createBlog(req, res) {
  try {
    const creator = req.user;

    console.log(1,creator)

    const { title, description } = req.body;
    const draft = req.body.draft == "false" ? false : true;
    const { image, images } = req.files;

    const content = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);

    if (!title) {
      return res.status(400).json({
        message: "Please fill title field",
      });
    }

    if (!description) {
      return res.status(400).json({
        message: "Please fill description field",
      });
    }

    if (!content) {
      return res.status(400).json({
        message: "Please add some content",
      });
    }

    //cloudinary wali prikriya shuru karo

    let imageIndex = 0;

    for (let i = 0; i < content.blocks.length; i++) {
      const block = content.blocks[i];
      if (block.type === "image") {
        const { secure_url, public_id } = await uploadImage(
          `data:image/jpeg;base64,${images[imageIndex].buffer.toString(
            "base64"
          )}`
        );

        block.data.file = {
          url: secure_url,
          imageId: public_id,
        };

        imageIndex++;
      }
    }

    const { secure_url, public_id } = await uploadImage(
      `data:image/jpeg;base64,${image[0].buffer.toString("base64")}`
    );

    const blogId =
      title.toLowerCase().split(" ").join("-") + "-" + randomUUID();
    // const blogId = title.toLowerCase().replace(/ +/g, '-')

    console.log(2,blogId)

    const blog = await Blog.create({
      description,
      title,
      draft,
      creator,
      image: secure_url,
      imageId: public_id,
      blogId,
      content,
      tags,
    });


    console.log(3,blog)
    
    await User.findByIdAndUpdate(creator, { $push: { blogs: blog._id } });

    if (draft) {
      return res.status(200).json({
        message: "Blog Saved as Draft. You can public it from your profile",
        blog,
      });
    }

    return res.status(200).json({
      message: "Blog created Successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getBlogs(req, res) {
  try {
    console.log("GET /blogs endpoint hit", req.query);
    // Use default values if the parameters are not provided or invalid
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(`Page: ${page}, Limit: ${limit}`);
    
    if (page < 1 || limit < 1) {
      return res.status(400).json({
        message: "Invalid page or limit parameters",
        blogs: [],
        hasMore: false
      });
    }
    
    const skip = (page - 1) * limit;

    console.log("Executing MongoDB query for blogs");
    const blogs = await Blog.find({ draft: false })
      .populate({
        path: "creator",
        select: "-password",
      })
      .populate({
        path: "likes",
        select: "email name",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`Found ${blogs.length} blogs`);
    const totalBlogs = await Blog.countDocuments({ draft: false });
    console.log(`Total blogs: ${totalBlogs}`);

    // Check if blogs is a valid array
    if (!Array.isArray(blogs)) {
      console.error("Blogs is not an array:", blogs);
      return res.status(500).json({
        message: "Internal server error: Invalid data format",
        blogs: [],
        hasMore: false
      });
    }

    return res.status(200).json({
      message: "Blogs fetched Successfully",
      blogs,
      hasMore: skip + limit < totalBlogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      message: error.message,
      blogs: [],
      hasMore: false
    });
  }
}

async function getBlog(req, res) {
  try {
    const { blogId } = req.params;
    const blog = await Blog.findOne({ blogId })
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name email username profilePic",
        },
      })
      .populate({
        path: "creator",
        select: "name email followers username profilePic",
      })
      .lean();

    async function populateReplies(comments) {
      for (const comment of comments) {
        let populatedComment = await Comment.findById(comment._id)
          .populate({
            path: "replies",
            populate: {
              path: "user",
              select: "name email username profilePic",
            },
          })
          .lean();

        comment.replies = populatedComment.replies;

        if (comment.replies && comment.replies.length > 0) {
          await populateReplies(comment.replies);
        }
      }
      return comments;
    }

    blog.comments = await populateReplies(blog.comments);

    if (!blog) {
      return res.status(404).json({
        message: "Blog Not found",
      });
    }
    return res.status(200).json({
      message: "Blog fetched Successfully",
      blog,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function updateBlog(req, res) {
  try {
    const creator = req.user;

    const { id } = req.params;

    const { title, description } = req.body;

    const draft = req.body.draft == "false" ? false : true;

    const content = JSON.parse(req.body.content);
    const tags = JSON.parse(req.body.tags);
    const existingImages = JSON.parse(req.body.existingImages);

    const blog = await Blog.findOne({ blogId: id });

    if (!blog) {
      return res.status(500).json({
        message: "Blog is not found",
      });
    }

    if (!(creator == blog.creator)) {
      return res.status(500).json({
        message: "You are not authorized for this action",
      });
    }

    let imagesToDelete = blog.content.blocks
      .filter((block) => block.type == "image")
      .filter(
        (block) => !existingImages.find(({ url }) => url == block.data.file.url)
      )
      .map((block) => block.data.file.imageId);

    // if (imagesToDelete.length > 0) {
    //   await Promise.all(
    //     imagesToDelete.map((id) => deleteImagefromCloudinary(id))
    //   );
    // }

    if (req.files.images) {
      let imageIndex = 0;

      for (let i = 0; i < content.blocks.length; i++) {
        const block = content.blocks[i];
        if (block.type === "image" && block.data.file.image) {
          const { secure_url, public_id } = await uploadImage(
            `data:image/jpeg;base64,${req.files.images[
              imageIndex
            ].buffer.toString("base64")}`
          );

          block.data.file = {
            url: secure_url,
            imageId: public_id,
          };

          imageIndex++;
        }
      }
    }

    // const updatedBlog = await Blog.updateOne(
    //   { _id: id },
    //   {
    //     title,
    //     description,
    //     draft,
    //   }
    // );

    if (req?.files?.image) {
      await deleteImagefromCloudinary(blog.imageId);
      const { secure_url, public_id } = await uploadImage(
        `