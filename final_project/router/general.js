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
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const findBookByISBN = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: "Book not found" });
        }
    });

    findBookByISBN
        .then((book) => {
            res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            res.status(error.status || 500).json({ message: error.message });
        });
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        const findBooksByAuthor = () => {
            return new Promise((resolve, reject) => {
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
                    resolve(results);
                } else {
                    reject("No books found for this author");
                }
            });
        };

        const filteredBooks = await findBooksByAuthor();
        return res.status(200).send(JSON.stringify(filteredBooks, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
  
    try {
      // Wrapping the search logic in a Promise to simulate async behavior
      const findBooksByTitle = () => {
        return new Promise((resolve, reject) => {
          let bookKeys = Object.keys(books);
          let results = [];
  
          bookKeys.forEach((key) => {
            if (books[key].title.toLowerCase() === title) {
              results.push({
                isbn: key,
                author: books[key].author,
                reviews: books[key].reviews
              });
            }
          });
  
          if (results.length > 0) {
            resolve(results);
          } else {
            reject("No books found with this title");
          }
        });
      };
  
      // Wait for the Promise to resolve
      const bookDetails = await findBooksByTitle();
      return res.status(200).send(JSON.stringify(bookDetails, null, 4));
  
    } catch (error) {
      // Handle the case where the Promise is rejected
      return res.status(404).json({ message: error });
    }
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
