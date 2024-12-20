const firebaseConfig = {
    apiKey: "AIzaSyCG7fRw21apfTA36HKl5LbVWiHI_8zk12A",
    authDomain: "signup-bfcf8.firebaseapp.com",
    databaseURL: "https://signup-bfcf8-default-rtdb.firebaseio.com",
    projectId: "signup-bfcf8",
    storageBucket: "signup-bfcf8.appspot.com",
    messagingSenderId: "862509936181",
    appId: "1:862509936181:web:6a16490f27a97bac7bcb7c"
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
    "Category/automobile"
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
    paths.forEach(path => {
        db.ref(path).once("value", snapshot => {
            snapshot.forEach(childSnapshot => {
                const product = childSnapshot.val();
                const productId = childSnapshot.key;
                allProducts.push({
                    ...product,
                    id: productId,
                    path: path
                });
            });
            displayProducts(allProducts);
        });
    });
}

// Function to display products
function displayProducts(products) {
    productContainer.innerHTML = "";
    products.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${product.image1}" alt="${product.name}" />
            <div class="product-card-content">
                <h3>${product.name}</h3>
                <p>Ghc${product.sellingprice}</p>
                <p>${product.identification}</p>
            </div>
            <div class="product-card-actions">
                <button class="edit-button"><svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" height="1.5em" width="1.5em"><path fill="currentColor" d="M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8Zm30.7-24.3-6.4-6.4 2.1-2.1q.85-.85 2.125-.825 1.275.025 2.125.875L41.8 8.4q.85.85.85 2.1t-.85 2.1ZM7.5 42q-.65 0-1.075-.425Q6 41.15 6 40.5v-4.3q0-.3.1-.55.1-.25.35-.5L31.2 10.4l6.4 6.4-24.75 24.75q-.25.25-.5.35-.25.1-.55.1Zm24.75-26.25-1.1-1.1 2.2 2.2Z"/></svg></button>
                <button class="delete-button">Delete</button>
            </div>
        `;

        // Append the card to the container
        productContainer.appendChild(card);

        // Add event listeners for the Edit button
        const editButton = card.querySelector(".edit-button");
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

            // Change button text when clicked
            editButton.textContent = "Editing...";
        });

        // Add event listener for the Delete button
        const deleteButton = card.querySelector(".delete-button");
        deleteButton.addEventListener("click", () => {
            deleteProduct(product.identification, product.path);

            // Change button text when clicked
            deleteButton.textContent = "Deleting...";
        });
    });
}

// Function to search products
function searchProducts() {
    const searchTerm = document
        .getElementById("search-input")
        .value.toLowerCase();
    const filteredProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    );
    displayProducts(filteredProducts);
}

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
            color
        })
        .then(() => {
            alert("Product updated successfully");
            getProducts(); // Refresh products
            document.getElementById("edit-container").style.display = "none";
        })
        .catch(error => console.error("Error updating product:", error));
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

    db.ref(`${path}/${productId}`).once("value", snapshot => {
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
            .then(result => {
                if (result.items.length === 0) {
                    noteBox.style.display = "flex";
                    notification.innerText = "Folder not found or empty.";
                    deleteButton.innerText = "Delete"; // Reset button text
                    return;
                }

                // If folder matches, delete its contents
                const promises = result.items.map(itemRef => itemRef.delete());

                // Wait for all delete promises to resolve
                return Promise.all(promises);
            })
            .then(() => {
                // Delete the product from the database
                return db.ref(`${path}/${productId}`).remove();
            })
            .then(() => {
                noteBox.style.display = "block";
                notification.innerText =
                    "Product and its folder deleted successfully";
                getProducts(); // Refresh products
            })
            .catch(error => {
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
function showPaths() {
    document.getElementById("order-path-view").classList.remove("order-hidden");
    document.getElementById("order-content-view").classList.add("order-hidden");
    loadPaths();
}

// Function to show content view
function showContent(path) {
    document.getElementById("order-path-view").classList.add("order-hidden");
    document
        .getElementById("order-content-view")
        .classList.remove("order-hidden");
    loadContent(path);
}

// Function to hide loader
function hideLoader() {
    document.getElementById("order-loader-wrapper").style.display = "none";
}

// Load paths from Firebase
function loadPaths() {
    db.ref("CHECKOUT")
        .once("value")
        .then(snapshot => {
            const dataList = document.getElementById("order-data-list");
            dataList.innerHTML = "";
            snapshot.forEach(childSnapshot => {
                const path = childSnapshot.key;
                let additionalInfo = "";
                let imagesHtml = "";
                let username = "Unknown User";
                const images = [];

                childSnapshot.forEach(grandchildSnapshot => {
                    const childData = grandchildSnapshot.val();
                    additionalInfo = `
                                    <p>Contact: ${
                                        childData.contact || "N/A"
                                    }</p>
                                    <p>Address: ${
                                        childData.location || "N/A"
                                    }</p>
                                    <p>City: ${childData.city || "N/A"}</p>
                                    <p>Birthday: ${
                                        childData.birthday || "N/A"
                                    }</p>
                                    <p>Email: ${childData.email || "N/A"}</p>
                                    <p>Account: ${
                                        childData.account || "N/A"
                                    }</p>
                                `;
                    if (childData.username) {
                        username = childData.username;
                    }
                    if (childData.image1) {
                        images.push(childData.image1);
                    }
                });

                if (images.length > 0) {
                    imagesHtml = `
                                    <div class="order-small-images">
                                        <img src="${images[0]}" alt="Image 1">
                                        ${
                                            images.length > 1
                                                ? `<img src="${images[1]}" alt="Image 2">`
                                                : ""
                                        }
                                    </div>
                                `;
                }

                const card = document.createElement("div");
                card.className = "order-card";
                card.innerHTML = `
                                <h3>${username}</h3>
                                ${imagesHtml}
                                ${additionalInfo}
                            `;
                card.onclick = () => showContent(path);
                dataList.appendChild(card);
            });

            hideLoader(); // Hide the loader once data is loaded
            document
                .getElementById("order-path-view")
                .classList.remove("order-hidden");
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            hideLoader(); // Hide the loader even if there's an error
        });
}

// Load content for a specific path from Firebase
function loadContent(path) {
    db.ref(`CHECKOUT/${path}`)
        .once("value")
        .then(snapshot => {
            const contentList = document.getElementById("order-content-list");
            contentList.innerHTML = "";
            const data = snapshot.val();
            if (data) {
                Object.keys(data).forEach(key => {
                    const item = data[key];
                    const card = document.createElement("div");
                    card.className = "order-card";

                    const image = document.createElement("img");
                    const price = document.createElement("p");
                    const seller = document.createElement("p");
                    const id = document.createElement("p");
                    const description = document.createElement("p");
                    const additionalInfo = document.createElement("p");
                    const size = document.createElement("p");
                    const color = document.createElement("p");

                    image.src =
                        item.image1 || "https://via.placeholder.com/300"; // Default image
                    price.textContent = `Price: Ghc${item.price || "N/A"}`;
                    seller.textContent = `Seller: ${item.seller || "N/A"}`;
                    id.textContent = `ID: ${item.id || "N/A"}`;
                    description.textContent = `Description: ${
                        item.description || "N/A"
                    }`;
                    additionalInfo.textContent = `Additional Info: ${
                        item.additionalInfo || "N/A"
                    }`;
                    size.textContent = `Size: ${item.size || "N/A"}`;
                    color.textContent = `Color: ${item.color || "N/A"}`;

                    // Append elements to card
                    card.appendChild(image);
                    card.appendChild(price);
                    card.appendChild(seller);
                    card.appendChild(id);
                    card.appendChild(description);
                    card.appendChild(additionalInfo);
                    card.appendChild(size);
                    card.appendChild(color);

                    contentList.appendChild(card);
                });
            } else {
                contentList.style.backgroundColor = "black";
            }

            hideLoader(); // Hide the loader once content is loaded
        })
        .catch(error => {
            console.error("Error fetching content:", error);
            document.getElementById("order-content-list").textContent =
                "Error loading content.";
            hideLoader(); // Hide the loader even if there's an error
        });
}

// Initialize the page view based on URL parameter
(function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const path = urlParams.get("path");
    if (path) {
        showContent(path);
    } else {
        showPaths();
    }
})();

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
    const hambar = document.querySelector(
        ".ham-menu-container span:nth-child(1)"
    );
    const hambar1 = document.querySelector(
        ".ham-menu-container span:nth-child(2)"
    );
    const hambar2 = document.querySelector(
        ".ham-menu-container span:nth-child(3)"
    );
    if (menu.style.right === "145px") {
        menu.style.right = "400px";
        menu.style.transition = "0.3s ease";
        hambar.classList.remove("active");
        hambar1.classList.remove("active");
        hambar2.classList.remove("active");
    } else {
        menu.style.right = "145px";
        menu.style.transition = "0.3s ease";
        hambar.classList.add("active");
        hambar1.classList.add("active");
        hambar2.classList.add("active");
    }
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
    document
        .getElementById("fileInput")
        .addEventListener("change", function () {
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
    document
        .querySelector(".submit-button")
        .classList.add("submit-button-hover");

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
    const additionalInfo = document
        .getElementById("additionalInfo")
        .value.trim();
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
        document.getElementById("productImage4").files[0]
    ].filter(file => file !== undefined);

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
        return storageRef.put(file).then(snapshot => {
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
        .then(downloadURLs => {
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
                quantity
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
                    notification.innerText =
                        "Product and images uploaded successfully!!";
                });
        })
        .catch(error => {
            // Rollback: Delete uploaded files
            const rollbackPromises = uploadedFileRefs.map(ref => ref.delete());

            Promise.all(rollbackPromises)
                .then(() => {
                    noteBox.style.display = "block";
                    notification.innerText = `Error uploading images and rolled back: ${error.message}`;
                })
                .catch(rollbackError => {
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
            await fs
                .collection("chats")
                .doc(chatID)
                .collection("messages")
                .add({
                    senderID: firstUser,
                    message: messageText,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
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
            .onSnapshot(snapshot => {
                chatBox.innerHTML = ""; // Clear the chatBox before loading messages
                let lastMessageDate = ""; // To track the last date displayed

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const timestamp = data.timestamp;
                    const messageDate = formatDate(
                        new Date(timestamp.seconds * 1000)
                    );

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
                .onSnapshot(snapshot => {
                    if (!snapshot.empty) {
                        const messageData = snapshot.docs[0].data();
                        const timestamp = messageData.timestamp.seconds * 1000;

                        updateUserData({
                            key: key,
                            userName: userName,
                            latestMessage: messageData.message,
                            timestamp: timestamp,
                            messageDate: new Date(timestamp)
                        });
                    } else {
                        updateUserData({
                            key: key,
                            userName: userName,
                            latestMessage: "No messages yet.",
                            timestamp: 0,
                            messageDate: null
                        });
                    }
                });
        }

        // Function to update user data and render users
        function updateUserData(updatedUser) {
            const index = usersWithLatestMessages.findIndex(
                user => user.key === updatedUser.key
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

            usersWithLatestMessages.forEach(user => {
                const fieldDiv = document.createElement("div");

                fieldDiv.innerHTML = `<div class="user-box" data-key="${
                    user.key
                }">
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

            document.querySelectorAll(".user-box").forEach(box => {
                box.addEventListener("click", event => {
                    const clickedKey =
                        event.currentTarget.getAttribute("data-key");
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
            hour12: true
        };
        return date.toLocaleTimeString(undefined, options);
    }

    // Function to format date (e.g., "Oct 15, 2024")
    function formatDate(date) {
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric"
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
