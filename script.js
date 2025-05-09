//load books from json file and display them in the catalogue

document.addEventListener("DOMContentLoaded", () => {
  const bookList = document.getElementById("bookList");
  const searchInput = document.getElementById("searchInput");
  const genreFilter = document.getElementById("genreFilter");

  let books = [];

  // Login check
   function checkLogin() {
     const user = localStorage.getItem("loggedInUser");
     if (!user) {
    //  alert("Please log in first.");
    //   // window.location.href = "login.html";
    }
  }
  // Load books
  async function loadBooks() {
    try {
      const response = await fetch("data.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      books = data;
      localStorage.setItem("books", JSON.stringify(books));
      populateGenres();
      renderBooks(books);
    } catch (error) {
      console.error("Failed to load books:", error);
      bookList.innerHTML = '<div class="alert alert-danger">Failed to load books. Please try again later.</div>';
    }
  }

  // Populate genres
  function populateGenres() {
    const genreFilter = document.getElementById("genreFilter");
    if (!genreFilter) {
      console.log("genreFilter element not found in the DOM.");
      return;
    }

    const genres = [...new Set(books.map(book => book.genre))];
    genres.forEach(genre => {
      const option = document.createElement("option");
      option.value = genre;
      option.textContent = genre;
      genreFilter.appendChild(option);
    });
  }

  // Render book list that dynamically displays books
  function renderBooks(bookArray) {
    bookList.innerHTML = "";

    if (bookArray.length === 0) {
      bookList.innerHTML = "<p class='text-center'>No books found.</p>";
      return;
    }

    bookArray.forEach((book, index) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      
      col.innerHTML = `
        <div class="card h-100">
          <img 
            src="${book.cover}" 
            class="card-img-top"
            alt="${book.title}"
            onerror="this.src='images/book image.jpg'; this.onerror=null;"
          >
          <div class="card-body">
            <h5 class="card-title">${book.title}</h5>
            <p class="card-text"><strong>Author:</strong> ${book.author}</p>
            <p class="card-text"><strong>Genre:</strong> ${book.genre}</p>
            <p class="card-text"><strong>Status:</strong> ${book.available ? '<span class="text-success">Available</span>' : '<span class="text-danger">Borrowed</span>'}</p>
            <button class="btn btn-primary w-100" ${!book.available ? "disabled" : ""} data-id="${index}">
              ${book.available ? "Borrow" : "Currently Borrowed"}
            </button>
          </div>
        </div>
      `;
      
      bookList.appendChild(col);
    });

    // Add event listeners for borrow buttons
    document.querySelectorAll("button[data-id]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-id");
        borrowBook(index);
      });
    });
  }

  // Filter books
  function filterBooks() {
    const text = searchInput.value.toLowerCase();
    const genre = genreFilter.value;

    const filtered = books.filter(book => {
      const matchText = book.title.toLowerCase().includes(text) || book.author.toLowerCase().includes(text);
      const matchGenre = genre === "" || book.genre === genre;
      return matchText && matchGenre;
    });

    renderBooks(filtered);
  }

  // Borrow a book
  function borrowBook(index) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return alert("You must be logged in.");
    
    if (user.role === 'admin') {
      alert("Administrators cannot borrow books. Please use a regular user account to borrow books.");
      return;
    }

    books[index].available = false;

    const borrowDate = new Date();
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + 7); 

    const borrowHistory = JSON.parse(localStorage.getItem("borrowHistory")) || [];
    borrowHistory.push({
      user: user.email,
      book: books[index].title,
      author: books[index].author,
      date: borrowDate.toLocaleString(),
      dueDate: dueDate.toLocaleString(),
      returned: false
    });

    localStorage.setItem("borrowHistory", JSON.stringify(borrowHistory));
    localStorage.setItem("books", JSON.stringify(books));
    renderBooks(books);
  }

  // Load books localStorage or fetch fresh
  checkLogin();
  const saved = JSON.parse(localStorage.getItem("books"));
  if (saved && saved.length > 0) {
    books = saved;
    populateGenres();
    renderBooks(books);
  } else {
    loadBooks();
  }

  searchInput.addEventListener("input", filterBooks);
  genreFilter.addEventListener("change", filterBooks);
});

// Toggle light/dark theme
const toggleBtn = document.getElementById("theme-toggle");
const body = document.body;

// Load saved theme from localStorage if available
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    body.className = savedTheme;
  }
});

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    if (body.classList.contains("light-theme")) {
      body.classList.replace("light-theme", "dark-theme");
      localStorage.setItem("theme", "dark-theme");
    } else {
      body.classList.replace("dark-theme", "light-theme");
      localStorage.setItem("theme", "light-theme");
    }
  });
}

