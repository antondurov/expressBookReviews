const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios")


public_users.post("/register", (req,res) => {
  //Write your code here
  let username = req.body.username;
  let password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Please provide username and password"});
  }

  let userExists = users.find((user) => {
    return user.username === username;
  })

  if (userExists) {
    return res.status(400).json({ message: "User already exists!"});
  }

  users.push({ "username": username, "password": password});
  return res.status(201).json({ message: "user: " + username + " Succesfully registered!"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    try {
      // In a real scenario, you would fetch from an external API or DB
      // Here we wrap the logic in a Promise to demonstrate the async requirement
      const getBooks = () => {
        return new Promise((resolve, reject) => {
          if (books) {
            resolve(books);
          } else {
            reject("Books not found");
          }
        });
      };
  
      const bookList = await getBooks();
      return res.status(200).send(JSON.stringify(bookList, null, 4));
      
    } catch (error) {
      return res.status(500).json({ message: "Error retrieving books", error: error });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  return res.status(200).send(JSON.stringify(books[isbn], null, 4));
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  let author = req.params.author;
  let bookKeys = Object.keys(books);
  let results = [];

  bookKeys.forEach((key) => {
    if (books[key].author === author) {
        results.push({
            isbn: key,
            title: books[key].title,
            reviews: books[key].reviews,
        });
    }
  });
  if (results.length > 0) {
    return res.status(200).send(JSON.stringify(results, null, 4));
  }
  return res.status(404).json({message: "No books found for this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  let title = req.params.title.trim().toLowerCase();
  let bookKeys = Object.keys(books);
  let results = [];

  bookKeys.forEach((key) => {
    if (books[key].title.toLowerCase() === title) {
        results.push({
            isbn: key,
            author: books[key].author,
            title: books[key].title.trim(),
            reviews: books[key].reviews,
        });
    }
  });
  if (results.length > 0) {
    return res.status(200).send(JSON.stringify(results, null, 4));
  }
  return res.status(404).json({message: "No books found for this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;

  if (books[isbn]) {
    res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).send({message: "No reviews found. Book not in database."});
});

module.exports.general = public_users;
