import fs from "fs-extra"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import { createReadStream } from "fs"

const { readJSON, writeJSON, writeFile } = fs

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../blogPosts")
const authorsJSONPath = join(dirname(fileURLToPath(import.meta.url)), "../authors/authors.json")
const blogPostsJSONPath = join(dataFolderPath, "../blogPosts/blogPosts.json")
const usersPublicFolderPath = join(process.cwd(), "./public/img/users")

export const getAuthors = () => readJSON(authorsJSONPath)
export const writeAuthors = authorsArray => writeJSON(authorsJSONPath, authorsArray)
export const getBlogPosts = () => readJSON(blogPostsJSONPath)
export const writeBlogPosts = blogPostsArray => writeJSON(blogPostsJSONPath, blogPostsArray)

export const saveUsersAvatars = (fileName, fileContentAsBuffer) => writeFile(join(usersPublicFolderPath, fileName), fileContentAsBuffer)

export const getBlogPostsJSONReadableStream = () => createReadStream(blogPostsJSONPath)