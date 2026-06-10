const API_URL =
"https://script.google.com/macros/s/AKfycbwysnYv5hJixkVW83nJLMx0soAwsfhZ7s_mlqA9xsgPx1Y_9_M7k9C-p-639sxtMMmB/exec";

const CACHE_KEY =
"painelCifrasCache";

const CACHE_TIME_KEY =
"painelCifrasCacheTime";

const CACHE_DURATION =
24 * 60 * 60 * 1000; // 24 horas

const searchInput =
  document.getElementById("searchInput");

const searchBtn =
  document.getElementById("searchBtn");

const results =
  document.getElementById("results");

const playlist =
  document.getElementById("playlist");

let images = [];

let selectedSongs = [];

/* CARREGAMENTO */

loadImages();

async function loadImages(){

  const cachedData =
    localStorage.getItem(
      CACHE_KEY
    );

  const cachedTime =
    localStorage.getItem(
      CACHE_TIME_KEY
    );

  const now =
    Date.now();

  if(
    cachedData &&
    cachedTime &&
    now - Number(cachedTime)
      < CACHE_DURATION
  ){

    images =
      JSON.parse(cachedData);

    console.log(
      "Imagens carregadas do cache local"
    );

    return;

  }

  try{

    const response =
      await fetch(API_URL);

    const data =
      await response.json();

    images = data;

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify(data)
    );

    localStorage.setItem(
      CACHE_TIME_KEY,
      now.toString()
    );

    console.log(
      "Imagens carregadas do Apps Script"
    );

  }
  catch(error){

    console.error(
      "Erro ao carregar imagens:",
      error
    );

  }

}

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

  const filtered =
    images.filter(item =>

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

/* ADICIONAR */

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

/* REMOVER */

function removeFromPlaylist(id){

  selectedSongs =
    selectedSongs.filter(item =>

      item.id !== id

    );

  renderPlaylist();

}

/* LISTA */

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

    const nameElement =
      div.querySelector(
        ".playlist-name"
      );

    nameElement.addEventListener(
      "click",
      () => {

        openImage(item.id);

      }
    );

    let pressTimer;

    function iniciarRemocao(){

      pressTimer =
        setTimeout(() => {

          const ok =
            confirm(
              `Deseja remover "${item.name}" da lista?`
            );

          if(ok){

            removeFromPlaylist(
              item.id
            );

          }

        },700);

    }

    function cancelarRemocao(){

      clearTimeout(
        pressTimer
      );

    }

    nameElement.addEventListener(
      "touchstart",
      iniciarRemocao
    );

    nameElement.addEventListener(
      "touchend",
      cancelarRemocao
    );

    nameElement.addEventListener(
      "mousedown",
      iniciarRemocao
    );

    nameElement.addEventListener(
      "mouseup",
      cancelarRemocao
    );

    nameElement.addEventListener(
      "mouseleave",
      cancelarRemocao
    );

    playlist.appendChild(div);

  });

}

/* ABRIR IMAGEM */

function openImage(id){

  window.open(
    `https://lh3.googleusercontent.com/d/${id}`,
    "_blank"
  );

}

/* INICIAR */

renderPlaylist();
