document.addEventListener('DOMContentLoaded', () => {
  const mangaErrorMsg = document.getElementById('manga-error');
  const mangaPg = document.getElementById('manga-pg');
  const chapterTbl = document.getElementById('chapter-table');
  const follow = document.getElementById('follow');
  const following = document.getElementById('following');
  const query = window.location.search;
  const mangaId = query.slice(query.indexOf('=') + 1).replace('%2F', '/');
  const errorMsg = document.getElementById('error-msg');
  const navSigninRegisterLink = document.getElementById('nav-signin-register-link');
  const navIcons = document.getElementById('nav-icons');
  let mangaError;

  const userIsSignedIn = async() => {
    const data = await fetchIsSignedIn();
    if (data.status === 'success') {
      navSigninRegisterLink.classList.toggle('hidden');
      navIcons.classList.toggle('hidden');
    }
  }

  const getManga = async () => {
    const data = await fetchMangaAPI(mangaId);
    if (data === null) {
      mangaError = true;
      mangaErrorMsg.classList.remove('hidden');
      mangaPg.classList.add('hidden');
      return;
    }
    generateMangaDetails(data.title, data.alternative_titles, data.thumbnail_url, data.authors, data.genres, data.status, data.views_count, data.description);
    data.chapters.forEach(item => generateChapterList(chapterTbl, chapterUrl(mangaId, item.id), item.title, item.views_count, item.uploaded_at));
    document.title = `MangaHub | ${data.title}`;
  }

  const getIsFollowing = async () => {
    const data = await fetchIsFollowing(mangaId);
    data.following && isFollowing(); // or status code is 200
  }

  //onClick of follow and and following
  const followManga = async () => {
    const data = await fetchFollowManga(mangaId);
    if (data.status === 'success') return isFollowing();
    if (data.msg === 'Unauthorized') return window.location.href = "https://jojo-138.github.io/mangahub/pages/signin.html";
    errorMsg.textContent = data.msg;
    toggleMsg(errorMsg, 5000);
  }

  const unfollowManga = async () => {
    const data = await fetchUnfollowManga(mangaId);
    if (data.status === 'success') return isFollowing();
    if (data.msg === 'Unauthorized') return window.location.href = "https://jojo-138.github.io/mangahub/pages/signin.html";
    errorMsg.textContent = data.msg;
    toggleMsg(errorMsg, 5000);
  }

  const isFollowing = () => {
    follow.classList.toggle('hidden');
    following.classList.toggle('hidden');
  }

  userIsSignedIn();
  getManga();
  if (!mangaError) {
    getIsFollowing();
    follow.onclick = () => followManga();
    following.onclick = () => unfollowManga();
  }
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

const fetchIsFollowing = async (mangaId) => {
  const options = {
    method: 'GET',
    credentials: 'include',
  };
  const res = await fetch(`https://mangahub-server.herokuapp.com/following?mangaId=${mangaId}`, options);
  const data = await res.json();
  return data;
}

const fetchFollowManga = async (mangaId) => {
  const options = {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mangaId })
  };
  const res = await fetch('https://mangahub-server.herokuapp.com/follow', options);
  const data = await res.json();
  return data;
}

const fetchUnfollowManga = async (mangaId) => {
  const options = {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mangaId })
  };
  const res = await fetch('https://mangahub-server.herokuapp.com/unfollow', options);
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

const generateMangaDetails = (mTitle, mAltTitles, mImg, mAuthor, mGenres, mStatus, mViews, mSummary) => {
  const title = document.getElementById('manga-title');
  const altTitles = document.getElementById('alt-titles');
  const img = document.getElementById('manga-img');
  const author = document.getElementById('author');
  const genres = document.getElementById('genres');
  const status = document.getElementById('status');
  const views = document.getElementById('views');
  const summary = document.getElementById('summary');

  title.textContent = mTitle;
  altTitles.textContent = mAltTitles.join(', ');
  img.src = mImg;
  author.textContent = mAuthor.join(', ');
  genres.textContent = mGenres.join(', ');
  status.textContent = mStatus;
  views.textContent = mViews;
  summary.textContent = mSummary;
}

const generateChapterList = (container, cLink, cTitle, cViews, cUpdated) => {
  const a = createAEl('d-flex chapter', cLink);
  const divTitle = createDivEl('chapter-title');
  const divUpdated = createDivEl('updated grey-text');

  divTitle.append(cTitle);
  divUpdated.append(`${cViews} | ${cUpdated}`);
  a.append(divTitle, divUpdated);
  container.appendChild(a);
}

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

const toggleMsg = (msg, time) => {
  msg.classList.toggle('hidden');
  setTimeout(() => msg.classList.toggle('hidden'), time);
}