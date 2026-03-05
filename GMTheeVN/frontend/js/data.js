// USERS
let users = JSON.parse(localStorage.getItem("users")) || [
    {email:"admin@gmail.com", password:"123", role:"admin"},
    {email:"user@gmail.com", password:"123", role:"user"}
];

// ARTISTS
let artists = [
    {id:1, name:"Artist A", work:"Drama 1, Movie 2", image:"images/default.jpg"},
    {id:2, name:"Artist B", work:"Series X", image:"images/default.jpg"}
];

// PRODUCTS
let products = [
    {id:1, name:"Album A", price:200000, image:"images/default.jpg"},
    {id:2, name:"Poster B", price:100000, image:"images/default.jpg"}
];

// CART
let cart = JSON.parse(localStorage.getItem("cart")) || [];