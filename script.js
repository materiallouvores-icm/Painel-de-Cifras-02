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

/* IMAGENS */

let images = [];

/* LISTA */

let selectedSongs = [];

/* CARREGA DADOS DO APPS SCRIPT */

fetch(API_URL)
  .then(response => response.json())
  .then(data => {

    images = data;

  })
  .catch(error => {

    console.error(
      "Erro ao carregar imagens:",
      error
    );

  });

/* BUSCA */

searchBtn.addEventListener(
  "click",
  searchSongs
);

searchInput.addEventListener(
  "keypress",
  (e) => {

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

  const filtered = images.filter(item =>

    item.name
      .toLowerCase()
      .includes(value)

  );

  if(filtered.length === 0){

    results.innerHTML = `
      <div class="result-item">
        <div class="result-name">
          Nenhum resultado encontrado
        </div>
      </div>
    `;

    return;

  }

  filtered.forEach(item => {

    const div =
      document.createElement("div");

    div.className = "result-item";

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

/* ADICIONAR À LISTA */

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

/* RENDERIZA */

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

  selectedSongs.forEach((item, index) => {

    const div =
      document.createElement("div");

    div.className = "playlist-item";

    div.innerHTML = `
      <div class="playlist-name">
        ${index + 1}. ${item.name}
      </div>
    `;

    const nameElement =
      div.querySelector(".playlist-name");

    nameElement.addEventListener(
      "click",
      () => {

        openImage(item.id);

      }
    );

    let pressTimer;

    nameElement.addEventListener(
      "touchstart",
      () => {

        pressTimer = setTimeout(() => {

          const confirmDelete =
            confirm(
              `Deseja remover "${item.name}" da lista?`
            );

          if(confirmDelete){

            removeFromPlaylist(item.id);

          }

        }, 700);

      }
    );

    nameElement.addEventListener(
      "touchend",
      () => {

        clearTimeout(pressTimer);

      }
    );

    nameElement.addEventListener(
      "mousedown",
      () => {

        pressTimer = setTimeout(() => {

          const confirmDelete =
            confirm(
              `Deseja remover "${item.name}" da lista?`
            );

          if(confirmDelete){

            removeFromPlaylist(item.id);

          }

        }, 700);

      }
    );

    nameElement.addEventListener(
      "mouseup",
      () => {

        clearTimeout(pressTimer);

      }
    );

    nameElement.addEventListener(
      "mouseleave",
      () => {

        clearTimeout(pressTimer);

      }
    );

    playlist.appendChild(div);

  });

}

/* REMOVER */

function removeFromPlaylist(id){

  selectedSongs =
    selectedSongs.filter(item =>

      item.id !== id

    );

  renderPlaylist();

}

/* ABRIR IMAGEM */

function openImage(id){

  const imageUrl =
    `https://lh3.googleusercontent.com/d/${id}`;

  window.open(
    imageUrl,
    "_blank"
  );

}

/* INICIAR */

renderPlaylist();
