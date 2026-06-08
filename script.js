const API_URL =
"https://script.google.com/macros/s/AKfycbwysnYv5hJixkVW83nJLMx0soAwsfhZ7s_mlqA9xsgPx1Y_9_M7k9C-p-639sxtMMmB/exec";

const searchInput =
document.getElementById("searchInput");

const searchBtn =
document.getElementById("searchBtn");

const results =
document.getElementById("results");

const playlist =
document.getElementById("playlist");

const explorerBtn =
document.getElementById("explorerBtn");

let images = [];

let selectedSongs = [];

fetch(API_URL)
.then(response => response.json())
.then(data => {

  images = data;

});

searchBtn.addEventListener(
  "click",
  searchSongs
);

searchInput.addEventListener(
  "keypress",
  e => {

    if(e.key === "Enter"){

      searchSongs();

    }

  }
);

function searchSongs(){

  const value =
    searchInput.value
      .toLowerCase()
      .trim();

  results.innerHTML = "";

  if(value === ""){
    return;
  }

  const filtered =
    images.filter(item =>

      item.name
        .toLowerCase()
        .includes(value)

    );

  if(filtered.length === 0){

    results.innerHTML = `
      <div class="result-item">
        Nenhum resultado encontrado
      </div>
    `;

    return;

  }

  filtered.forEach(item => {

    const div =
      document.createElement("div");

    div.className =
      "result-item";

    div.innerHTML = `
      <div class="result-name">
        ${item.name}
      </div>
    `;

    div.addEventListener(
      "click",
      () => {

        addToPlaylist(item);

      }
    );

    results.appendChild(div);

  });

}

function addToPlaylist(item){

  const exists =
    selectedSongs.find(song =>

      song.id === item.id

    );

  if(exists){
    return;
  }

  selectedSongs.push(item);

  renderPlaylist();

}

function renderPlaylist(){

  playlist.innerHTML = "";

  if(selectedSongs.length === 0){

    playlist.innerHTML = `
      <div class="playlist-item">
        <div class="playlist-name">
          Nenhum louvor selecionado
        </div>
      </div>
    `;

    return;

  }

  selectedSongs.forEach((item,index)=>{

    const div =
      document.createElement("div");

    div.className =
      "playlist-item";

    div.innerHTML = `
      <div class="playlist-name">
        ${index + 1}. ${item.name}
      </div>
    `;

    div
      .querySelector(".playlist-name")
      .addEventListener(
        "click",
        () => {

          window.open(
            `https://lh3.googleusercontent.com/d/${item.id}`,
            "_blank"
          );

        }
      );

    playlist.appendChild(div);

  });

}

explorerBtn.addEventListener(
  "click",
  () => {

    window.open(
      API_URL,
      "_blank"
    );

  }
);

renderPlaylist();
