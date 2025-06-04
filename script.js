const firebaseConfig = {
  apiKey: "AIzaSyCG7fRw21apfTA36HKl5LbVWiHI_8zk12A",
  authDomain: "signup-bfcf8.firebaseapp.com",
  databaseURL: "https://signup-bfcf8-default-rtdb.firebaseio.com",
  projectId: "signup-bfcf8",
  storageBucket: "signup-bfcf8.appspot.com",
  messagingSenderId: "862509936181",
  appId: "1:862509936181:web:6a16490f27a97bac7bcb7c",
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const storage = firebase.storage();
const fs = firebase.firestore();

// Current user is Empviv

const paths = [
  "Popular/products",
  "Category/grocery",
  "TopPicks/products",
  "New/products",
  "Category/computing",
  "Category/phones",
  "Category/men",
  "Category/women",
  "Category/children",
  "Category/machinary",
  "Category/electronics",
  "Category/fashion",
  "Category/sports",
  "Category/gaming",
  "Category/home&office",
  "Category/health&beauty",
  "Category/garden&outdoors",
  "Category/music",
  "Category/books&movies",
  "Category/automobile",
];
let allProducts = [];

const notification = document.getElementById("note");
const noteBox = document.querySelector(".notification");

const productContainer = document.getElementById("product-container");

window.addEventListener("load", function () {
  messageSetUp();
});
// Function to get product data
function getProducts() {
  allProducts = [];
  paths.forEach((path) => {
    db.ref(path).once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const product = childSnapshot.val();
        const productId = childSnapshot.key;
        allProducts.push({
          ...product,
          id: productId,
          path: path,
        });
      });
      displayProducts(allProducts);
    });
  });
}

let productsPerPage = 10;
let currentProductIndex = 0;
let currentProducts = [];

// ...existing code...
function displayProducts(products, reset = true) {
  const table = document.getElementById("product-table");
  const tbody = table.querySelector("tbody");
  if (reset) {
    tbody.innerHTML = "";
    currentProductIndex = 0;
    currentProducts = products;
  }
  // Load next batch
  const nextProducts = currentProducts.slice(
    currentProductIndex,
    currentProductIndex + productsPerPage
  );
  nextProducts.forEach((product) => {
    const tr = document.createElement("tr");
    // ...inside displayProducts, in tr.innerHTML...
    tr.innerHTML = `
  <td><img src="${product.image1 || ""}" alt="${
      product.name
    }" style="width:100px;height:100px;object-fit:cover;border-radius:8px;" /></td>
  <td>${product.id || product.identification || ""}</td>
  <td>${product.name || ""}</td>
  <td>Ghc${product.sellingprice || ""}</td>
  <td>Ghc${product.costprice || ""}</td>
  <td>${product.seller || ""}</td>
  <td class="desc-cell" title="${product.description || ""}">${
      product.description
        ? product.description.substring(0, 40) +
          (product.description.length > 40 ? "..." : "")
        : ""
    }</td>
  <td>${product.productSize || product.size || ""}</td>
  <td>
    <span style="display:inline-block;width:18px;height:18px;background:${
      product.color || "#eee"
    };border-radius:50%;border:1px solid #ccc;vertical-align:middle;margin-right:4px;"></span>
    ${product.color || ""}
  </td>
  <td style="font-size:0.85em;color:#888;">${product.path || ""}</td>
  <td>
    <button class="edit-button">Edit</button>
    <button class="delete-button">Delete</button>
    <button class="move-button">Move</button>
  </td>
`;
    const moveButton = tr.querySelector(".move-button");
    moveButton.addEventListener("click", () => {
      moveProduct(product, moveButton);
    });
    // Add event listeners for Edit and Delete
    const editButton = tr.querySelector(".edit-button");
    editButton.addEventListener("click", () => {
      editProduct(
        product.identification,
        product.name,
        product.sellingprice,
        product.costprice,
        product.seller,
        product.description,
        product.additionalInfo,
        product.productSize,
        product.color,
        product.path
      );
      editButton.textContent = "Editing...";
    });
    const deleteButton = tr.querySelector(".delete-button");
    deleteButton.addEventListener("click", () => {
      deleteProduct(product.identification, product.path, deleteButton);
      deleteButton.textContent = "Deleting...";
    });
    tbody.appendChild(tr);
  });
  currentProductIndex += productsPerPage;
}

