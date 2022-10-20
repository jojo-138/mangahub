document.addEventListener('DOMContentLoaded', () => {
  const width = window.innerWidth;
  const popular = 'https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/popular';
  const latest = 'https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/browse?type=latest&state=all&category=all&page=1';
  const cardContainer = document.getElementById('card-container');
  const mangaContainer = document.getElementById('manga-container');
  const mangaCards = document.getElementsByClassName('manga-card');
  const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
  const navIcons = document.getElementById('nav-icons');
  
  const userIsSignedIn = async() => {
    const data = await fetchIsSignedIn();
    if (data.status === 'success') {
      navSigninRegisterLink.classList.toggle('hidden');
      navIcons.classList.toggle('hidden');
    }
  }

  const getPopular = async (popularLink, container, width, cards) => {
    let data = await fetchMangaAPI(popularLink);
    data = data.slice(0, 18);
    data.forEach(item => generateMangaCard(container, mangaUrl(item.id), item.thumbnail_url, item.title));
    if (width > 1176) { // 18 cards
      return;
    } else if (width > 1048 && width <= 1176) { // 16 cards
      addOrRmvHiddenLoop(16, cards.length, 'add', cards);
    } else if (width > 920 && width <= 1048) { // 14 cards
      addOrRmvHiddenLoop(14, cards.length, 'add', cards);
    } else if (width > 789 && width <= 920) { // 12 cards
      addOrRmvHiddenLoop(12, cards.length, 'add', cards);
    } else if (width > 660 && width <= 789) { // 10 cards
      addOrRmvHiddenLoop(10, cards.length, 'add', cards);
    } else if (width > 451 && width <= 660) { // 8 cards
      addOrRmvHiddenLoop(8, cards.length, 'add', cards);
    } else { // 6 cards
      addOrRmvHiddenLoop(6, cards.length, 'add', cards);
    }
  }

  const getLatest = async (latestLink, container) => {
    const data = await fetchMangaAPI(latestLink);
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
  
  userIsSignedIn();
  getPopular(popular, cardContainer, width, mangaCards);
  getLatest(latest, mangaContainer);
  window.onresize = (e) => changeCardNumFromWidth(e.target.innerWidth, mangaCards);
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

const fetchMangaAPI = async (link) => {
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '53070c96a9msh916468f548d07ccp1710ddjsn59db916479d6',
      'X-RapidAPI-Host': 'manga-scraper-for-mangakakalot-website.p.rapidapi.com'
    }
  };
  const res = await fetch(link, options);
  const data = await res.json();
  return data.data;
}

const generateMangaCard = (container, mLink, mImg, mTitle) => {
  const div = createDivEl('manga-card w-100');
  const a = createAEl(null, mLink);
  const img = createImgEl('card-img w-100 h-100', mImg, mTitle);
  const p = createPElWithText('card-title w-100', mTitle);

  a.append(img, p);
  div.appendChild(a);
  container.appendChild(div);
}

const generateMangaItem = (container, mLink, mImg, mTitle, mLatestLink, mLatestName, mDesc) => {
  if (mTitle.length > 83) mTitle = mTitle.slice(0, 83) + '...';
  if (mDesc.length > 150) mDesc = mDesc.slice(0, 150) + '...';

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

// change amount of items based on screen width
const changeCardNumFromWidth = (width, cards) => {
  if (width > 1176) { // 18 cards
    cards[16].classList.contains('hidden') && addOrRmvHiddenLoop(16, cards.length, 'remove', cards);
  } else if (width > 1048 && width <= 1176) { // 16 cards
    ifHiddenElse(14, 16, cards.length, cards);
  } else if (width > 920 && width <= 1048) { // 14 cards
    ifHiddenElse(12, 14, 16, cards);
  } else if (width > 789 && width <= 920) { // 12 cards
    ifHiddenElse(10, 12, 14, cards);
  } else if (width > 660 && width <= 789) { // 10 cards
    ifHiddenElse(8, 10, 12, cards);
  } else if (width > 451 && width <= 660) { // 8 cards
    ifHiddenElse(6, 8, 10, cards);
  } else { // 6 cards
    addOrRmvHiddenLoop(6, 8, 'add', cards);
  }
}

const addOrRmvHiddenLoop = (start, end, addOrRmv, arr) => {
  for (let i = start; i < end; i++) {
    addOrRmv === 'add' && arr[i].classList.add('hidden');
    addOrRmv === 'remove' && arr[i].classList.remove('hidden');
  }
}

const ifHiddenElse = (num1, num2, num3, arr) => {
  arr[num1].classList.contains('hidden') ? addOrRmvHiddenLoop(num1, num2, 'remove', arr) : addOrRmvHiddenLoop(num2, num3, 'add', arr);
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