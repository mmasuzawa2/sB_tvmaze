"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $epList = $('#episodes-list');



/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(query) {

  const showsData = await axios.get("https://api.tvmaze.com/search/shows", {params: {
    q:query

  }});

  const result = showsData.data;
  const defaultImg = 'https://s24526.pcdn.co/wp-content/uploads/woocommerce-placeholder-300x300.png';



  return result.map(data => {
    return {
      id: data.show.id,
      name: data.show.name,
      summary: data.show.summary,
      image: data.show.image ? data.show.image.medium : defaultImg
    }
  });

  
}



/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes" name="epBtn" id="${show.id}">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  
  }

  const episodeBtns = new Set( document.getElementsByName('epBtn'));
  for(let btn of episodeBtns){
    btn.addEventListener("click",  async function(e){
      const episodes = await getEpisodesOfShow(btn.getAttribute('id'));
      populateEpisodes(episodes);
    });
  }
}



/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = document.getElementById('search-query').value;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {

  const episodesData = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`
  );

  return episodesData.data.map( data=> {
    return{
      name: data.name,
      season: data.season,
      number:data.number
    }
  });
}


function populateEpisodes(episodes) { 
   $epList.empty();


  for(let ep of episodes){
    let epItem = document.createElement('li');
    epItem.innerText = `${ep.name} (season${ep.season},episode${ep.number})`;
    $epList.append(epItem);
  }

  $episodesArea.hide()? $episodesArea.show() : $episodesArea.hide();
 }





 
 
