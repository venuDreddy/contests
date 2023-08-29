const images = [
  "./images/AtCoder.jpg",
  "./images/codechef.jpg",
  "./images/codeforces.jpeg",
  "./images/codeforcesGym.png",
  "./images/hackerearth.png",
  "./images/hackerrank.png",
  "./images/leetcode.png",
  "./images/topCoder.png",
];
let contestData = [];
let failedFetch = [];
//urls
const sitesUrl = "https://kontests.net/api/v1/sites";
const platformUrl = "https://kontests.net/api/v1/";

//selecting containers
const platformContainer = document.querySelector(".platform-container");
const submitButtonContainer = document.querySelector(".submit-btn-container");
const contestContainer = document.querySelector(".contest-container");

//function to handle when platforms are selected
const handlePlatformButton = (e) => {
  e.target.classList.toggle("selected");
};

// To fetch and display avalible platforms provided by API and display error if an eroor occours while fetching
const getSites = async (sitesUrl) => {
  const response = await fetch(sitesUrl);
  if (response.ok) {
    const data = await response.json();
    platformContainer.innerHTML = "";
    data.forEach((platform, index) => {
      if (platform[0] !== "CS Academy" && platform[0] !== "Toph") {
        const element = document.createElement("button");
        element.classList.add("single-platform");
        element.innerText = platform[0];
        element.setAttribute("id", platform[1]);
        element.addEventListener("click", handlePlatformButton);
        platformContainer.appendChild(element);
      }
    });
    const submitElement = document.createElement("button");
    submitElement.classList.add("submit-btn");
    submitElement.innerText = "Get Contests";
    submitButtonContainer.appendChild(submitElement);
    submitElement.addEventListener("click", handleContestButton);
  } else {
    platformContainer.innerHTML = "";
    const element = document.createElement("h2");
    element.innerText = "There was a error while loading platforms.";
    platformContainer.appendChild(element);
  }
};

//invoking function to fetch platforms
getSites(sitesUrl);

//function to select the selected platforms and to invoke function which gets the contests information
const handleContestButton = () => {
  contestContainer.innerHTML = "";
  contestData = [];
  const platforms = document.querySelectorAll(".single-platform");
  const selectedPlatforms = Array.from(platforms).filter((platform) =>
    platform.classList.contains("selected")
  );
  const selectedPlatformsId = selectedPlatforms.map((platform) => {
    return platform.id;
  });
  getContests(selectedPlatformsId);
};

//function to fetch data from all platforms and sort them according to time
const getContests = async (selectedPlatformsId) => {
  if (selectedPlatformsId == 0) {
    contestContainer.innerHTML = `<div class="select">
    <h4>please select a platform</h4>
    </div>`;
  } else {
    contestContainer.innerHTML = `<div class="select">
    <h2 style="color:black">loading...</h2>
    </div>`;
    for (let i = 0; i < selectedPlatformsId.length; i++) {
      const contestUrl = platformUrl + selectedPlatformsId[i];
      await getEachContest(contestUrl, selectedPlatformsId[i]);
    }
    contestData = bubbleSort(contestData);
    displayData();
  }
};

//function to fetch a single platform data
const getEachContest = async (contestUrl, platform) => {
  const response = await fetch(contestUrl);
  if (response.ok) {
    const data = await response.json();
    data.forEach((contest) => {
      contest.imgUrl = images[getImage(platform)];
    });
    contestData = contestData.concat(data);
  } else {
    failedFetch = failedFetch.concat([platform]);
  }
};

//function to display the contests data
const displayData = () => {
  contestContainer.innerHTML = "";
  if (failedFetch.length > 0) {
    const element = document.createElement("div");
    element.innerHTML = `<h4>Unable to fetch contests from:${failedFetchPlatforms().toUpperCase()}
    </h4>`;
    contestContainer.appendChild(element);
  }
  if (contestData.length == 0) {
    const element = document.createElement("div");
    element.classList.add("select");
    element.innerHTML = `<h4>No contests available</h4>`;
    contestContainer.appendChild(element);
  }
  contestData.forEach(({ name, url, start_time, duration, status, imgUrl }) => {
    const singleContest = document.createElement("div");
    singleContest.classList.add("single-contest");
    const time = timeString(calculateTime(duration));

    singleContest.innerHTML = `<div class="image-container">
          <img src="${imgUrl}" alt="" class="img">
        </div>
        <div class="info-container">
          <p>Name: ${name}</p>
          <p>Time: ${new Date(start_time)}</p>
          <p>Duration:${time} </p>
          <p>Link: <a href="${url}" target="_blank">${url}</a></p>
          <p>Status:${status == "BEFORE" ? "Not Yet Commenced" : "ongoing"}
  </p>

        </div>`;
    contestContainer.appendChild(singleContest);
  });
};

//function to map platform and it's image
const getImage = (platform) => {
  if (platform === "at_coder") return 0;
  if (platform === "code_chef") return 1;
  if (platform === "codeforces") return 2;
  if (platform === "codeforces_gym") return 3;
  if (platform === "hacker_earth") return 4;
  if (platform === "hacker_rank") return 5;
  if (platform === "leet_code") return 6;
  if (platform === "top_coder") return 7;
};

//function to sort according to time
const bubbleSort = (array) => {
  let temp = {};
  for (i = 0; i < array.length - 1; i++) {
    for (j = 0; j < array.length - 1 - i; j++) {
      if (
        new Date(array[j].start_time).getTime() >
        new Date(array[j + 1].start_time).getTime()
      ) {
        temp = array[j];
        array[j] = array[j + 1];
        array[j + 1] = temp;
      }
    }
  }
  return array;
};

//function to convert seconds into years,months,days,hours,mins
const calculateTime = (seconds) => {
  const years = Math.floor(seconds / (60 * 60 * 24 * 365));
  seconds = seconds % (60 * 60 * 24 * 365);
  const months = Math.floor(seconds / (60 * 60 * 24 * 30));
  seconds = seconds % (60 * 60 * 24 * 30);
  const days = Math.floor(seconds / (60 * 60 * 24));
  seconds = seconds % (60 * 60 * 24);
  const hours = Math.floor(seconds / (60 * 60));
  seconds = seconds % (60 * 60);
  const mins = Math.floor(seconds / 60);
  const time = { years, months, days, hours, mins };
  return time;
};

//function to make years ,days,months,hours,mins into a string
const timeString = ({ years, months, days, hours, mins }) => {
  let string = "";
  if (years > 0) string += ` ${years} years`;
  if (months > 0) string += ` ${months} months`;
  if (days > 0) string += ` ${days} days`;
  if (hours > 0) string += ` ${hours} hours`;
  if (mins > 0) string += ` ${mins} minutes`;
  return string;
};
//function to return which platform contests failed to fetch
const failedFetchPlatforms = () => {
  let platforms = "";
  for (let i = 0; i < failedFetch.length; i++) {
    if (i == failedFetch.length - 1) platforms += failedFetch[i];
    else platforms += failedFetch[i] + ",";
  }
  return platforms;
};
