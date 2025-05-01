// Load and display books from data.json using async/await and try...catch
document.addEventListener("DOMContentLoaded", async () => {
    try {
      const response = await fetch("data.json");
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      displayBooks(data.Books);
      localStorage.setItem("books", JSON.stringify(data.Books));
    } catch (error) {
      console.error("Error fetching book data:", error);
      const catalogContainer = document.getElementById("bookCatalog");
      catalogContainer.innerHTML = `
        <div class="col-12 text-center text-danger">
          <p>Failed to load books. Please try again later.</p>
        </div>
      `;
    }
  });
  
//catalogue Available books

let books = [];

function displayBooks(bookList) {
  const catalog = document.getElementById("bookCatalog");
  catalog.innerHTML = "";

  if (bookList.length === 0) {
    catalog.innerHTML = `<p class="text-center text-muted">No matching books found.</p>`;
    return;
  }

  bookList.forEach(book => {
    const card = document.createElement("div");
    card.className = "col-md-4 mb-4 cardd";

    const isAvailable = book.availability === "Available";
    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <img src="${book.coverImage}" class="card-img-top images" alt="${book.title}">
        <div class="card-body">
          <h5 class="card-title">${book.title}</h5>
          <p class="card-text"><strong>Author:</strong> ${book.author}</p>
          <p class="card-text"><strong>Genre:</strong> ${book.genre}</p>
          <p class="card-text"><strong>Status:</strong> 
            <span class="${isAvailable ? 'text-success' : 'text-danger'}">${book.availability}</span>
          </p>
          <button class="btn btn-primary borrow-btn" ${!isAvailable ? "disabled" : ""}>
            Borrow
          </button>
        </div>
      </div>
    `;

    catalog.appendChild(card);

    card.querySelector(".borrow-btn").addEventListener("click", () => {
      localStorage.setItem("selectedBook", JSON.stringify(book));
      window.location.href = "borrow.html";
    });
  });
}


// Live filtering
document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.getElementById("searchInput");
  const genreInput = document.getElementById("genreInput");

  try {
    const res = await fetch("data.json");
    const data = await res.json();
    books = data.Books;

    displayBooks(books);
  } catch (error) {
    console.error("Failed to load book data:", error);
  }

  [searchInput, genreInput].forEach(input => {
    input.addEventListener("input", () => {
      const titleQuery = searchInput.value.toLowerCase().trim();
      const genreQuery = genreInput.value.toLowerCase().trim();

      const filtered = books.filter(book => {
        const matchesTitleOrAuthor =
          book.title.toLowerCase().includes(titleQuery) ||
          book.author.toLowerCase().includes(titleQuery);

        const matchesGenre = book.genre.toLowerCase().includes(genreQuery);

        return matchesTitleOrAuthor && matchesGenre;
      });

      displayBooks(filtered);
    });
  });
});


  //borrow page
  document.addEventListener("DOMContentLoaded", async () => {
    const bookSelect = document.getElementById("bookSelect");
    try {
      const res = await fetch("data.json");
      const data = await res.json();
      const availableBooks = data.Books.filter(book => book.availability === "Available");
  
      availableBooks.forEach(book => {
        const option = document.createElement("option");
        option.value = book.title;
        option.textContent = `${book.title} by ${book.author}`;
        bookSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error loading books:", error);
    }
  
    const borrowForm = document.getElementById("borrowForm");
    borrowForm.addEventListener("submit", function (e) {
      e.preventDefault();
  
      const userName = document.getElementById("userName").value.trim();
      const userEmail = document.getElementById("userEmail").value.trim();
      const bookTitle = document.getElementById("bookSelect").value;
  
      const borrowRecord = {
        userName,
        userEmail,
        bookTitle,
        borrowDate: new Date().toLocaleString()
      };
  
      const history = JSON.parse(localStorage.getItem("borrowHistory")) || [];
      history.push(borrowRecord);
      localStorage.setItem("borrowHistory", JSON.stringify(history));
  
      document.getElementById("confirmationMessage").textContent = `Successfully borrowed "${bookTitle}"!`;
      borrowForm.reset();
    });
  });
  


  //history page
  document.addEventListener("DOMContentLoaded", () => {
    const history = JSON.parse(localStorage.getItem("borrowHistory")) || [];
    const historyTable = document.getElementById("historyTable");
  
    if (history.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.textContent = "No borrowing history yet.";
      row.appendChild(cell);
      historyTable.appendChild(row);
      return;
    }
  
    history.forEach(record => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${record.userName}</td>
        <td>${record.userEmail}</td>
        <td>${record.bookTitle}</td>
        <td>${record.borrowDate}</td>
      `;
      historyTable.appendChild(row);
    });

  });