function moveProduct(product, moveButton) {
  // Show modal
  const modal = document.getElementById("moveModal");
  const select = document.getElementById("movePathSelect");
  const confirmBtn = document.getElementById("confirmMoveBtn");
  const closeBtn = document.getElementById("closeMoveModal");

  // Populate select with available paths
  select.innerHTML = "";
  paths
    .filter((p) => p !== product.path)
    .forEach((p) => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      select.appendChild(option);
    });

  modal.style.display = "flex";

  // Remove previous listeners
  confirmBtn.onclick = null;
  closeBtn.onclick = null;

  // Confirm move
  confirmBtn.onclick = function () {
    const newPath = select.value;
    if (!newPath || newPath === product.path) {
      modal.style.display = "none";
      return;
    }
    confirmBtn.innerText = "Moving...";
    // Copy product to new path
    db.ref(`${newPath}/${product.id}`)
      .set({ ...product, path: newPath })
      .then(() => db.ref(`${product.path}/${product.id}`).remove())
      .then(() => {
        noteBox.style.display = "block";
        notification.innerText = "Product moved successfully!";
        getProducts();
      })
      .catch((err) => {
        noteBox.style.display = "block";
        notification.innerText = "Error moving product: " + err.message;
      })
      .finally(() => {
        confirmBtn.innerText = "Move";
        modal.style.display = "none";
      });
  };

  // Close modal
  closeBtn.onclick = function () {
    modal.style.display = "none";
  };
  // Also close modal when clicking outside modal-content
  modal.onclick = function (e) {
    if (e.target === modal) modal.style.display = "none";
  };
}

// Infinite scroll handler (works for both container and window scroll)
function handleProductScroll() {
  // If productContainer is scrollable, use its scroll
  if (
    productContainer.scrollHeight > productContainer.clientHeight &&
    productContainer.scrollTop + productContainer.clientHeight >=
      productContainer.scrollHeight - 50
  ) {
    if (currentProductIndex < currentProducts.length) {
      displayProducts(currentProducts, false);
    }
  }
  // If not scrollable (e.g. body scroll), check window scroll
  else if (
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 50
  ) {
    if (currentProductIndex < currentProducts.length) {
      displayProducts(currentProducts, false);
    }
  }
}

// Attach scroll event to both productContainer and window
productContainer.addEventListener("scroll", handleProductScroll);
window.addEventListener("scroll", handleProductScroll);

// ...existing code...
// Update getProducts to use new displayProducts
function getProducts() {
  allProducts = [];
  let loadedPaths = 0;
  paths.forEach((path) => {
    db.ref(path).once("value", (snapshot) => {
      snapshot.forEach((childSnapshot) => {
        const product = childSnapshot.val();
        const productId = childSnapshot.key;
        allProducts.push({
          ...product,
          id: productId,
          path: path,
        });
      });
      loadedPaths++;
      // Only display after all paths are loaded
      if (loadedPaths === paths.length) {
        displayProducts(allProducts, true);
      }
    });
  });
}

// ...existing code...

// Update searchProducts to filter and sort as you type
function searchProducts() {
  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase();
  let filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );
  // Sort alphabetically by name
  filteredProducts = filteredProducts.sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  displayProducts(filteredProducts, true);
}

// Listen for input event for live search and sort
document
  .getElementById("search-input")
  .addEventListener("input", searchProducts);

// Function to edit product
function editProduct(
  productId,
  name,
  sellingPrice,
  costPrice,
  seller,
  description,
  additionalInfo,
  size,
  color,
  path
) {
  document.getElementById("edit-container").style.display = "block";
  document.getElementById("product-id").value = productId;
  document.getElementById("product-name").value = name;
  document.getElementById("product-price").value = sellingPrice;
  document.getElementById("product-cost").value = costPrice;
  document.getElementById("product-seller").value = seller;
  document.getElementById("product-description").value = description;
  document.getElementById("product-additional-info").value = additionalInfo;
  document.getElementById("product-size").value = size;
  document.getElementById("product-color").value = color;
  document.getElementById("product-color").style.backgroundColor = color;
  document.getElementById("edit-container").dataset.path = path;
}

// Function to save edited product
function saveProduct(event) {
  event.preventDefault();
  const productId = document.getElementById("product-id").value;
  const name = document.getElementById("product-name").value;
  const sellingPrice = document.getElementById("product-price").value;
  const costPrice = document.getElementById("product-cost").value;
  const seller = document.getElementById("product-seller").value;
  const description = document.getElementById("product-description").value;
  const additionalInfo = document.getElementById(
    "product-additional-info"
  ).value;
  const size = document.getElementById("product-size").value;
  const color = document.getElementById("product-color").value;
  const path = document.getElementById("edit-container").dataset.path;

  db.ref(`${path}/${productId}`)
    .update({
      name,
      sellingprice: sellingPrice,
      costprice: costPrice,
      seller,
      description,
      additionalinfo: additionalInfo,
      size,
      color,
    })
    .then(() => {
      alert("Product updated successfully");
      getProducts(); // Refresh products
      document.getElementById("edit-container").style.display = "none";
    })
    .catch((error) => console.error("Error updating product:", error));
}

