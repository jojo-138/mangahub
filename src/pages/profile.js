document.addEventListener('DOMContentLoaded', () => {
  const mangaContainer = document.getElementById('manga-container');
  const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
  const navIcons = document.getElementById('nav-icons');
  
  const userIsSignedIn = async() => {
    const data = await fetchIsSignedIn();
    if (data.status === 'success') {
      navSigninRegisterLink.classList.toggle('hidden');
      navIcons.classList.toggle('hidden');
    }
  }

  const getUser = async () => {
    const data = await fetchUser();
    if (data.status === 'error') return window.location.href = "https://jojo-138.github.io/mangahub/pages/signin.html";
    displayUserInfo(data.user);
  }

  const getFaves = async () => {
    const data = await fetchFaves();
    if (data.status === 'error') return;
    data.faves.forEach(async (item) => {
      const data = await fetchMangaAPI(item);
      generateMangaItem(mangaContainer, mangaUrl(item), data.thumbnail_url, data.title, data.description, data.genres, data.chapters);
    })
  }

  userIsSignedIn();
  getUser();
  getFaves();
})

// helpers
const serverOptions = {
  method: 'GET',
  credentials: 'include'
};

const fetchIsSignedIn = async() => {
  const res = await fetch('https://mangahub-server.herokuapp.com/is-signed-in', serverOptions);
  const data = await res.json();
  return data;
}

const fetchUser = async () => {
  const res = await fetch('https://mangahub-server.herokuapp.com/user', serverOptions);
  const data = await res.json();
  return data;
}

const fetchFaves = async () => {
  const res = await fetch('https://mangahub-server.herokuapp.com/faves', serverOptions);
  const data = await res.json();
  return data;
}

const fetchMangaAPI = async (id) => {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
      'X-RapidAPI-Host': 'manga-scraper-for-mangakakalot-website.p.rapidapi.com'
    }
  };
  const res = await fetch(`https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/details?id=${id}`, options);
  const data = await res.json();
  return data.data;
}

const generateMangaItem = (container, mLink, mImg, mTitle, mDesc, mGenres, mChaps) => {
  if (mTitle.length > 83) mTitle = mTitle.slice(0, 83) + '...';
  if (mDesc.length > 150) mDesc = mDesc.slice(0, 150) + '...';

  const divContainer = createDivEl('d-flex manga-item');
  const aImg = createAEl(null, mLink);
  const img = createImgEl('manga-img h-100', mImg, mTitle);
  const divInfo = createDivEl('d-flex manga-info');
  const aTitle = createAEl('manga-title', mLink);
  const pDesc = createPElWithText('manga-desc', mDesc);
  const pGenres = createPElWithText('manga-genres', mGenres.join(', '));
  const pChaps = createPElWithText('manga-chaps', `${mChaps.length} chapters`);

  aTitle.append(mTitle);
  divInfo.append(aTitle, pGenres, pDesc, pChaps);
  aImg.appendChild(img);
  divContainer.append(aImg, divInfo);
  container.appendChild(divContainer);
}

const displayUserInfo = (userObj) => {
  const fname = document.getElementById('fname');
  const favesAmount = document.getElementById('faves-amount');
  const joinedAt = document.getElementById('joined-at');
  fname.textContent = userObj.fname;
  favesAmount.textContent = userObj.favesAmount;
  joinedAt.textContent = userObj.joinedAt;
}

const mangaUrl = (mangaId) => `/mangahub/pages/manga.html?id=${encodeURIComponent(mangaId)}`;

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