// Show signup form and hide login form
const showSignup = document.getElementById("showSignup");

  showSignup.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("loginForm").classList.add("d-none");
    document.getElementById("signupForm").classList.remove("d-none");
    document.getElementById("formTitle").textContent = "Create an Account";
  });
  
  const showLogin = document.getElementById("showLogin");

  showLogin.addEventListener("click", function (e) {
    e.preventDefault();
    document.getElementById("signupForm").classList.add("d-none");
    document.getElementById("loginForm").classList.remove("d-none");
    document.getElementById("formTitle").textContent = "Login to Borrow Books";
  });


// Handle Login
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const loginEmail = document.getElementById("loginEmail").value.trim();
    const loginPassword = document.getElementById("loginPassword").value.trim();
  
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.email === loginEmail && user.password === loginPassword);
  
    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
  
      if (user.email === "librarian@library.com") {
        window.location.href = "Admin.html"; 
      } else {
        window.location.href = "profile.html"; 
      }
    } else {
      alert("Invalid email or password!");
    }
  });
  

  // Handle Signup
  document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const signupName = document.getElementById("signupName").value.trim();
    const signupEmail = document.getElementById("signupEmail").value.trim();
    const signupPassword = document.getElementById("signupPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    let isValid = true;

    // Email validation
    if (!emailPattern.test(signupEmail)) {
      document.getElementById("emailError").textContent = "Enter a valid email (e.g., user@example.com)";
      document.getElementById("emailError").style.display = "block";
      document.getElementById("emailSuccess").style.display = "none";
      isValid = false;
    } else {
      document.getElementById("emailError").style.display = "none";
      document.getElementById("emailSuccess").textContent = "Valid email format";
      document.getElementById("emailSuccess").style.display = "block";
    }

    // Password validation
    if (!passwordPattern.test(signupPassword)) {
      document.getElementById("passwordError").textContent = "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, and 1 number.";
      document.getElementById("passwordError").style.display = "block";
      document.getElementById("passwordSuccess").style.display = "none";
      isValid = false;
    } else {
      document.getElementById("passwordError").style.display = "none";
      document.getElementById("passwordSuccess").textContent = "Strong password";
      document.getElementById("passwordSuccess").style.display = "block";
    }

    // Confirm password match
    if (signupPassword !== confirmPassword) {
      document.getElementById("confirmPasswordError").textContent = "Passwords do not match";
      document.getElementById("confirmPasswordError").style.display = "block";
      isValid = false;
    } else {
      document.getElementById("confirmPasswordError").style.display = "none";
    }

    if (!isValid) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.some(user => user.email === signupEmail)) {
      alert("User with this email already exists. Please login.");
      return;
    }

    const newUser = {
      name: signupName,
      email: signupEmail,
      password: signupPassword
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account created successfully! Please login.");
    document.getElementById("signupForm").reset();
    document.getElementById("signupForm").classList.add("d-none");
    document.getElementById("loginForm").classList.remove("d-none");
    document.getElementById("formTitle").textContent = "Login to Borrow Books";
  });


  // Check if the logged-in user is a librarian
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (!loggedInUser || loggedInUser.email !== "librarian@library.com") {
  window.location.href = "login.html";
}

  //Admin dashboard
  
// Fetch and initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
    loadDashboard();
  });
  
  // Global data holders