// User Login/Signup Logic
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const showSignup = document.getElementById("showSignup");
  const showLogin = document.getElementById("showLogin");

  // Toggle between forms
  showSignup?.addEventListener("click", (e) => {
    e.preventDefault();
    loginForm.classList.add("d-none");
    signupForm.classList.remove("d-none");
  });

  showLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    signupForm.classList.add("d-none");
    loginForm.classList.remove("d-none");
  });

  // Signup handler
  signupForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const confirmPasswordError = document.getElementById("confirmPasswordError");

    emailError.style.display = "none";
    passwordError.style.display = "none";
    confirmPasswordError.style.display = "none";

    // Validate email and password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      emailError.textContent = "Invalid email format.";
      emailError.style.display = "block";
      return;
    }

    if (password.length < 6) {
      passwordError.textContent = "Password must be at least 6 characters.";
      passwordError.style.display = "block";
      return;
    }

    if (password !== confirmPassword) {
      confirmPasswordError.textContent = "Passwords do not match.";
      confirmPasswordError.style.display = "block";
      return;
    }

    // Save to localStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(u => u.email === email)) {
      emailError.textContent = "Email already exists.";
      emailError.style.display = "block";
      return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Signup successful! Please log in.");
    signupForm.reset();
    signupForm.classList.add("d-none");
    loginForm.classList.remove("d-none");
  });

  // Login handler with admin check
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    // Admin login
    if (email === "admin@library.com" && password === "admin123") {
      const adminUser = { name: "Admin", email, role: "admin" };
      localStorage.setItem("loggedInUser", JSON.stringify(adminUser));
      alert("Welcome, Admin!");
      window.location.href = "Admin.html";
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const found = users.find(user => user.email === email && user.password === password);
    if (!found) {
      alert("Invalid credentials!");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(found));
    alert("Login successful!");
    window.location.href = "profile.html";
  });
});

 // Admin data loading
