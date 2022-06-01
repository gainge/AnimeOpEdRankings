const OPENINGS_JSON_FILE = './rankings/openings.json';
const ENDINGS_JSON_FILE = './rankings/endings.json';
const OP_HM_JSON_FILE = './rankings/ophm.json';
const ED_HM_JSON_FILE = './rankings/edhm.json';
const LINK_ICON = './res/foreign.png';
const DEFAULT_RANK_COLOR = '#efefef';
const YT_PATTERN = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.be)\/.+$/;

const RANKINGS_SUFFIX = '-ranking';
const AWARDS_SUFFIX = '-awards';

// fetch(OPENINGS_JSON_FILE)
//   .then(response => response.json())
//   .then(json => buildRankings(json, 'opening'));
// fetch(ENDINGS_JSON_FILE)
//   .then(response => response.json())
//   .then(json => buildRankings(json, 'ending'));
// TODO: build the endings thing too hehe :)

const loadRankings = (file, conatinerPrefix) => {
  fetch(file)
    .then(response => response.json())
    .then(json => buildRankings(json, conatinerPrefix));
}

loadRankings(OPENINGS_JSON_FILE, 'opening');
loadRankings(ENDINGS_JSON_FILE, 'ending');
loadRankings(OP_HM_JSON_FILE, 'opening-hms');
loadRankings(ED_HM_JSON_FILE, 'ending-hms');

function playVideo(url) {
  // check for youtube video
  if (YT_PATTERN.test(url)) {
    window.open(url, '_blank');
  } else {
    // Set the player source and show
    let modal = document.getElementById('modal');
    let video = document.getElementById('theme-video');
    let source = document.getElementById('video-source');

    source.setAttribute('src', url);
    video.load();

    modal.style.display = 'inherit';
    video.style.display = 'inherit';
  }

  

  // TODO: might have to do something with the playback position here? start from 0?
}

function onModalClick() {
  console.log('closing video');

  let modal = document.getElementById('modal');
  let video = document.getElementById('theme-video');

  video.pause();

  modal.style.display = 'none';
  video.style.display = 'none';
}


function buildRankings(json, parentPrefix, showTiers = false) {
  console.log(json);
  // Let's just spit it out real quick
  const rankingParent = document.getElementById(parentPrefix + RANKINGS_SUFFIX);

  if (!rankingParent) return;

  // Write out the tiers
  const tiers = json.tiers;
  const themes = json.themes;
  const ranking = json.ranking;
  const awards = json.awards;


  let colors = [];
  let colorIndices = [];
  
  tiers && tiers.forEach(tierData => {
    if (showTiers) {
      let tier = document.createElement('p');

      tier.classList.add('tier');
  
      tier.innerHTML = tierData.label;
      tier.style.backgroundColor = tierData.color;
      tier.style.gridColumnStart = 1;
      tier.style.gridColumnEnd = 2;
      tier.style.gridRowStart = tierData.low;
      tier.style.gridRowEnd = tierData.high;
  
      rankingParent.appendChild(tier);
    }

    // Store the colors to use for rank numbers
    colors.push(tierData.color);
    colorIndices.push(tierData.high);
  });



  // Write out the awards!
  const awardsParent = document.getElementById(parentPrefix + AWARDS_SUFFIX);

  awards && awards.forEach(award => {
    let container = document.createElement('div');
    container.classList.add('award-item');

    // Spin out the label
    let label = document.createElement('p');
    label.innerHTML = award.award;
    label.classList.add('award-title')
    
    let op = document.createElement('a');
    op.classList.add('award-op')
    let theme = themes[award.index]
    op.innerHTML = theme.name;
    op.onclick = () => playVideo(theme.link);
    // op.setAttribute('href', );

    container.appendChild(label);
    container.appendChild(op);

    awardsParent.appendChild(container);
  });




  colorIndices.push(1000000);

  console.log(colorIndices);

  colors.reverse()
  colorIndices.reverse();

  // Now we have to actually spit out the shows eh?

  let currentTierColor = colors.pop() || DEFAULT_RANK_COLOR;
  let nextColorIndex = colorIndices.pop() || 10000000;

  ranking.forEach((ID, rank) => {
    // Check for color update
    if (rank + 1 >= nextColorIndex) {
      currentTierColor = colors.pop() || DEFAULT_RANK_COLOR;
      nextColorIndex = colorIndices.pop() || 10000000;
    }

    let theme = themes[ID];
    if (!theme) return;
    console.log(theme);

    let themeItem = document.createElement('div');
    themeItem.classList.add('ranking-item');
    // TODO: maybe need to set item style?

    // Add the rank
    let rankSpan = document.createElement('p');
    rankSpan.innerHTML = `${rank + 1}`;
    rankSpan.classList.add('rank-index');
    rankSpan.style.backgroundColor = currentTierColor;
    
    themeItem.appendChild(rankSpan);

    // Add the OP detail
    let themeDetail = document.createElement('p');
    themeDetail.innerHTML = theme.name;
    themeDetail.onclick = () => playVideo(theme.link);
    themeDetail.classList.add('op-title');

    themeItem.appendChild(themeDetail);


    // Add the show link icon
    let showLink = document.createElement('a');
    showLink.setAttribute('href', theme.showURL || 'https://www.youtube.com/channel/UCO_aKKYxn4tvrqPjcTzZ6EQ');
    showLink.setAttribute('target', '_blank')

    let linkIcon = document.createElement('img');
    linkIcon.setAttribute('src', LINK_ICON);
    linkIcon.classList.add('link-icon');

    showLink.appendChild(linkIcon);

    themeItem.appendChild(showLink);

    // Finally add the parent
    rankingParent.appendChild(themeItem);
  });
}