//    books = [];
  let borrowHistory = [];
  let users = [];
  
  async function loadDashboard() {
    try {
      const response = await fetch("data.json");
      const data = await response.json();
      
      books = data.books;
      borrowHistory = JSON.parse(localStorage.getItem("borrowHistory")) || [];
      users = JSON.parse(localStorage.getItem("users")) || [];
  
      updateStats();
      renderBooks(books);
      renderBorrowHistory();
      renderMostBorrowed();
      renderRecentActivity();
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }
  
  // Update dashboard stats
  function updateStats() {
    const total = books.length;
    const borrowed = books.filter(book => book.availability === "borrowed").length;
    const available = total - borrowed;
    const activeUsers = users.length;
  
    document.getElementById("totalBooks").textContent = total;
    document.getElementById("borrowedBooks").textContent = borrowed;
    document.getElementById("availableBooks").textContent = available;
    document.getElementById("activeUsers").textContent = activeUsers;
  }
  
  // Render books in the table
  function renderBooks(bookList) {
    const tbody = document.getElementById("bookTableBody");
    tbody.innerHTML = "";
  
    bookList.forEach((book, index) => {
      const row = document.createElement("tr");
  
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${book.title}</td>
        <td>${book.author}</td>
        <td>${book.genre || "N/A"}</td>
        <td><span class="badge bg-${book.availability === 'available' ? 'success' : 'secondary'}">${book.availability}</span></td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="deleteBook(${index})">Delete</button>
        </td>
      `;
  
      tbody.appendChild(row);
    });
  }

  //creating profile
  document.addEventListener("DOMContentLoaded", function() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
     const currentUser = JSON.parse(localStorage.getItem("loggedInUser")); // Assuming the logged-in user is stored here
  
    if (currentUser) {
      const userDetails = document.getElementById("userDetails");
      const userName = document.getElementById("userName");
      const userEmail = document.getElementById("userEmail");
      const borrowedBooksList = document.getElementById("borrowedBooksList");
      const editProfileBtn = document.getElementById("editProfileBtn");
      const editProfileForm = document.getElementById("editProfileForm");
      const cancelEditBtn = document.getElementById("cancelEditBtn");
  
      // Display user information
      userName.textContent = currentUser.name;
      userEmail.textContent = currentUser.email;
  
      // Display borrowed books (if any)
      const borrowedBooks = currentUser.borrowedBooks || [];
      borrowedBooks.forEach(book => {
        const listItem = document.createElement("li");
        listItem.textContent = `${book.title} by ${book.author}`;
        
        // Create Return button
        const returnBtn = document.createElement("button");
        returnBtn.textContent = "Return";
        returnBtn.classList.add("btn", "btn-danger", "btn-sm", "ms-3");
  
        returnBtn.addEventListener("click", function() {
          returnBook(book);
        });
  
        listItem.appendChild(returnBtn);
        borrowedBooksList.appendChild(listItem);
      });
  
      // Handle Edit Profile button
      editProfileBtn.addEventListener("click", function() {
        userDetails.style.display = "none";
        editProfileForm.style.display = "block";
        document.getElementById("editName").value = currentUser.name;
        document.getElementById("editEmail").value = currentUser.email;
      });
  
      // Handle Cancel Edit button
      cancelEditBtn.addEventListener("click", function() {
        userDetails.style.display = "block";
        editProfileForm.style.display = "none";
      });
  
      // Handle saving profile changes
      document.getElementById("editProfile").addEventListener("submit", function(e) {
        e.preventDefault();
  
        const newName = document.getElementById("editName").value.trim();
        const newEmail = document.getElementById("editEmail").value.trim();
        const newPassword = document.getElementById("editPassword").value.trim();
  
        // Update the current user
        currentUser.name = newName;
        currentUser.email = newEmail;
        if (newPassword) {
          currentUser.password = newPassword; 
        }
  
        // Update the users list in localStorage
        const userIndex = users.findIndex(user => user.email === currentUser.email);
        if (userIndex !== -1) {
          users[userIndex] = currentUser; // Update the user data
          localStorage.setItem("users", JSON.stringify(users));
          localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
  
        alert("Profile updated successfully!");
  
        // Hide edit form and show updated profile details
        userDetails.style.display = "block";
        editProfileForm.style.display = "none";
  
        // Update displayed user info
        userName.textContent = currentUser.name;
        userEmail.textContent = currentUser.email;
      });
  
      // Function to return a borrowed book
      function returnBook(bookToReturn) {
        currentUser.borrowedBooks = currentUser.borrowedBooks.filter(book => book !== bookToReturn);
  
        // Update the catalog to mark the book as available
        const books = JSON.parse(localStorage.getItem("books")) || [];
        const bookIndex = books.findIndex(book => book.title === bookToReturn.title);
        if (bookIndex !== -1) {
          books[bookIndex].availability = true;
          localStorage.setItem("books", JSON.stringify(books));
        }
  
        // Update the current user's borrowed books in localStorage
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
  
        const bookItems = borrowedBooksList.getElementsByTagName("li");
        for (let item of bookItems) {
          if (item.textContent.includes(bookToReturn.title)) {
            borrowedBooksList.removeChild(item);
          }
        }
  
        alert(`You have successfully returned "${bookToReturn.title}"`);
      }
    } else {
      alert("Please log in to view your profile.");
    }
  });
  

  document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
  });
  
  function handleLogout(e) {
    e.preventDefault(); 
    localStorage.removeItem('loggedInUser'); 
    window.location.href = 'index.html';
  }
  