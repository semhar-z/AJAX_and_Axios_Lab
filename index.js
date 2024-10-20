import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

// Part 1: The API
// Step 0: Store your API key here for reference and easy access.
const url = "https://api.thecatapi.com/v1/images/search";

const API_KEY =
  "live_7blkr7G0U0f5KrDrETToJEHRKQGB0QB8KFKYQZjNyZXxSlqrWnZpIgoik5Jj6aT9";

// Part 2: Tasks

/**
 * 1. Create an async function "initialLoad" that does the following:
 * - Retrieve a list of breeds from the cat API using fetch().
 * - Create new <options> for each of these breeds, and append them to breedSelect.
 *  - Each option should have a value attribute equal to the id of the breed.
 *  - Each option should display text equal to the name of the breed.
 * This function should execute immediately.
 */
async function initialLoad() {
  try {
    const response = await fetch("https://api.thecatapi.com/v1/breeds", {
      headers: {
        "x-api-key": API_KEY, // Use the API key here
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch breeds");
    }

    const breeds = await response.json();

    const breedSelect = document.getElementById("breedSelect");

    // Add a default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a breed";
    breedSelect.appendChild(defaultOption);

    // Create and append options for each breed
    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Automatically load the carousel with the first breed when the page loads
    if (breeds.length > 0) {
      breedSelect.value = breeds[0].id; // Set the default selected breed
      loadBreedData(breeds[0].id); // Load the first breed by default
    }
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
}

initialLoad();

/**
 * 2. Create an event handler for breedSelect that does the following:
 * - Retrieve information on the selected breed from the cat API using fetch().
 *  - Make sure your request is receiving multiple array items!
 *  - Check the API documentation if you're only getting a single object.
 * - For each object in the response array, create a new element for the carousel.
 *  - Append each of these new elements to the carousel.
 * - Use the other data you have been given to create an informational section within the infoDump element.
 *  - Be creative with how you create DOM elements and HTML.
 *  - Feel free to edit index.html and styles.css to suit your needs, but be careful!
 *  - Remember that functionality comes first, but user experience and design are important.
 * - Each new selection should clear, re-populate, and restart the Carousel.
 * - Add a call to this function to the end of your initialLoad function above to create the initial carousel.
 */

// Assuming breedSelect is the dropdown element
// Fetch and update the carousel with images for the selected breed
// Event listener for breed selection change
// Event handler for the breed selection dropdown

document
  .getElementById("breedSelect")
  .addEventListener("change", async (event) => {
    const breedId = event.target.value;
    if (breedId) {
      await loadBreedData(breedId); // Fetch and display the data for the selected breed
    }
  });

// Function to load breed data
async function loadBreedData(breedId) {
  try {
    // Fetch breed-specific images
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=5`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch breed data");
    }

    const images = await response.json();

    const carouselInner = document.getElementById("carouselInner");
    const infoDump = document.getElementById("infoDump");
    carouselInner.innerHTML = ""; // Clear the current carousel items
    infoDump.innerHTML = ""; // Clear the current breed info

    // Check if any images are returned
    if (images.length === 0) {
      infoDump.innerHTML = "<p>No images found for this breed.</p>";
      return; // Exit the function if no images were found
    }

    // Create new carousel items for each image
    images.forEach((imageData, index) => {
      const carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel-item");

      // Set the first item to be active for Bootstrap carousel functionality
      if (index === 0) {
        carouselItem.classList.add("active");
      }

      const imgElement = document.createElement("img");
      imgElement.src = imageData.url; // Set the image URL
      imgElement.alt = "Cat";
      imgElement.style.width = "100%"; // Adjust as needed
      imgElement.style.height = "auto";

      carouselItem.appendChild(imgElement);
      carouselInner.appendChild(carouselItem);
    });

    // Retrieve breed information separately if needed
    const breedResponse = await fetch(
      `https://api.thecatapi.com/v1/breeds/${breedId}`,

      {
        headers: {
          "x-api-key": API_KEY, // Use your API key here
        },
      }
    );
    if (!breedResponse.ok) {
      throw new Error("Failed to fetch breed info");
    }

    const breedInfo = await breedResponse.json();

    // Display breed info in infoDump
    if (breedInfo) {
      const infoText = document.createElement("p");
      infoText.innerHTML = `<strong>${breedInfo.name}</strong>: ${
        breedInfo.description || "No description available."
      }`;
      infoDump.appendChild(infoText);

      // Add temperament information
      if (breedInfo.temperament) {
        const temperamentText = document.createElement("p");
        temperamentText.innerHTML = `<strong>Temperament:</strong> ${breedInfo.temperament}`;
        infoDump.appendChild(temperamentText);
      }
    } else {
      const infoText = document.createElement("p");
      infoText.textContent = "No additional breed information available.";
      infoDump.appendChild(infoText);
    }
  } catch (error) {
    console.error("Error loading breed data:", error); // Handle errors
  }
}

/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */
// I created a new file axios.js