// Function to delete product
function deleteProduct(productId, path, deleteButton) {
  // Show confirmation dialog
  const confirmation = confirm(
    "Are you sure you want to delete this product and its folder?"
  );
  if (!confirmation) {
    deleteButton.innerText = "Delete"; // Reset button text when canceled
    return; // Exit the function if the user cancels
  }

  deleteButton.innerText = "Deleting..."; // Change button text to show progress

  db.ref(`${path}/${productId}`).once("value", (snapshot) => {
    const product = snapshot.val();
    const identification = product.identification;

    if (!identification) {
      noteBox.style.display = "flex";
      notification.innerText =
        "Identification not found. Cannot delete folder.";
      deleteButton.innerText = "Delete"; // Reset button text
      return;
    }

    const folderRef = storage.ref(`Empviv/${identification}`);

    // Check if folder name matches the identification
    folderRef
      .listAll()
      .then((result) => {
        if (result.items.length === 0) {
          noteBox.style.display = "flex";
          notification.innerText = "Folder not found or empty.";
          deleteButton.innerText = "Delete"; // Reset button text
          return;
        }

        // If folder matches, delete its contents
        const promises = result.items.map((itemRef) => itemRef.delete());

        // Wait for all delete promises to resolve
        return Promise.all(promises);
      })
      .then(() => {
        // Delete the product from the database
        return db.ref(`${path}/${productId}`).remove();
      })
      .then(() => {
        noteBox.style.display = "block";
        notification.innerText = "Product and its folder deleted successfully";
        getProducts(); // Refresh products
      })
      .catch((error) => {
        console.error("Error deleting product and its folder:", error);
      })
      .finally(() => {
        deleteButton.innerText = "Delete"; // Reset button text after completion
      });
  });
}
function cancelled() {
  document.getElementById("edit-container").style.display = "none";
}

// Initialize products display
getProducts();

// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script
// order page script

// Function to show paths view
// ...existing code...

// Show all orders from all users, not grouped by user
function showAllOrders() {
  document.getElementById("order-path-view").classList.add("order-hidden");
  document
    .getElementById("order-content-view")
    .classList.remove("order-hidden");
  loadAllOrders();
}

