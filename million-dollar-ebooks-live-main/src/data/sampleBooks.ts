
export const featuredBooks = [{
  id: 1,
  title: "Pride and Prejudice",
  author: "Jane Austen",
  cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop",
  genre: "Romance",
  price: "Free"
}, {
  id: 2,
  title: "The Great Gatsby",
  author: "F. Scott Fitzgerald",
  cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop",
  genre: "Classic",
  price: "Free"
}, {
  id: 3,
  title: "To Kill a Mockingbird",
  author: "Harper Lee",
  cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop",
  genre: "Fiction",
  price: "Free"
}, {
  id: 4,
  title: "1984",
  author: "George Orwell",
  cover: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=300&h=450&fit=crop",
  genre: "Dystopian",
  price: "Free"
}, {
  id: 5,
  title: "The Catcher in the Rye",
  author: "J.D. Salinger",
  cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=450&fit=crop",
  genre: "Coming of Age",
  price: "Free"
}, {
  id: 6,
  title: "Jane Eyre",
  author: "Charlotte Brontë",
  cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop",
  genre: "Classic",
  price: "Free"
}, {
  id: 7,
  title: "The Hobbit",
  author: "J.R.R. Tolkien",
  cover: "https://images.unsplash.com/photo-1518373714866-3f1478910cc0?w=300&h=450&fit=crop",
  genre: "Fantasy",
  price: "$1.00"
}, {
  id: 8,
  title: "Wuthering Heights",
  author: "Emily Brontë",
  cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop",
  genre: "Gothic",
  price: "Free"
}, {
  id: 9,
  title: "Steve Jobs",
  author: "Walter Isaacson",
  cover: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=450&fit=crop",
  genre: "Biography",
  price: "$1.00"
}, {
  id: 10,
  title: "The Diary of a Young Girl",
  author: "Anne Frank",
  cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop",
  genre: "Biography",
  price: "Free"
}, {
  id: 11,
  title: "Long Walk to Freedom",
  author: "Nelson Mandela",
  cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop",
  genre: "Biography",
  price: "$1.00"
}, {
  id: 12,
  title: "Einstein: His Life and Universe",
  author: "Walter Isaacson",
  cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop",
  genre: "Biography",
  price: "$1.00"
}];

export const genres = [{
  name: "Public Domain Classics - Free",
  books: featuredBooks.filter(book => book.price === "Free")
}, {
  name: "Romance - $1.00",
  books: featuredBooks.filter(book => book.genre === "Romance" || book.genre === "Classic").concat(featuredBooks.slice(0, 4)).map(book => ({
    ...book,
    price: "$1.00"
  }))
}, {
  name: "Science Fiction - $1.00",
  books: featuredBooks.filter(book => book.genre === "Dystopian" || book.genre === "Fantasy").concat(featuredBooks.slice(1, 5)).map(book => ({
    ...book,
    price: "$1.00"
  }))
}, {
  name: "Classic Literature - Free",
  books: featuredBooks.filter(book => book.genre === "Classic" || book.genre === "Fiction" || book.genre === "Gothic")
}, {
  name: "Biography - Featured Authors",
  books: featuredBooks.filter(book => book.genre === "Biography")
}];
