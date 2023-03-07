import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const blogPostsSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },
  cover: {
    in: ["body"],
    isString: {
      errorMessage: "A image is a mandatory",
    },
  },
  readTime: {
    in: ["body"],
    isNumber: {
      errorMessage: "readTime is a mandatory field and needs to be a number!",
    },
  },
  author: {
    in: ["body"],
    name: "AUTHOR AVATAR NAME",
    avatar: "AUTHOR AVATAR LINK",
  },
  content: {
    in: ["body"],
    isString: {
      errorMessage: "Content is a mandatory field and needs to be a string!",
    },
  },
  createdAt: {
    in: ["body"],
    isString: {
      errorMessage: "Content is a mandatory field and needs to be a string!",
    },
  },
};

export const checkBlogPostsSchema = checkSchema(blogPostsSchema);

export const triggerBadRequest = (req, res, next) => {

  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {

    next();
  } else {
    next(
      createHttpError(400, "You did something wrong..", {
        errorsList: errors.array(),
      })
    );
  }
};
