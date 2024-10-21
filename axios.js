import * as Carousel from "./Carousel.js";
import axios from "axios";
import $ from "jquery"; // i had to trouble shoot many times

console.log("JavaScript is connected!"); // to check if my file was connected//
$(document).ready(function () {
  console.log("jQuery is working!");
});

/**
 * 4. Change all of your fetch() functions to axios!
 * - axios has already been imported for you within index.js.
 * - If you've done everything correctly up to this point, this should be simple.
 * - If it is not simple, take a moment to re-evaluate your original code.
 * - Hint: Axios has the ability to set default headers. Use this to your advantage
 *   by setting a default header with your API key so that you do not have to
 *   send it manually with all of your requests! You can also set a default base URL!
 */
// Set the base URL and default headers for axios
axios.defaults.baseURL = "https://api.thecatapi.com/v1/";
axios.defaults.headers.common["x-api-key"] =
  "live_7blkr7G0U0f5KrDrETToJEHRKQGB0QB8KFKYQZjNyZXxSlqrWnZpIgoik5Jj6aT9";
// part 5, 6 , 7
axios.interceptors.request.use((request) => {
  document.getElementById("progressBar").style.width = "0%";
  document.body.style.cursor = "progress";

  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();
  return request;
});

axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date().getTime();
    response.config.metadata.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;

    console.log(
      `Request took ${response.config.metadata.durationInMS} milliseconds.`
    );

    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.config.metadata.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;

    console.log(
      `Request took ${error.config.metadata.durationInMS} milliseconds.`
    );

    document.body.style.cursor = "default";
    throw error;
  }
);

async function initialLoad() {
  try {
    const response = await axios.get("breeds");
    const breeds = response.data;

    const breedSelect = document.getElementById("breedSelect");
    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id;
      option.textContent = breed.name;
      breedSelect.appendChild(option);
    });

    // Automatically load the carousel with the first breed when the page loads
    if (breeds.length > 0) {
      breedSelect.value = breeds[0].id; // Set the default selected breed
      await loadBreedData(breeds[0].id); // Load the first breed by default
    }
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
}

initialLoad();

// Add event listener for dropdown change
breedSelect.addEventListener("change", async (event) => {
  const selectedBreedId = event.target.value; // Get the selected breed ID
  await loadBreedData(selectedBreedId); // Load the selected breed data
});

async function loadBreedData(breedId) {
  console.log("Fetching breed data..."); // to check if this is working
  try {
    // Fetch breed-specific images
    const response = await axios.get(`images/search`, {
      params: {
        breed_ids: breedId,
        limit: 5,
      },
      onDownloadProgress: updateProgress,
    });
    const images = response.data;

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
      imgElement.alt = "Cat Image";
      imgElement.style.width = "100%"; // Adjust as needed
      imgElement.style.height = "auto";

      carouselItem.appendChild(imgElement);
      carouselInner.appendChild(carouselItem);
    });

    // Retrieve breed information
    const breedResponse = await axios.get(`breeds/${breedId}`);
    console.log("Breed info response:", breedResponse.data);
    const breedInfo = breedResponse.data;

    // Display breed info in infoDump
    if (breedInfo) {
      const infoText = document.createElement("p");
      infoText.innerHTML = `<strong>${breedInfo.name}</strong>: ${
        breedInfo.description || "No description available."
      }`;
      infoDump.appendChild(infoText);
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
 *    this part five is done on the top part of the file
 * 5. Add axios interceptors to log the time between request and response to the console.
 * - Hint: you already have access to code that does this!
 * - Add a console.log statement to indicate when requests begin.
 * - As an added challenge, try to do this on your own without referencing the lesson material.
 */

/**
 * 6. Next, we'll create a progress bar to indicate the request is in progress.
 * - The progressBar element has already been created for you.
 *  - You need only to modify its "width" style property to align with the request progress.
 * - In your request interceptor, set the width of the progressBar element to 0%.
 *  - This is to reset the progress with each request.
 * - Research the axios onDownloadProgress config option.
 * - Create a function "updateProgress" that receives a ProgressEvent object.
 *  - Pass this function to the axios onDownloadProgress config option in your event handler.
 * - console.log your ProgressEvent object within updateProgess, and familiarize yourself with its structure.
 *  - Update the progress of the request using the properties you are given.
 * - Note that we are not downloading a lot of data, so onDownloadProgress will likely only fire
 *   once or twice per request to this API. This is still a concept worth familiarizing yourself
 *   with for future projects.
 */

function updateProgress(progressEvent) {
  const total = progressEvent.total;
  const current = progressEvent.loaded;
  const percentCompleted = Math.round((current / total) * 100);
  document.getElementById("progressBar").style.width = percentCompleted + "%";
  console.log(progressEvent); // Inspect the progress event object
}

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  try {
    // First, get the list of favourites to see if the image is already favourited
    const response = await axios.get("favourites");
    const favourites = response.data;

    console.log("Current favourites:", favourites);

    // Check if the image is already favourited
    const isFavourited = favourites.some((fav) => fav.image_id === imgId);

    if (isFavourited) {
      // If it is favourited, remove it
      await axios.delete(
        `favourites/${favourites.find((fav) => fav.image_id === imgId).id}`
      );
      console.log(`Removed image ${imgId} from favourites.`);
    } else {
      // If it is not favourited, add it
      await axios.post("favourites", {
        image_id: imgId,
      });
      console.log(`Added image ${imgId} to favourites.`);
    }
  } catch (error) {
    console.error("Error managing favourites:", error);
  }
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

export async function getFavourites() {
  try {
    const response = await axios.get("favourites");
    const favourites = response.data;

    // Log the favourites array to inspect the structure
    console.log(favourites);

    // Clear the breed description
    const infoDump = document.getElementById("infoDump");
    infoDump.innerHTML = ""; // This will clear out the breed description

    const carouselInner = document.getElementById("carouselInner");
    carouselInner.innerHTML = ""; // Clear the current carousel items

    favourites.forEach((fav) => {
      const carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel-item");

      const imgElement = document.createElement("img");

      // Check if fav.image and fav.image.url exist before setting the src
      if (fav.image && fav.image.url) {
        imgElement.src = fav.image.url;
      } else {
        console.warn("No image URL found for favourite:", fav);
        imgElement.src = "placeholder.jpg"; // Optionally set a placeholder image
      }

      // imgElement.src = fav.image.url; // Assuming fav.image contains the URL
      imgElement.alt = "Favourited Cat Image";
      imgElement.style.width = "100%"; // Adjust as needed
      imgElement.style.height = "auto";

      carouselItem.appendChild(imgElement);
      carouselInner.appendChild(carouselItem);
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
  }
}

// // Bind the event listener to the button

document
  .getElementById("getFavouritesBtn")
  .addEventListener("click", getFavourites);

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
