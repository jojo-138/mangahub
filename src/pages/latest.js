document.addEventListener('DOMContentLoaded', () => {
  const mangaContainer = document.getElementById('manga-container');
  const filterForm = document.getElementById('filter-form');
  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
  const navIcons = document.getElementById('nav-icons');

  const userIsSignedIn = async() => {
    const data = await fetchIsSignedIn();
    if (data.status === 'success') {
      navSigninRegisterLink.classList.toggle('hidden');
      navIcons.classList.toggle('hidden');
    }
  }
  
  const ifParamsPresentElse = () => {
    if (window.location.search) { // with filter/s selected
      getValuesFromStorage(mangaContainer);
    } else { // initialization, with no filters selected
      getLatest(mangaContainer);
    }
  }

  const onClickGenreCheckbox = () => {
    for (let i = 1; i < checkboxes.length; i++) {
      checkboxes[i].onclick = () => {
        checkboxes[0].checked = false;
      }
    }
  }

  const onClickAllCheckbox = () => {
    checkboxes[0].onclick = () => {
      for (let i = 1; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
      }
    }
  }

  userIsSignedIn();
  ifParamsPresentElse();
  onClickAllCheckbox(); // when 'All' is clicked, uncheck everything else
  onClickGenreCheckbox(); // when other genres are clicked, uncheck 'All'

  filterForm.onsubmit = (e) => {
    e.preventDefault();
    const checkedGenres = document.querySelectorAll('input[type="checkbox"]:checked');
    const completion = document.querySelector('input[type="radio"]:checked').value;
    const genres = checkedGenres.length ? Array.from(checkedGenres).map(item => item.value).join(',') : 'all';
    if (genres === 'all') checkboxes[0].checked = true; // check 'All' if no genre is selected
    getLatest(mangaContainer, completion, genres);
    changeUrlParams('genres', genres);
    changeUrlParams('completion', completion);
    saveParamsToStorage(genres, completion);
  };
})

// helpers
const fetchIsSignedIn = async() => {
  const options = {
    method: 'GET',
    credentials: 'include',
  };
  const res = await fetch('https://mangahub-server.herokuapp.com/is-signed-in', options);
  const data = await res.json();
  return data;
}

const fetchMangaAPI = async (state = 'all', category = 'all') => {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
      'X-RapidAPI-Host': 'manga-scraper-for-mangakakalot-website.p.rapidapi.com'
    }
  };
  const res = await fetch(`https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/browse?type=latest&state=${state}&category=${category}&page=1`, options);
  const data = await res.json();
  return data.data;
}

const generateMangaItem = (container, mLink, mImg, mTitle, mLatestLink, mLatestName, mDesc) => {
  if (mTitle.length > 83) mTitle = mTitle.slice(0, 83) + '...';
  if (mDesc.length > 150) mDesc = mDesc.slice(0, 150) + '...';
  if (mLatestName.length > 44) mLatestName = mLatestName.slice(0, 44) + '...';

  const divContainer = createDivEl('d-flex manga-item');
  const aImg = createAEl(null, mLink);
  const img = createImgEl('manga-img h-100', mImg, mTitle);
  const divInfo = createDivEl('d-flex manga-info');
  const aTitle = createAEl('manga-title', mLink);
  const p = createPElWithText('manga-desc', mDesc);
  const aLatest = createAEl('manga-latest', mLatestLink);
  
  aLatest.append(mLatestName);
  aTitle.append(mTitle);
  divInfo.append(aTitle, p, aLatest);
  aImg.appendChild(img);
  divContainer.append(aImg, divInfo);
  container.appendChild(divContainer);
}

const getLatest = async (container, state, category) => {
  const data = await fetchMangaAPI(state, category);
  emptyParent(container);
  data.forEach(item => {
    let mangaId = item.id;
    let latestId = item.latest_chapter_url;
    let chapterId;
    if (mangaId.includes('/')) {
      chapterId = mangaId.slice(mangaId.indexOf('/') + 1);
      latestId = latestId.slice(latestId.indexOf(chapterId));
    } else {
      latestId = latestId.slice(latestId.indexOf(mangaId));
    }
    generateMangaItem(container, mangaUrl(mangaId), item.thumbnail_url, item.title, chapterUrl(mangaId, latestId), item.latest_chapter_title, item.description);
  })
}

const getValuesFromStorage = (container) => {
  const genre = sessionStorage.getItem('genre');
  const completion = sessionStorage.getItem('completion');
  getLatest(container, completion, genre);
  checkBoxValues(genre);
  checkRadioValues(completion);
}

// check checkboxes and radios based on session storage values
const checkBoxValues = (value) => {
  if (value === 'all') return;
  document.getElementById('all').checked = false;
  !value.includes(',') ? checkItem(value) : value.split(',').forEach(item => checkItem(item));
}

const checkRadioValues = (value) => value !== 'completion-all' && checkItem(value);

const saveParamsToStorage = (genres, completion) => {
  sessionStorage.setItem('genre', genres);
  sessionStorage.setItem('completion', completion);
}

const mangaUrl = (mangaId) => `/mangahub/pages/manga.html?id=${encodeURIComponent(mangaId)}`;

const chapterUrl = (mangaId, chapterId) => `/mangahub/pages/chapter.html?mangaId=${encodeURIComponent(mangaId)}&chapterId=${encodeURIComponent(chapterId)}`;

// utils
const createEl = (el) => document.createElement(el);

const createDivEl = (className) => {
  const div = createEl('div');
  div.className = className;
  return div;
}

const createAEl = (className, href) => {
  const a = createEl('a');
  a.className = className;
  a.href = href;
  return a;
}

const createImgEl = (className, src, alt) => {
  const img = createEl('img');
  img.className = className;
  img.src = src;
  img.alt = alt;
  return img;
}

const createPElWithText = (className, text) => {
  const p = createEl('p');
  p.className = className;
  p.append(text);
  return p;
}

const checkItem = (value) => document.querySelector(`input[value="${value}"]`).checked = true;

const changeUrlParams = (key, value) => {
  const queryParams = new URLSearchParams(window.location.search);
  queryParams.set(key, value);
  history.pushState(null, null, "?" + queryParams.toString());
}

const emptyParent = (parent) => {
  let firstChild = parent.firstElementChild;
  while (firstChild) {
    parent.removeChild(firstChild);
    firstChild = parent.firstElementChild;
  }
}