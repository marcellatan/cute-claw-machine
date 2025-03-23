document.addEventListener("DOMContentLoaded", () => {
    const claw = document.getElementById("claw");
    const toysContainer = document.getElementById("toys-container");
    const collectionBtn = document.getElementById("collectionBtn");
    const collectionSidebar = document.getElementById("collectionSidebar");
    const closeSidebar = document.getElementById("closeSidebar");
    const collectionList = document.getElementById("collectionList");
    const startModal = document.getElementById("startModal");
    const modalLoginBtn = document.getElementById("modalLoginBtn");
    const modalGuestBtn = document.getElementById("modalGuestBtn");
    const btnGrab = document.getElementById("btnGrab"); // Reference to grab button
    
    // Get toy card modal elements
    const toyCaughtModal = document.getElementById('toyCaughtModal');
    const closeToyCard = document.getElementById('closeToyCard');
    const continuePlay = document.getElementById('continuePlay');
    
    // Global close functions for toy card
    if (closeToyCard && continuePlay) {
        // These will be overridden when the card is shown, but good to have as fallbacks
        closeToyCard.addEventListener('click', () => {
            toyCaughtModal.style.display = "none";
        });
        
        continuePlay.addEventListener('click', () => {
            toyCaughtModal.style.display = "none";
        });
    }

    // Show the start modal when page loads
    startModal.style.display = "flex";

    // Modal button handlers
    modalLoginBtn.addEventListener("click", () => {
        // In a real app, you would redirect to login page or show login form
        alert("Login functionality would be implemented here");
        isGuest = false;
        startModal.style.display = "none";
        loadSavedCollection();
    });

    modalGuestBtn.addEventListener("click", () => {
        isGuest = true;
        startModal.style.display = "none";
    });

    // Collection sidebar handlers
    collectionBtn.addEventListener("click", () => {
        collectionSidebar.classList.add("open");
        renderCollection();
    });

    closeSidebar.addEventListener("click", () => {
        collectionSidebar.classList.remove("open");
    });

    // Updated clawPosition to start in the middle of the range
    let clawPosition = 238; // Middle between 150 and 325
    const leftMin = 150; // Minimum left boundary
    const leftMax = 325; // Maximum left boundary
    const moveStep = 25; // Amount to move on each button press
    
    let collectedToys = [];
    let isGuest = true;
    let isGrabbing = false;

    const toys = [
        { id: 1, name: "Bunny", img: "🐰" },
        { id: 2, name: "Bear", img: "🐻" },
        { id: 3, name: "Chick", img: "🐥" },
        { id: 4, name: "Panda", img: "🐼" },
        { id: 5, name: "Fox", img: "🦊" },
        { id: 6, name: "Cat", img: "🐱" }
    ];

    function loadToys() {
        toysContainer.innerHTML = "";
        
        // Modified: Expanded grid system for wider distribution
        const grid = {
            columns: 5,   // Number of columns in our grid
            rows: 2,      // Number of rows in our grid
            cellWidth: 45, // Width of each cell
            cellHeight: 45, // Height of each cell
            positions: [] // Will hold occupied positions
        };
        
        // Initialize grid positions as unoccupied
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.columns; col++) {
                grid.positions.push({
                    row,
                    col,
                    occupied: false
                });
            }
        }
        
        // Shuffle the toys to randomize which gets placed first
        const shuffledToys = [...toys].sort(() => Math.random() - 0.5);
        
        // Add some random duplicates to make the game more interesting
        const toysWithDuplicates = [...shuffledToys];
        
        // Add 2-3 random duplicates
        const numDuplicates = Math.floor(Math.random() * 2) + 2;
        for (let i = 0; i < numDuplicates; i++) {
            const randomToy = shuffledToys[Math.floor(Math.random() * shuffledToys.length)];
            toysWithDuplicates.push(randomToy);
        }
        
        // Shuffle again after adding duplicates
        toysWithDuplicates.sort(() => Math.random() - 0.5);
        
        toysWithDuplicates.forEach((toy) => {
            const toyElement = document.createElement("div");
            toyElement.classList.add("toy");
            toyElement.dataset.id = toy.id;
            toyElement.dataset.name = toy.name;
            toyElement.innerHTML = toy.img;
            
            // Find an unoccupied position
            const availablePositions = grid.positions.filter(pos => !pos.occupied);
            
            // If no positions left, create a random one that might overlap (fallback)
            if (availablePositions.length === 0) {
                const randomLeft = Math.floor(Math.random() * 150); // Wider range
                const randomBottom = Math.floor(Math.random() * 100) + 170; // More vertical range
                
                toyElement.style.left = `${randomLeft}px`;
                toyElement.style.bottom = `${randomBottom}px`;
            } else {
                // Get a random available position
                const randomIndex = Math.floor(Math.random() * availablePositions.length);
                const position = availablePositions[randomIndex];
                
                // Mark as occupied
                position.occupied = true;
                
                // Calculate pixel position with some random offset for naturalness
                const leftOffset = Math.floor(Math.random() * 10) - 5; // -5 to +5 pixel randomness
                const bottomOffset = Math.floor(Math.random() * 10) - 5; // -5 to +5 pixel randomness
                
                const left = position.col * grid.cellWidth + leftOffset;
                // Wider bottom range (170-270px)
                const bottom = 220 + (position.row * grid.cellHeight) + bottomOffset;
                
                toyElement.style.left = `${left}px`;
                toyElement.style.bottom = `${bottom}px`;
            }
            
            // Randomly rotate the toys for more natural appearance
            const rotation = Math.floor(Math.random() * 20) - 10; // -10 to +10 degrees
            toyElement.style.transform = `rotate(${rotation}deg)`;
            
            // Visual styles
            toyElement.style.backgroundColor = "#FFE8F0";
            toyElement.style.border = "2px solid #FF69B4";
            toyElement.style.zIndex = "5";
            
            toysContainer.appendChild(toyElement);
            
            // Debug - log toy position
            console.log(`Toy ${toy.name} positioned at left: ${toyElement.style.left}, bottom: ${toyElement.style.bottom}`);
        });
    }

    function loadSavedCollection() {
        const savedCollection = localStorage.getItem('toyCollection');
        if (savedCollection) {
            collectedToys = JSON.parse(savedCollection);
            renderCollection();
        }
    }

    function saveCollection() {
        if (!isGuest) {
            localStorage.setItem('toyCollection', JSON.stringify(collectedToys));
        }
    }

    function renderCollection() {
        collectionList.innerHTML = "";
        if (collectedToys.length === 0) {
            collectionList.innerHTML = "<p>No toys collected yet!</p>";
            return;
        }
        
        collectedToys.forEach(toy => {
            const toyItem = document.createElement("div");
            toyItem.classList.add("collection-item");
            toyItem.innerHTML = `
                <span>${toy.img}</span>
                <span>${toy.name}</span>
            `;
            collectionList.appendChild(toyItem);
        });
    }

    // Check if toy is already in collection
    function isToyInCollection(toyId) {
        return collectedToys.some(toy => toy.id === toyId);
    }

    // Set initial claw position
    claw.style.left = clawPosition + "px";

    document.addEventListener("keydown", (event) => {
        if (isGrabbing) return; // Prevent movement during grab action
        
        if (event.key === "ArrowLeft" && clawPosition > leftMin) {
            clawPosition = Math.max(leftMin, clawPosition - moveStep);
            // Show the left button being pressed
            document.getElementById('btnLeftImg').classList.add('pressed');
            setTimeout(() => {
                document.getElementById('btnLeftImg').classList.remove('pressed');
            }, 200);
        } else if (event.key === "ArrowRight" && clawPosition < leftMax) {
            clawPosition = Math.min(leftMax, clawPosition + moveStep);
            // Show the right button being pressed
            document.getElementById('btnRightImg').classList.add('pressed');
            setTimeout(() => {
                document.getElementById('btnRightImg').classList.remove('pressed');
            }, 200);
        } else if (event.key === " " || event.key === "Enter") {
            // Added space and enter as grab keys
            grabToy();
        }
        claw.style.left = clawPosition + "px";
    });

    function grabToy() {
        if (isGrabbing) return; // Prevent multiple grab actions
        
        isGrabbing = true;
        
        // Show the grab button being pressed
        document.getElementById('btnGrabImg').classList.add('pressed');
        setTimeout(() => {
            document.getElementById('btnGrabImg').classList.remove('pressed');
        }, 200);
        
        // Change to long claw image (if you have one)
        // For now using same image, but you can update this when you have a long claw asset
        const clawImg = claw.querySelector('img');
        
        // Animate claw going down
        setTimeout(() => {
            // Check if we caught any toy
            const toys = document.querySelectorAll('.toy');
            let caughtToy = null;
            
            toys.forEach(toy => {
                const toyRect = toy.getBoundingClientRect();
                const clawRect = claw.getBoundingClientRect();
                
                // Improved collision detection - check if claw center is within toy boundaries
                // with some tolerance to make game more playable
                const clawCenterX = clawRect.left + (clawRect.width / 2);
                const tolerance = 25; // Pixel tolerance to make grabbing easier
                
                if (clawCenterX > toyRect.left - tolerance && 
                    clawCenterX < toyRect.right + tolerance) {
                    caughtToy = toy;
                    console.log("Caught toy!");
                }
            });
            
            if (caughtToy) {
                // Attach toy to claw
                const toyId = parseInt(caughtToy.dataset.id);
                const toyName = caughtToy.dataset.name;
                const toyImg = caughtToy.innerHTML;
                
                caughtToy.style.bottom = 'auto';
                caughtToy.style.top = '45px'; 
                caughtToy.style.left = '0';
                caughtToy.style.transform = 'rotate(0deg)'; // Reset rotation
                
                claw.appendChild(caughtToy);
                
                // Move claw to drop zone - center position
                setTimeout(() => {
                    claw.style.left = Math.floor((leftMin + leftMax) / 2) + "px";
                    clawPosition = Math.floor((leftMin + leftMax) / 2);
                    
                    // Drop the toy after reaching the drop zone
                    setTimeout(() => {
                        // Check if toy is already in collection
                        const isDuplicate = isToyInCollection(toyId);
                        
                        // Show the toy card instead of alert
                        const toyImage = document.querySelector('.toy-image');
                        const toyCardName = document.getElementById('toyCardName');
                        const toyCardStatus = document.getElementById('toyCardStatus');
                        
                        // Set toy details
                        toyImage.innerHTML = toyImg;
                        toyCardName.textContent = toyName;
                        
                        if (!isDuplicate) {
                            // Add to collection only if it's not a duplicate
                            const toy = {
                                id: toyId,
                                name: toyName,
                                img: toyImg
                            };
                            
                            collectedToys.push(toy);
                            saveCollection();
                            
                            toyCardStatus.textContent = "Added to your collection!";
                        } else {
                            // Notify it's a duplicate
                            toyCardStatus.textContent = "You already have this toy in your collection!";
                        }
                        
                        // Show the modal
                        toyCaughtModal.style.display = "flex";
                        
                        // Close button event listener
                        closeToyCard.onclick = function() {
                            toyCaughtModal.style.display = "none";
                            
                            // Reset claw
                            claw.removeChild(caughtToy);
                            isGrabbing = false;
                            
                            // Reload toys
                            loadToys();
                        };
                        
                        // Continue button event listener
                        continuePlay.onclick = function() {
                            toyCaughtModal.style.display = "none";
                            
                            // Reset claw
                            claw.removeChild(caughtToy);
                            isGrabbing = false;
                            
                            // Reload toys
                            loadToys();
                        };
                    }, 1000);
                }, 1000);
            } else {
                // Reset claw if nothing caught
                setTimeout(() => {
                    isGrabbing = false;
                }, 1000);
            }
        }, 1000);
    }

    // Button controls
    document.getElementById('btnLeft').addEventListener('click', () => {
        if (isGrabbing) return;
        
        if (clawPosition > leftMin) {
            clawPosition = Math.max(leftMin, clawPosition - moveStep);
            document.getElementById('btnLeftImg').classList.add('pressed');
            setTimeout(() => {
                document.getElementById('btnLeftImg').classList.remove('pressed');
            }, 200);
            claw.style.left = clawPosition + "px";
        }
    });

    document.getElementById('btnRight').addEventListener('click', () => {
        if (isGrabbing) return;
        
        if (clawPosition < leftMax) {
            clawPosition = Math.min(leftMax, clawPosition + moveStep);
            document.getElementById('btnRightImg').classList.add('pressed');
            setTimeout(() => {
                document.getElementById('btnRightImg').classList.remove('pressed');
            }, 200);
            claw.style.left = clawPosition + "px";
        }
    });

    document.getElementById('btnGrab').addEventListener('click', grabToy);

    // Initialize game
    loadToys();
    console.log("Game initialized, toys loaded");
});