document.addEventListener("DOMContentLoaded", () => {
  const availableBooksElement = document.getElementById("availableBooks");
  const borrowedBooksElement = document.getElementById("borrowedBooks");
  const totalBooksElement = document.getElementById("totalBooks");
  const totalBorrowedElement = document.getElementById("totalBorrowed");
  const mostBorrowedElement = document.getElementById("mostBorrowed");
  const genreDistributionElement = document.getElementById("genreDistribution");

  let books = JSON.parse(localStorage.getItem("books")) || [];
  let borrowHistory = JSON.parse(localStorage.getItem("borrowHistory")) || [];

  // Function to calculate and update the library stats
  function calculateLibraryStatus() {
    const availableBooksElement = document.getElementById("availableBooks");
    const borrowedBooksElement = document.getElementById("borrowedBooks");
    const totalBooksElement = document.getElementById("totalBooks");
    const totalBorrowedElement = document.getElementById("totalBorrowed");

    if (!availableBooksElement || !borrowedBooksElement || !totalBooksElement || !totalBorrowedElement) {
      console.warn("One or more elements for library status not found in the DOM.");
      return;
    }

    const availableBooks = books.filter(book => book.available).length;
    const borrowedBooks = books.filter(book => !book.available).length;
    const totalBooks = books.length;
    const totalBorrowed = borrowHistory.length;

    availableBooksElement.textContent = availableBooks;
    borrowedBooksElement.textContent = borrowedBooks;
    totalBooksElement.textContent = totalBooks;
    totalBorrowedElement.textContent = totalBorrowed;

    displayMostBorrowedBooks();
    displayGenreDistribution();
  }

  // Function to display the most borrowed books
  function displayMostBorrowedBooks() {
    const bookCounts = {};

    borrowHistory.forEach(borrow => {
      const bookTitle = borrow.book;
      if (bookCounts[bookTitle]) {
        bookCounts[bookTitle]++;
      } else {
        bookCounts[bookTitle] = 1;
      }
    });

    // Sort by most borrowed
    const mostBorrowedBooks = Object.entries(bookCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); 

    mostBorrowedElement.innerHTML = mostBorrowedBooks
      .map(([book, count]) => `<li>${book} - Borrowed ${count} times</li>`)
      .join("");
  }

  // Function to display genre distribution using a bar chart
  function displayGenreDistribution() {
    const genreCounts = {};

    books.forEach(book => {
      const genre = book.genre;
      if (genreCounts[genre]) {
        genreCounts[genre]++;
      } else {
        genreCounts[genre] = 1;
      }
    });

    // Update the list view
    genreDistributionElement.innerHTML = Object.entries(genreCounts)
      .map(([genre, count]) => `<li class="list-group-item d-flex justify-content-between align-items-center">
        ${genre}
        <span class="badge bg-primary rounded-pill">${count} books</span>
      </li>`)
      .join("");


    const ctx = document.getElementById('genreChart');
    // Destroy existing chart if it exists
    if (window.genreChartInstance) {
      window.genreChartInstance.destroy();
    }

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
    ];

    // Create new bar chart
    window.genreChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(genreCounts),
        datasets: [{
          label: 'Number of Books',
          data: Object.values(genreCounts),
          backgroundColor: colors,
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Book Distribution by Genre',
            font: {
              size: 20,
              family: 'Poppins, sans-serif',
              weight: 'bold'
            },
            color: '#222'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                return `${label}: ${value} books`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Genres',
              font: {
                size: 14,
                family: 'Poppins, sans-serif',
                weight: 'bold'
              },
              color: '#333'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Number of Books',
              font: {
                size: 14,
                family: 'Poppins, sans-serif',
                weight: 'bold'
              },
              color: '#333'
            },
            beginAtZero: true
          }
        },
        layout: {
          padding: {
            top: 20,
            bottom: 20
          }
        },
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    });
  }

  calculateLibraryStatus();

  // Optionally, you can reload and recalculate when books or borrow history data changes
  window.addEventListener("storage", (e) => {
    if (e.key === "books" || e.key === "borrowHistory") {
      books = JSON.parse(localStorage.getItem("books"));
      borrowHistory = JSON.parse(localStorage.getItem("borrowHistory"));
      calculateLibraryStatus();
    }
  });

  const overdueBooksElement = document.getElementById("overdueBooks");

  // Function to display all borrowed books, highlighting overdue ones
  function displayBorrowedBooks() {
    const today = new Date();
    const borrowedBooks = borrowHistory.filter(entry => !entry.returned);

    overdueBooksElement.innerHTML = borrowedBooks.map(entry => {
      const dueDate = new Date(entry.dueDate);
      const isOverdue = dueDate < today;
      const daysOverdue = isOverdue ? Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)) : 0;

      return `
        <tr class="${isOverdue ? 'table-danger' : ''}">
          <td>${entry.book}</td>
          <td>${entry.author}</td>
          <td>${entry.user}</td>
          <td>${dueDate.toLocaleDateString()}</td>
          <td>${isOverdue ? `${daysOverdue} days overdue` : 'On time'}</td>
          <td>
            <button class="btn btn-success btn-sm return-borrowed" data-book-title="${entry.book}">Return</button>
          </td>
        </tr>
      `;
    }).join("");

    // Add event listeners for return buttons
    document.querySelectorAll(".return-borrowed").forEach(button => {
      button.addEventListener("click", function () {
        const bookTitle = this.getAttribute("data-book-title");
        returnBorrowedBook(bookTitle);
      });
    });
  }

  // Function to return a borrowed book with confirmation
  function returnBorrowedBook(bookTitle) {
    if (!confirm(`Are you sure you want to return the book "${bookTitle}"?`)) {
      return; 
    }

    const bookIndex = books.findIndex(book => book.title === bookTitle);
    if (bookIndex !== -1) {
      books[bookIndex].available = true;
      localStorage.setItem("books", JSON.stringify(books));
    }

    const historyIndex = borrowHistory.findIndex(entry => entry.book === bookTitle && !entry.returned);
    if (historyIndex !== -1) {
      borrowHistory[historyIndex].returned = true;
      borrowHistory[historyIndex].returnDate = new Date().toLocaleString();
      localStorage.setItem("borrowHistory", JSON.stringify(borrowHistory));
    }

    alert(`The book "${bookTitle}" has been successfully returned.`);
    displayBorrowedBooks();
    calculateLibraryStatus();
  }

  displayBorrowedBooks();

});

  // Display user details