function loadAllOrders() {
  const contentList = document.getElementById("order-content-list");
  contentList.innerHTML = "";
  document.getElementById("order-loader-wrapper").style.display = "flex";

  // Fetch all user info first for mapping user keys to details
  db.ref("USER/ADDRESS")
    .once("value")
    .then((userSnap) => {
      const userInfo = {};
      userSnap.forEach((user) => {
        userInfo[user.key] = user.val();
      });

      // Listen for real-time updates on orders
      db.ref("CHECKOUT").on("value", (snapshot) => {
        const groupedOrders = {};

        // Group orders by user and timestamp (rounded to minute)
        snapshot.forEach((userSnap) => {
          const userKey = userSnap.key;
          userSnap.forEach((orderSnap) => {
            const order = orderSnap.val();
            order._id = orderSnap.key;
            order._user = userKey;

            // Use timestamp rounded to the nearest minute as group key
            const ts = order.timestamp
              ? Math.floor(order.timestamp / 60)
              : Math.floor(Date.now() / 60000);
            const groupKey = `${userKey}_${ts}`;

            if (!groupedOrders[groupKey]) {
              groupedOrders[groupKey] = {
                userKey,
                timestamp: order.timestamp || Date.now() / 1000,
                orders: [],
                status: order.status || "pending",
                orderNumber: `ORD-${userKey
                  .substring(0, 4)
                  .toUpperCase()}-${ts}`,
              };
            }
            groupedOrders[groupKey].orders.push(order);

            // If any order in the group is pending, group is pending
            if (order.status !== "delivered") {
              groupedOrders[groupKey].status = "pending";
            }
          });
        });

        // Convert grouped orders to array and sort by timestamp (latest first)
        const groupedOrdersArr = Object.values(groupedOrders).sort(
          (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
        );

        if (groupedOrdersArr.length === 0) {
          contentList.innerHTML = "<p>No orders found.</p>";
        } else {
          contentList.innerHTML = ""; // Clear previous table
          const table = document.createElement("table");
          table.className = "modern-order-table";
          table.innerHTML = `
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Total Price (Ghc)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody></tbody>
          `;
          const tbody = table.querySelector("tbody");

          groupedOrdersArr.forEach((group) => {
            // Date (fix: handle seconds/milliseconds)
            let dateStr = "";
            if (group.timestamp) {
              let ts = group.timestamp;
              if (ts < 10000000000) ts = ts * 1000; // If in seconds, convert to ms
              const date = new Date(ts);
              dateStr =
                date.toLocaleDateString() + " " + date.toLocaleTimeString();
            } else {
              dateStr = group.orderNumber;
            }

            // Customer details
            const user = userInfo[group.userKey] || {};
            const name = user.account || user.name || "N/A";
            const email = user.email || "N/A";
            const phone = user.phone || user.phoneNumber || "N/A";
            const location = user.location || user.address || "N/A";
            const customerHTML = `
              <div><strong>${name}</strong></div>
              <div style="font-size:0.95em;color:#555;">Email: ${email}</div>
              <div style="font-size:0.95em;color:#555;">Phone: ${phone}</div>
              <div style="font-size:0.95em;color:#555;">Location: ${location}</div>
            `;

            // Products details (list all products in the group)
            let totalPrice = 0;
            const productsHTML = group.orders
              .map((item) => {
                const productName = item.name || item.productName || "N/A";
                const productId =
                  item.identification || item.productId || item._id || "N/A";
                const color = item.color || "N/A";
                const image =
                  item.image1 ||
                  item.image ||
                  (item.images && item.images[0]) ||
                  "https://via.placeholder.com/80x80?text=No+Image";
                const price = Number(item.price || item.sellingprice || 0);
                const quantity = Number(item.quantity || 1);
                const subtotal = price * quantity;
                totalPrice += subtotal;
                return `
                  <div style="margin-bottom:8px;">
                    <div><strong style="color:#000066;">${productName}</strong></div>
                    <img src="${image}" alt="${productName}" style="width:50px;height:50px;object-fit:cover;border-radius:8px;margin:4px 0;" />
                    <div style="font-size:0.95em;">Color: <span style="display:inline-block;width:16px;height:16px;background:${color};border-radius:50%;vertical-align:middle;margin-right:4px;border:1px solid #ccc;"></span> ${color}</div>
                    <div style="font-size:0.95em;">ID: <span style="color:#4a90e2;">${productId}</span></div>
                    <div style="font-size:0.95em;color:#e67e22;">Price: Ghc${price.toLocaleString()} x <span style="color:#27ae60;">${quantity}</span></div>
                    <div style="font-size:0.95em;color:#007bff;">Subtotal: Ghc${subtotal.toLocaleString()}</div>
                  </div>
                `;
              })
              .join("<hr style='margin:4px 0;'>");

            // Status
            const status =
              group.status === "delivered" ? "delivered" : "pending";
            const statusHTML = `<span class="order-status ${status}">${
              status.charAt(0).toUpperCase() + status.slice(1)
            }</span>`;

            // Action button
            let actionHTML = "";
            if (status === "pending") {
              actionHTML = `<button class="deliver-btn" data-user="${
                group.userKey
              }" data-ts="${Math.floor(
                group.timestamp / 60
              )}">Mark as Delivered</button>`;
            } else {
              actionHTML = `<button class="deliver-btn" disabled>Delivered</button>`;
            }

            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td data-label="Order #">${group.orderNumber}</td>
              <td data-label="Date">${dateStr}</td>
              <td data-label="Customer">${customerHTML}</td>
              <td data-label="Products">${productsHTML}</td>
              <td data-label="Total Price (Ghc)" style="color:#27ae60;font-weight:700;">${totalPrice.toLocaleString()}</td>
              <td data-label="Status">${statusHTML}</td>
              <td data-label="Action">${actionHTML}</td>
            `;
            tbody.appendChild(tr);
          });

          contentList.appendChild(table);

          // Add event listeners for deliver buttons
          contentList
            .querySelectorAll(".deliver-btn[data-user]")
            .forEach((btn) => {
              btn.addEventListener("click", function () {
                const userKey = btn.getAttribute("data-user");
                const ts = btn.getAttribute("data-ts");
                // Find all orders for this user and timestamp group
                db.ref(`CHECKOUT/${userKey}`)
                  .once("value")
                  .then((userOrdersSnap) => {
                    const updates = {};
                    userOrdersSnap.forEach((orderSnap) => {
                      const order = orderSnap.val();
                      const orderTs = order.timestamp
                        ? Math.floor(order.timestamp / 60)
                        : null;
                      if (orderTs && orderTs.toString() === ts) {
                        updates[orderSnap.key + "/status"] = "delivered";
                      }
                    });
                    return db.ref(`CHECKOUT/${userKey}`).update(updates);
                  })
                  .then(() => {
                    btn.textContent = "Delivered";
                    btn.classList.add("delivered");
                    btn
                      .closest("tr")
                      .querySelector(".order-status").textContent = "Delivered";
                    btn.closest("tr").querySelector(".order-status").className =
                      "order-status delivered";
                  })
                  .catch(() => {
                    btn.disabled = false;
                    btn.textContent = "Mark as Delivered";
                    alert("Failed to update status. Try again.");
                  });
              });
            });
        }
        document.getElementById("order-loader-wrapper").style.display = "none";
      });
    })
    .catch((error) => {
      contentList.innerHTML = "<p>Error loading orders.</p>";
      document.getElementById("order-loader-wrapper").style.display = "none";
      console.error(error);
    });
}

// --- Replace the old order page initialization with this ---
(function init() {
  const urlParams = new URLSearchParams(window.location.search);
  // Always show all orders flat, not grouped
  showAllOrders();
})();

// ...existing code...

function openNavPage(index) {
  const button = document.querySelectorAll("#bottomNav span");
  const pages = document.querySelectorAll(".nav-pages");
  for (var i = 0; i < button.length; i++) {
    if (i == index) {
      button[i].classList.add("active-nav");
      if (i === 2) {
        button[i].classList.add("special-nav");
        button[i].style.backgroundColor = "darkorange";
      }
    } else {
      button[i].classList.remove("active-nav");
      if (i === 2) {
        button[i].classList.remove("special-nav");
        button[i].style.backgroundColor = "#000066";
      }
    }
  }
  for (var j = 0; j < pages.length; j++) {
    if (j == index) {
      pages[j].classList.add("open-nav");
    } else {
      pages[j].classList.remove("open-nav");
    }
  }
}

// upload page script
function closeNotification() {
  noteBox.style.display = "none";
  notification.innerText = "";
}
function openMenu() {
  const menu = document.querySelector(".nav-menu");
  const hambar1 = document.querySelector(
    ".ham-menu-container span:nth-child(1)"
  );
  const hambar2 = document.querySelector(
    ".ham-menu-container span:nth-child(2)"
  );
  const hambar3 = document.querySelector(
    ".ham-menu-container span:nth-child(3)"
  );
  menu.classList.toggle("toggle-menu");
  hambar1.classList.toggle("ham-trans1");
  hambar2.classList.toggle("ham-trans2");
  hambar3.classList.toggle("ham-trans3");
}

function closeMenu() {
  const menu = document.querySelector(".nav-menu");
  menu.style.right = "400px";
  menu.style.transition = "0.3s ease";
}

function closeNotification() {
  noteBox.style.display = "none";
}

function popular() {
  document.getElementById("catLable").innerText = "POPULAR";
  document.getElementById("refValue").innerText = "Popular/products";
  openMenu();
}

function newProducts() {
  document.getElementById("catLable").innerText = "NEW ARRIVALS";
  document.getElementById("refValue").innerText = "New/products";
  openMenu();
}
function topPicks() {
  document.getElementById("catLable").innerText = "TOP PICKS";
  document.getElementById("refValue").innerText = "TopPicks/products";
  openMenu();
}

// category
function grocery() {
  document.getElementById("catLable").innerText = "GROCERY";
  document.getElementById("refValue").innerText = "Category/grocery";
  openMenu();
}

function phones() {
  document.getElementById("catLable").innerText = "PHONES";
  document.getElementById("refValue").innerText = "Category/phones";
  openMenu();
}
function computing() {
  document.getElementById("catLable").innerText = "COMPUTING";
  document.getElementById("refValue").innerText = "Category/computing";
  openMenu();
}
function men() {
  document.getElementById("catLable").innerText = "MEN";
  document.getElementById("refValue").innerText = "Category/men";
  openMenu();
}
function women() {
  document.getElementById("catLable").innerText = "WOMEN";
  document.getElementById("refValue").innerText = "Category/women";
  openMenu();
}
function children() {
  document.getElementById("catLable").innerText = "CHILDREN";
  document.getElementById("refValue").innerText = "Category/children";
  openMenu();
}
function machinary() {
  document.getElementById("catLable").innerText = "MACHINARY";
  document.getElementById("refValue").innerText = "Category/machinary";
  openMenu();
}
function electronics() {
  document.getElementById("catLable").innerText = "ELECTRONICS";
  document.getElementById("refValue").innerText = "Category/electronics";
  openMenu();
}
function fashion() {
  document.getElementById("catLable").innerText = "FASHION";
  document.getElementById("refValue").innerText = "Category/fashion";
  openMenu();
}
function sports() {
  document.getElementById("catLable").innerText = "SPORTS";
  document.getElementById("refValue").innerText = "Category/sports";
  openMenu();
}
function gaming() {
  document.getElementById("catLable").innerText = "GAMING";
  document.getElementById("refValue").innerText = "Category/gaming";
  openMenu();
}
function office() {
  document.getElementById("catLable").innerText = "HOME & OFFICE";
  document.getElementById("refValue").innerText = "Category/home&office";
  openMenu();
}
function health() {
  document.getElementById("catLable").innerText = "HEALTH & BEAUTY";
  document.getElementById("refValue").innerText = "Category/health&beauty";
  openMenu();
}
function garden() {
  document.getElementById("catLable").innerText = "GARDEN & OUTDOORS";
  document.getElementById("refValue").innerText = "Category/garden&outdoors";
  openMenu();
}
function music() {
  document.getElementById("catLable").innerText = "MUSICAL INSTRUMENTS";
  document.getElementById("refValue").innerText = "Category/music";
  openMenu();
}
function books() {
  document.getElementById("catLable").innerText = "BOOKS & MOVIES";
  document.getElementById("refValue").innerText = "Category/books&movies";
  openMenu();
}
function misc() {
  document.getElementById("catLable").innerText = "MISCELLANEOUS";
  document.getElementById("refValue").innerText = "Category/misc";
  openMenu();
}
function automobile() {
  document.getElementById("catLable").innerText = "AUTOMOBILE";
  document.getElementById("refValue").innerText = "Category/automobile";
  openMenu();
}

document.addEventListener("DOMContentLoaded", function () {
  const productId = generateProductId();
  document.getElementById("productId").value = productId;
  document.getElementById("generatedProductId").textContent = productId;
});

document
  .getElementById("productImageMain")
  .addEventListener("change", function (event) {
    const files = event.target.files;
    const previewContainer = document.getElementById("imagePreviewMain");
    previewContainer.innerHTML = "";

    if (files.length > 0) {
      const mainImage = document.createElement("img");
      mainImage.src = URL.createObjectURL(files[0]);
      previewContainer.appendChild(mainImage);
    }
  });

document
  .getElementById("productImage1")
  .addEventListener("change", function (event) {
    previewImage(event, "imagePreview1");
  });

document
  .getElementById("productImage2")
  .addEventListener("change", function (event) {
    previewImage(event, "imagePreview2");
  });

document
  .getElementById("productImage3")
  .addEventListener("change", function (event) {
    previewImage(event, "imagePreview3");
  });

document
  .getElementById("productImage4")
  .addEventListener("change", function (event) {
    previewImage(event, "imagePreview4");
  });

function generateProductId() {
  return "prod_" + Math.random().toString(36).substr(2, 9);
}

function previewImage(event, previewElementId) {
  const files = event.target.files;
  const previewContainer = document.getElementById(previewElementId);
  previewContainer.innerHTML = "";

  if (files.length > 0) {
    const image = document.createElement("img");
    image.src = URL.createObjectURL(files[0]);
    previewContainer.appendChild(image);
  }
}

function getImage() {
  document.getElementById("fileInput").addEventListener("change", function () {
    var file1 = this.files[0];
    if (file1) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document
          .getElementById("imageDisplay")
          .setAttribute("src", e.target.result);
      };
      reader.readAsDataURL(file1);
    }
  });
}
getImage();

function upload() {
  event.preventDefault(); // Prevent form
  document.querySelector(".submit-button").classList.add("submit-button-hover");

  // Get product information from input elements
  const identification = document.getElementById("productId").value.trim();
  const name = document.getElementById("productName").value.trim();
  const description = document
    .getElementById("productDescription")
    .value.trim();
  const costprice = document.getElementById("costPrice").value.trim();
  const seller = document.getElementById("seller").value.trim();
  const sellingprice = document.getElementById("productPrice").value.trim();
  const color = document.getElementById("productColor").value.trim();
  const productSize = document.getElementById("productSize").value.trim();
  const additionalInfo = document.getElementById("additionalInfo").value.trim();
  const quantity = 1;
  // const paths = ["TopPicks/products", "Popular/products"];

  const productContainer = document.getElementById("product-container");
  const progressBarFill = document.getElementById("progress-bar-fill");
  const progressPercentage = document.getElementById("progress-percentage");

  // Validate required fields
  if (
    !identification ||
    !name ||
    !description ||
    !costprice ||
    !sellingprice ||
    !color ||
    !productSize
  ) {
    noteBox.style.display = "block";
    notification.innerText = "All input fields must be filled out!";
    return;
  }

  const files = [
    document.getElementById("productImageMain").files[0],
    document.getElementById("productImage1").files[0],
    document.getElementById("productImage2").files[0],
    document.getElementById("productImage3").files[0],
    document.getElementById("productImage4").files[0],
  ].filter((file) => file !== undefined);

  // Ensure at least one image is selected
  if (files.length === 0) {
    noteBox.style.display = "block";
    notification.innerText = "Main Image Empty!";
    return;
  }

  progressBarFill.style.width = "0%";
  progressPercentage.innerText = "0%";

  // Track uploaded file references for rollback
  let uploadedFileRefs = [];

  // Calculate total bytes
  const totalBytes = files.reduce((acc, file) => acc + file.size, 0);
  let bytesTransferred = 0;

  // Upload images and get download URLs
  const uploadPromises = files.map((file, index) => {
    noteBox.style.display = "block";
    notification.innerText = "Initializing Storage!!";
    document.querySelector(".persist-error").style.display = "block";
    const storageRef = storage
      .ref()
      .child(`Empviv/${identification}/${file.name}`);
    uploadedFileRefs.push(storageRef); // Add to rollback list
    return storageRef.put(file).then((snapshot) => {
      noteBox.style.display = "block";
      notification.innerText = "Creating image reference!!";
      bytesTransferred += snapshot.bytesTransferred;
      const progress = (bytesTransferred / totalBytes) * 100;
      progressBarFill.style.width = `${progress}%`;
      progressPercentage.innerText = `${Math.round(progress)}%`;

      return snapshot.ref.getDownloadURL();
    });
  });

  // Handle upload promises
  Promise.all(uploadPromises)
    .then((downloadURLs) => {
      noteBox.style.display = "block";
      notification.innerText = "Creating database reference";
      // Prepare product data with image URLs
      const updates = {
        identification,
        name,
        description,
        costprice,
        seller,
        sellingprice,
        color,
        productSize,
        additionalInfo,
        quantity,
      };
      noteBox.style.display = "block";
      notification.innerText = "Database updating...";
      downloadURLs.forEach((url, index) => {
        updates[`image${index + 1}`] = url;
      });
      const sendRef = document.getElementById("refValue").innerText;
      // Push product data to database
      return db
        .ref(`${sendRef}/${identification}`)
        .set(updates)
        .then(() => {
          // Successfully added to database, no rollback needed
          noteBox.style.display = "block";
          notification.innerText = "Product and images uploaded successfully!!";
        });
    })
    .catch((error) => {
      // Rollback: Delete uploaded files
      const rollbackPromises = uploadedFileRefs.map((ref) => ref.delete());

      Promise.all(rollbackPromises)
        .then(() => {
          noteBox.style.display = "block";
          notification.innerText = `Error uploading images and rolled back: ${error.message}`;
        })
        .catch((rollbackError) => {
          noteBox.style.display = "block";
          notification.innerText = `Error during rollback: ${rollbackError.message}`;
        });
    });
}

// messaging script
function messageSetUp() {
  const firstUser = "Empviv";
  let chatID = "";

  const messageInput = document.getElementById("messageInput");
  const sendButton = document.getElementById("sendButton");
  const messageContainer = document.getElementById("messageContainer");

  // Sending message on button click
  sendButton.addEventListener("click", async () => {
    const messageText = messageInput.value.trim();
    if (messageText && chatID) {
      await fs.collection("chats").doc(chatID).collection("messages").add({
        senderID: firstUser,
        message: messageText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
      messageInput.value = "";
    }
  });

  // Function to open a new chat when a user is clicked
  function openNewChat(key) {
    const chatPage = document.getElementById("chatContainer");
    const inputBox = document.querySelector(".inputBox");
    inputBox.classList.add("showInputField");
    chatPage.classList.add("show");
    const chatBox = document.getElementById("messageContainer");
    chatBox.innerHTML = "";

    const otherUser = key;
    chatID = `chat_${[firstUser, otherUser].sort().join("_")}`;

    // Set up real-time message listener for this chat
    fs.collection("chats")
      .doc(chatID)
      .collection("messages")
      .orderBy("timestamp")
      .onSnapshot((snapshot) => {
        chatBox.innerHTML = ""; // Clear the chatBox before loading messages
        let lastMessageDate = ""; // To track the last date displayed

        snapshot.forEach((doc) => {
          const data = doc.data();
          const timestamp = data.timestamp;
          const messageDate = formatDate(new Date(timestamp.seconds * 1000));

          // Create message element
          const messageDiv = document.createElement("div");
          messageDiv.classList.add("message");
          messageDiv.classList.add(
            data.senderID === firstUser ? "sent" : "received"
          );
          messageDiv.textContent = data.message;

          // Add time below the message
          const timeSubscript = document.createElement("sub");
          timeSubscript.classList.add("message-time");
          timeSubscript.textContent = formatTime(
            new Date(timestamp.seconds * 1000)
          );
          messageDiv.appendChild(timeSubscript);

          // Check if the current message's date is different from the last message's date
          if (messageDate !== lastMessageDate) {
            const dateDiv = document.createElement("div");
            dateDiv.classList.add("date-divider");
            dateDiv.textContent = messageDate;

            // Append date before the message
            chatBox.appendChild(dateDiv);
            lastMessageDate = messageDate; // Update the last displayed date
          }

          // Append message to the chat box
          chatBox.appendChild(messageDiv);
        });

        // Scroll to the latest message
        chatBox.scrollTop = chatBox.scrollHeight;
      });
  }

  // Real-time listener for user data
  db.ref("USER/ADDRESS").on("value", function (snapshot) {
    let userData = snapshot.val();

    const userDiv = document.createElement("div");

    let usersWithLatestMessages = [];

    for (let key in userData) {
      const userName = userData[key].account;
      const otherUser = key;
      const chatID = `chat_${[firstUser, otherUser].sort().join("_")}`;

      // Real-time listener for latest message in each chat
      fs.collection("chats")
        .doc(chatID)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .limit(1)
        .onSnapshot((snapshot) => {
          if (!snapshot.empty) {
            const messageData = snapshot.docs[0].data();
            const timestamp = messageData.timestamp.seconds * 1000;

            updateUserData({
              key: key,
              userName: userName,
              latestMessage: messageData.message,
              timestamp: timestamp,
              messageDate: new Date(timestamp),
            });
          } else {
            updateUserData({
              key: key,
              userName: userName,
              latestMessage: "No messages yet.",
              timestamp: 0,
              messageDate: null,
            });
          }
        });
    }

    // Function to update user data and render users
    function updateUserData(updatedUser) {
      const index = usersWithLatestMessages.findIndex(
        (user) => user.key === updatedUser.key
      );

      if (index > -1) {
        usersWithLatestMessages[index] = updatedUser;
      } else {
        usersWithLatestMessages.push(updatedUser);
      }

      usersWithLatestMessages.sort((a, b) => b.timestamp - a.timestamp);
      renderUsers();
    }

    // Render users
    function renderUsers() {
      userDiv.innerHTML = "";

      usersWithLatestMessages.forEach((user) => {
        const fieldDiv = document.createElement("div");

        fieldDiv.innerHTML = `<div class="user-box" data-key="${user.key}">
                    <div class="user-image"></div>
                    <div class="userPage">
                        <strong>${user.userName}</strong>
                        <div class="latest-message-container">
                            <div class="latest-message">
                                ${user.latestMessage}
                            </div>
                            <div class="date-time-container">
                                <div class="latest-message-time">${
                                  user.timestamp
                                    ? formatTime(user.messageDate)
                                    : ""
                                }</div>
                                <div class="latest-message-date">${
                                  user.timestamp
                                    ? formatDate(user.messageDate)
                                    : ""
                                }</div>
                            </div>
                        </div>
                    </div>
                </div>`;

        userDiv.append(fieldDiv);
      });

      const page = document.getElementById("users");
      page.append(userDiv);

      document.querySelectorAll(".user-box").forEach((box) => {
        box.addEventListener("click", (event) => {
          const clickedKey = event.currentTarget.getAttribute("data-key");
          openNewChat(clickedKey);
        });
      });
    }
  });

  // Function to format time (e.g., "2:04 PM")
  function formatTime(date) {
    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return date.toLocaleTimeString(undefined, options);
  }

  // Function to format date (e.g., "Oct 15, 2024")
  function formatDate(date) {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString(undefined, options);
  }
}
// end of ms set up
// Function to close the chat
function closeChat() {
  const inputBox = document.querySelector(".inputBox");
  document.getElementById("chatContainer").classList.remove("show");
  inputBox.classList.remove("showInputField");
}
