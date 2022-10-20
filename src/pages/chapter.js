document.addEventListener('DOMContentLoaded', () => {
  const query = window.location.search;
  const mangaId = query.slice(query.indexOf('=') + 1, query.indexOf('&')).replace('%2F', '/');
  let chapterId = query.slice(query.indexOf('=', 9) + 1).replace('%2F', '/');
  const mangaLink = `https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/details?id=${mangaId}`;
  let chapterLink = `https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/chapter?id=${chapterId}`;
  const dropdowns = document.getElementsByClassName('chapter-list');
  const chapterImgs = document.getElementById('chapter-imgs');
  const prevBtns = document.getElementsByClassName('prev');
  const nextBtns = document.getElementsByClassName('next');
  const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
  const navIcons = document.getElementById('nav-icons');

  const userIsSignedIn = async() => {
    const data = await fetchIsSignedIn();
    if (data.status === 'success') {
      navSigninRegisterLink.classList.toggle('hidden');
      navIcons.classList.toggle('hidden');
    }
  }

  const getChapters = async () => {
    const data = await fetchMangaAPI(mangaLink);
    const title = document.getElementById('title');
    title.textContent = data.title;
    document.title = `MangaHub | ${data.title}`;
    generateChapterList(dropdowns, data.chapters, chapterId);
  }

  const getChapterImgs = async (link) => {
    const data = await fetchMangaAPI(link);
    emptyParent(chapterImgs);
    data.forEach((img, i) => generateChapterImgs(img, i, chapterImgs));
  }

  const onClickPrevNextBtns = (prevOrNext) => {
    const currChapter = parseInt(chapterId.slice(chapterId.lastIndexOf('chapter') + 8));
    const btnChapter = prevOrNext === 'prev' ? currChapter - 1 : currChapter + 1;
    chapterId = chapterId.slice(0, chapterId.lastIndexOf('chapter') + 8) + btnChapter.toString();
    chapterLink = `https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/chapter?id=${chapterId}`;
    getChapterImgs(chapterLink);
    changeUrlParams('chapterId', chapterId);
    selectCurrChapter(chapterId);
  }

  const selectCurrChapter = (chapterId) => Array.from(dropdowns).forEach(dropdown => dropdown.value = chapterId);

  userIsSignedIn();
  getChapters();
  getChapterImgs(chapterLink);
  Array.from(prevBtns).forEach(btn => btn.onclick = () => onClickPrevNextBtns('prev'));
  Array.from(nextBtns).forEach(btn => btn.onclick = () => onClickPrevNextBtns('next'));
  Array.from(dropdowns).forEach(dropdown => {
    dropdown.onchange = () => {
      const selected = dropdown.value;
      chapterId = selected;
      chapterLink = `https://manga-scraper-for-mangakakalot-website.p.rapidapi.com/chapter?id=${chapterId}`;
      getChapterImgs(chapterLink);
      changeUrlParams('chapterId', selected);
      selectCurrChapter(chapterId);
    };
  });
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

const generateChapterList = (dropdowns, mChapters, chapterId) => {
  Array.from(dropdowns).forEach(dropdown => {
    mChapters.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.append(item.title);
      dropdown.appendChild(opt);
    })
    dropdown.value = chapterId;
  })
}

const generateChapterImgs = (cImg, page, container) => {
  const img = createImgEl('w-100', cImg, `page ${page}`);
  container.appendChild(img);
}

// utils
const createEl = (el) => document.createElement(el);

const createImgEl = (className, src, alt) => {
  const img = createEl('img');
  img.className = className;
  img.src = src;
  img.alt = alt;
  return img;
}

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