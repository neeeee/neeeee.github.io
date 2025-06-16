const hololiveMembers = ['tokino_sora', 'roboco', 'aki_rosenthal',
                         'akai_haato', 'shirakami_fubuki', 'natsuiro_matsuri',
                         'murasaki_shion', 'nakiri_ayame', 'yuzuki_choco',
                         'oozora_subaru', 'azki', 'ookami_mio',
                         'sakura_miko', 'nekomata_okayu', 'inugami_korone',
                         'hoshimachi_suisei', 'usada_pekora', 'shiranui_flare',
                         'shirogane_noel', 'houshou_marine',
                         'amane_kanata', 'tsunomaki_watame', 'tokoyami_towa',
                         'himemori_luna', 'yukihana_lamy', 'momosuzu_nene',
                         'shishiro_botan', 'omaru_polka', 'laplus_darkness',
                         'takane_lui', 'hakui_koyori', 'sakamata_chloe',
                         'kazama_iroha', 'ayunda_risu', 'hoshinova_moona',
                         'airani_iofifteen', 'kureiji_ollie', 'anya_melfissa',
                         'pavolia_reine', 'vestia_zeta', 'kaela_kovalskia',
                         'kobo_kanaeru', 'mori_calliope', 'takanashi_kiara',
                         'ninomae_inanis', 'gawr_gura', 'amelia_watson',
                         'irys', 'ceres_fauna', 'ouro_kronii',
                         'nanashi_mumei', 'hakos_baelz', 'shiori_novella',
                         'koseki_bijou', 'nerissa_ravencroft', 'fuwawa_abyssgard',
                         'mococo_abyssgard', 'elizabeth_rose_bloodflame',
                         'gigi_murin', 'cecilia_immergreen', 'raora_panthera',
                         'hidoshi_ao', 'otonose_kanade', 'ichijou_ririka',
                         'juufuutei_raden', 'todoroki_hajime', 'minato_aqua',
                         'kiryu_coco', 'tsukumo_sana', 'harusaki_nodoka', 'a-chan', 
                         'isaki_riona', 'koganei_niko', 'mizumiya_su', 'rindo_chihaya', 'kikirara_vivi']

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1) + Math.ceil(min))
}

function initBoxes() {
  const ig = document.getElementById("item-grid");
  const tmp = [];
  for (let i = 0; i < ig.childNodes.length; i++) {
    if(ig.childNodes[i]?.data) {
      continue
    } else {
      tmp.push(ig.childNodes[i].children[0]);
    }
  }
  return tmp;
}

function getRandomImage() {
    randNum = Math.floor(Math.random() * hololiveMembers.length);
    imgChoice = hololiveMembers[randNum] + '.avif';
    return imgChoice;
}

function createMemberList() {
  const memberSet = new Set();
  for (let i = 0; i < 7; i++) {
    let img = getRandomImage();
    if (memberSet.has(img)) {
      i--;
    }
    memberSet.add(img);
  }
  return memberSet;
}

function drawImageInBox() {
  const boxes = initBoxes();
  const memberEntries = createMemberList().entries();
  let memberImages = [];
  for (let entry of memberEntries) {
    memberImages.push(entry[0]);
  }
  for (let i = 0; i < 7; i++) {
    let img = document.createElement("img");
    img.src = `./img/${memberImages[i]}`;
    boxes[i].appendChild(img);
  }
}

function genNumOfChildren() {
  const numOfChildren = document.getElementById("num-of-children");

  const spanEl = document.createElement("span");
  spanEl.id = "numOfChildren";
  spanEl.innerText = getRandomInt(0, 5);
  numOfChildren.childNodes[1].appendChild(spanEl);
}

function main() {
  let images = document.getElementsByTagName("img");
  if (images.length != 0) {
    let l = images.length;
    for (let i = 0; i < l; i++) {
      images[0].parentNode.removeChild(images[0]);
    }
  }
 
  if (document.getElementById("numOfChildren")) {
      document.getElementById("numOfChildren").remove();
  }

  drawImageInBox();
  genNumOfChildren();
}
