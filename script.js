const API_URL =
"https://script.google.com/macros/s/AKfycbwysnYv5hJixkVW83nJLMx0soAwsfhZ7s_mlqA9xsgPx1Y_9_M7k9C-p-639sxtMMmB/exec";

const CACHE_KEY =
"painelCifrasCache";

const CACHE_TIME_KEY =
"painelCifrasCacheTime";

const CACHE_DURATION =
10 * 60 * 1000; // 10 minútos

const searchInput =
  document.getElementById("searchInput");

const results =
  document.getElementById("results");

const playlist =
  document.getElementById("playlist");

searchInput.addEventListener(
  "input",
  searchSongs
);

let images = [];

let selectedSongs = [];

let draggedIndex = null;

let currentDragElement = null;

function normalizeText(text){

  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

}

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

const text =
  await response.text();

const data =
  JSON.parse(text);

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

function searchSongs(){

  const value =
    normalizeText(
      searchInput.value.trim()
    );

  results.innerHTML = "";

  if(value === ""){
    return;
  }

  const filtered =
  images
    .filter(item =>
      normalizeText(item.name)
        .includes(value)
    )
    .slice(0,20);

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

        searchInput.value = "";
        results.innerHTML = "";
        searchInput.focus();

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

  const currentIndex = index;

    const div =
      document.createElement("div");

    div.className =
      "playlist-item";

    div.dataset.index =
  currentIndex;

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

    enableTouchDrag(
  div,
  currentIndex
);

    playlist.appendChild(div);

  });

}

function enableTouchDrag(
  element,
  index
){

  let startY = 0;

  element.addEventListener(
    "touchstart",
    (e)=>{

      startY =
        e.touches[0].clientY;

      draggedIndex =
        index;

      currentDragElement =
        element;

      element.classList.add(
        "dragging"
      );

    }
  );

  element.addEventListener(
    "touchmove",
    (e)=>{

      if(
        draggedIndex === null
      ){
        return;
      }

      const touch =
        e.touches[0];

      const target =
        document.elementFromPoint(
          touch.clientX,
          touch.clientY
        );

      const item =
        target?.closest(
          ".playlist-item"
        );

      document
        .querySelectorAll(
          ".playlist-item"
        )
        .forEach(el=>{

          el.classList.remove(
            "drag-over"
          );

        });

      if(
        item &&
        item !== element
      ){

        item.classList.add(
          "drag-over"
        );

      }

    }
  );

  element.addEventListener(
    "touchend",
    (e)=>{

      if(
        draggedIndex === null
      ){
        return;
      }

      const touch =
        e.changedTouches[0];

      const target =
        document.elementFromPoint(
          touch.clientX,
          touch.clientY
        );

      const item =
        target?.closest(
          ".playlist-item"
        );

      document
        .querySelectorAll(
          ".playlist-item"
        )
        .forEach(el=>{

          el.classList.remove(
            "drag-over"
          );

        });

      if(
        item
      ){

        const newIndex =
          Number(
            item.dataset.index
          );

        if(
          newIndex !==
          draggedIndex
        ){

          const movedItem =
            selectedSongs.splice(
              draggedIndex,
              1
            )[0];

          selectedSongs.splice(
            newIndex,
            0,
            movedItem
          );

          renderPlaylist();

        }

      }

      element.classList.remove(
        "dragging"
      );

      draggedIndex =
        null;

      currentDragElement =
        null;

    }
  );

}

/* VISUALIZADOR FULLSCREEN + NAVEGAÇÃO POR GESTO */

let currentImageIndex = -1;
let viewerHistoryPushed = false;

function openImage(id, updateHistory = true){

  const index = selectedSongs.findIndex(
    song => song.id === id
  );

  if(index === -1){
    return;
  }

  currentImageIndex = index;

  let viewer =
    document.getElementById(
      "fullscreenViewer"
    );

  if(!viewer){

    viewer =
      document.createElement("div");

    viewer.id =
      "fullscreenViewer";

    viewer.innerHTML = `
      <img
        id="fullscreenImage"
        src=""
        alt="Louvor"
        draggable="false"
      >
    `;

    document.body.appendChild(
      viewer
    );

    setupFullscreenSwipe(viewer);

  }

  updateFullscreenImage();

  if(updateHistory){

    history.pushState(
      { image:true },
      ""
    );

    viewerHistoryPushed = true;

  }
}

function updateFullscreenImage(){

  const viewer =
    document.getElementById(
      "fullscreenViewer"
    );

  const image =
    document.getElementById(
      "fullscreenImage"
    );

  if(
    !viewer ||
    !image ||
    currentImageIndex < 0 ||
    currentImageIndex >= selectedSongs.length
  ){
    return;
  }

  const item =
    selectedSongs[currentImageIndex];

  image.src =
    `https://lh3.googleusercontent.com/d/${item.id}`;

  image.alt =
    item.name || "Louvor";

}

function navigateFullscreen(direction){

  if(
    currentImageIndex < 0 ||
    selectedSongs.length === 0
  ){
    return;
  }

  const nextIndex =
    currentImageIndex + direction;

  if(
    nextIndex < 0 ||
    nextIndex >= selectedSongs.length
  ){
    return;
  }

  currentImageIndex = nextIndex;
  updateFullscreenImage();

}

function setupFullscreenSwipe(viewer){

  let startX = 0;
  let startY = 0;
  let tracking = false;

  viewer.addEventListener(
    "touchstart",
    (event) => {

      if(event.touches.length !== 1){
        tracking = false;
        return;
      }

      const touch =
        event.touches[0];

      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;

    },
    { passive:true }
  );

  viewer.addEventListener(
    "touchend",
    (event) => {

      if(!tracking){
        return;
      }

      tracking = false;

      const touch =
        event.changedTouches[0];

      const deltaX =
        touch.clientX - startX;

      const deltaY =
        touch.clientY - startY;

      const minimumSwipe = 60;

      // Só considera gesto horizontal quando ele é claramente maior
      // que o movimento vertical. Isso evita trocar de louvor
      // por acidente durante outros movimentos na tela.
      if(
        Math.abs(deltaX) < minimumSwipe ||
        Math.abs(deltaX) <= Math.abs(deltaY)
      ){
        return;
      }

      if(deltaX < 0){
        // Arrastar para a esquerda = próximo louvor
        navigateFullscreen(1);
      }else{
        // Arrastar para a direita = louvor anterior
        navigateFullscreen(-1);
      }

    },
    { passive:true }
  );

}

/* INICIAR */

renderPlaylist();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then(() => {
      console.log("SW registrado");
    });
}

window.addEventListener(
  "popstate",
  () => {

    const viewer =
      document.getElementById(
        "fullscreenViewer"
      );

    if(!viewer){
      viewerHistoryPushed = false;
      return;
    }

    if(document.fullscreenElement){

      document
        .exitFullscreen()
        .catch(()=>{});

    }

    viewer.remove();
    currentImageIndex = -1;
    viewerHistoryPushed = false;

  }
);