document.addEventListener("DOMContentLoaded", () => {
  const userDetails = document.getElementById("userDetails");
  const borrowedBooksDiv = document.getElementById("borrowedBooks");

  // Only proceed if we're on the profile page
  if (!userDetails || !borrowedBooksDiv) return;

  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const books = JSON.parse(localStorage.getItem("books")) || [];
  const borrowHistory = JSON.parse(localStorage.getItem("borrowHistory")) || [];

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  userDetails.innerHTML = `
    <h4 class="mb-3">Personal Information</h4>
    <p class="mb-2"><strong>Name:</strong> ${user.name}</p>
    <p class="mb-2"><strong>Email:</strong> ${user.email}</p>
  `;

  // Get user's borrowed books
  const userBorrowedBooks = borrowHistory
    .filter(entry => entry.user === user.email && !entry.returned)
    .map(entry => {
      const book = books.find(b => b.title === entry.book);
      if (book) {
        return {
          ...entry,
          cover: book.cover,
          genre: book.genre
        };
      }
      return entry;
    });

  if (userBorrowedBooks.length === 0) {
    borrowedBooksDiv.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          You haven't borrowed any books yet. 
          <a href="catalogue.html" class="alert-link">Browse our catalogue</a> to find books to borrow.
        </div>
      </div>
    `;
    return;
  }
  
  // Render borrowed books
  userBorrowedBooks.forEach(book => {
    const borrowDate = new Date(book.date);
    const dueDate = new Date(borrowDate);
    dueDate.setDate(borrowDate.getDate() + 7);
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";
    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img 
          src="${book.cover || 'images/book image.jpg'}" 
          class="card-img-top" 
          alt="${book.book}"
          style="height: 300px; object-fit: cover;"
          onerror="this.src='images/book image.jpg'; this.onerror=null;"
        >
        <div class="card-body">
          <h5 class="card-title">${book.book}</h5>
          <p class="card-text mb-1"><strong>Author:</strong> ${book.author}</p>
          ${book.genre ? `<p class="card-text mb-1"><strong>Genre:</strong> ${book.genre}</p>` : ''}
          <p class="card-text mb-1"><strong>Borrowed:</strong> ${borrowDate.toLocaleDateString()}</p>
          <p class="card-text text-danger mb-3"><strong>Due:</strong> ${dueDate.toLocaleDateString()}</p>
          <button class="btn btn-success w-100 return-book" data-book-title="${book.book}">Return Book</button>
        </div>
      </div>
    `;
    borrowedBooksDiv.appendChild(col);
  });

  // Handle return book functionality
  document.querySelectorAll('.return-book').forEach(button => {
    button.addEventListener('click', function() {
      const bookTitle = this.getAttribute('data-book-title');
      const returnDate = new Date();
      
      // Update book availability
      const bookIndex = books.findIndex(b => b.title === bookTitle);
      if (bookIndex !== -1) {
        books[bookIndex].available = true;
        localStorage.setItem("books", JSON.stringify(books));
      }

      // Update borrow history
      const historyIndex = borrowHistory.findIndex(h => 
        h.user === user.email && 
        h.book === bookTitle && 
        !h.returned
      );
      if (historyIndex !== -1) {
        borrowHistory[historyIndex].returned = true;
        borrowHistory[historyIndex].returnDate = returnDate.toLocaleString();
        borrowHistory[historyIndex].dateReturned = returnDate.toLocaleString();
        localStorage.setItem("borrowHistory", JSON.stringify(borrowHistory));
      }

      alert(`Thank you for returning "${bookTitle}"`);
      location.reload();
    });
  });

  const catalogueBooksDiv = document.getElementById("catalogueBooks");

  // Function to display available books in the catalogue
  function displayCatalogueBooks() {    const books = JSON.parse(localStorage.getItem("books")) || [];
    const availableBooks = books.filter(book => book.available);

    catalogueBooksDiv.innerHTML = availableBooks.map(book => {
      return `
        <div class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm">
            <img 
              src="${book.cover || 'images/book image.jpg'}" 
              class="card-img-top" 
              alt="${book.title}"
              style="height: 300px; object-fit: cover;"
              onerror="this.src='images/book image.jpg'; this.onerror=null;"
            >
            <div class="card-body">
              <h5 class="card-title">${book.title}</h5>
              <p class="card-text mb-1"><strong>Author:</strong> ${book.author}</p>
              <p class="card-text mb-1"><strong>Genre:</strong> ${book.genre}</p>
              <button class="btn btn-primary w-100 borrow-book" data-book-title="${book.title}">Borrow</button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Add event listeners for borrow buttons
    document.querySelectorAll(".borrow-book").forEach(button => {
      button.addEventListener("click", function () {
        const bookTitle = this.getAttribute("data-book-title");
        borrowBookFromCatalogue(bookTitle);
      });
    });
  }
  displayCatalogueBooks();

  // Function to borrow a book from the catalogue
  function borrowBookFromCatalogue(bookTitle) {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!user) return alert("You must be logged in.");

    const bookIndex = books.findIndex(book => book.title === bookTitle);
    if (bookIndex !== -1) {
      books[bookIndex].available = false;

      const borrowDate = new Date();
      const dueDate = new Date(borrowDate);
      dueDate.setDate(borrowDate.getDate() + 7);

      const borrowHistory = JSON.parse(localStorage.getItem("borrowHistory")) || [];
      borrowHistory.push({
        user: user.email,
        book: books[bookIndex].title,
        author: books[bookIndex].author,
        date: borrowDate.toLocaleString(),
        dueDate: dueDate.toLocaleString(),
        returned: false
      });

      localStorage.setItem("borrowHistory", JSON.stringify(borrowHistory));
      localStorage.setItem("books", JSON.stringify(books));
      alert(`You have successfully borrowed "${bookTitle}".`);
      displayCatalogueBooks();
      displayBorrowedBooks();
    }
  }

  displayCatalogueBooks();

  // Function to update borrowed books section after borrowing from the catalogue
  function displayBorrowedBooks() {
    const user = JSON.parse(localStorage.getItem("loggedInUser"));
    const userBorrowedBooks = borrowHistory
      .filter(entry => entry.user === user.email && !entry.returned)
      .map(entry => {
        const book = books.find(b => b.title === entry.book);
        if (book) {
          return {
            ...entry,
            cover: book.cover,
            genre: book.genre
          };
        }
        return entry;
      });

    borrowedBooksDiv.innerHTML = userBorrowedBooks.length === 0
      ? `<div class="col-12">
           <div class="alert alert-info">
             You haven't borrowed any books yet. 
             <a href="#catalogueBooks" class="alert-link">Browse our catalogue</a> to find books to borrow.
           </div>
         </div>`
      : userBorrowedBooks.map(book => {
          const borrowDate = new Date(book.date);
          const dueDate = new Date(book.dueDate);
          return `
            <div class="col-md-6 col-lg-4">
              <div class="card h-100 shadow-sm">
                <img 
                  src="${book.cover || 'images/book image.jpg'}" 
                  class="card-img-top" 
                  alt="${book.book}"
                  style="height: 300px; object-fit: cover;"
                  onerror="this.src='images/book image.jpg'; this.onerror=null;"
                >
                <div class="card-body">
                  <h5 class="card-title">${book.book}</h5>
                  <p class="card-text mb-1"><strong>Author:</strong> ${book.author}</p>
                  ${book.genre ? `<p class="card-text mb-1"><strong>Genre:</strong> ${book.genre}</p>` : ''}
                  <p class="card-text mb-1"><strong>Borrowed:</strong> ${borrowDate.toLocaleDateString()}</p>
                  <p class="card-text text-danger mb-3"><strong>Due:</strong> ${dueDate.toLocaleDateString()}</p>
                  <button class="btn btn-success w-100 return-book" data-book-title="${book.book}">Return Book</button>
                </div>
              </div>
            </div>
          `;
        }).join("");

    // Add event listeners for return buttons
    document.querySelectorAll('.return-book').forEach(button => {
      button.addEventListener('click', function() {
        const bookTitle = this.getAttribute('data-book-title');
        returnBorrowedBook(bookTitle);
        displayCatalogueBooks(); // Ensure catalogue is refreshed
      });
    });
  }

});

//display borrow history
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const historyTableBody = document.getElementById("historyTableBody");

  if (!historyTableBody) return; 

  const history = JSON.parse(localStorage.getItem("borrowHistory")) || [];
  const userHistory = history.filter(h => h.user === user?.email);

  if (userHistory.length === 0) {
    historyTableBody.innerHTML = `
      <tr><td colspan="6" class="text-center text-muted">No borrowing history available.</td></tr>
    `;
    return;
  }

  userHistory.forEach(entry => {
    const borrowDate = new Date(entry.date);
    const dueDate = entry.dueDate ? new Date(entry.dueDate) : new Date(borrowDate.getTime() + (7 * 24 * 60 * 60 * 1000));
    const returnDate = entry.returnDate ? new Date(entry.returnDate) : null;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.book}</td>
      <td>${entry.author}</td>
      <td>${borrowDate.toLocaleDateString()}</td>
      <td>${dueDate.toLocaleDateString()}</td>
      <td>${returnDate ? returnDate.toLocaleDateString() : "-"}</td>
      <td>
        <span class="badge ${entry.returned ? 'bg-success' : 'bg-warning text-dark'}">
          ${entry.returned ? "Returned" : "Not Returned"}
        </span>
      </td>
    `;
    historyTableBody.appendChild(row);
  });
});

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
});


