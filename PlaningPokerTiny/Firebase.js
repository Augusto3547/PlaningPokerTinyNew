import { initializeApp } from 'firebase/app';
import {  getDatabase,  ref,  child,  get, push,  onValue,  update,  onChildChanged,  onChildAdded,} from 'firebase/database';
import { data } from 'jquery';
import $ from 'jquery';
import {routie} from './routie';

const firebaseConfig = {
  apiKey: 'AIzaSyBcXWuDslHfFbtENzKZaiNoYdEwXDyrEq8',
  authDomain: 'planingpokertiny-42303.firebaseapp.com',
  projectId: 'planingpokertiny-42303',
  storageBucket: 'planingpokertiny-42303.appspot.com',
  messagingSenderId: '140539119102',
  appId: '1:140539119102:web:3e40df81defb6295c0ecaf',
};

const app = initializeApp(firebaseConfig);

var game_id = '';
var gameName = '';
var namePlayer = '';
var Global_Game_ID = '';

export async function New_Game() {
  gameName = document.getElementById('namegame').value;
  namePlayer = document.getElementById('displayname').value;

  if (!game_id) {
    const response = await push(ref(getDatabase(app), 'Games'), {
      name: gameName,
      cards_turned: false,
    });

    game_id = response.key;
  }

  const playersRef = await push(
    ref(getDatabase(app), 'Games/' + game_id + '/players'),
    {
      name: namePlayer,
      card: '',
    }
  );

  // Colcoar o id do primeiro jogador na id da tag img no html fixo

  let first_id_player = playersRef.key
  let imgselect  = document.querySelector("img.imgbackcard")
  imgselect.id = first_id_player

  Global_Game_ID = game_id;

  setCookie(namePlayer, playersRef.key, 1);
  PutInformationInScreen();

  routie('id=' + Global_Game_ID);
}

export async function New_Player(NameNewPlayer, Idsala) {
  var NewPlayer = {
    name: NameNewPlayer,
    card: '',
  };

  console.log(Idsala);

  const refdb = await push(
    ref(getDatabase(app), 'Games/' + Idsala + '/players'),
    NewPlayer
  );

  setCookie(NameNewPlayer, refdb.key, 1);

  // Buscar no Banco o nome do Jogo
  const dbRef = ref(getDatabase());
  await get(child(dbRef, 'Games/' + Idsala))
    .then((snapshot) => {
      if (snapshot.exists()) {
        gameName = snapshot.val().name; // para colocar o noem do jogo na tela quanado um novo jogador entrar
      } else {
        console.log('No data available');
      }
    })
    .catch((error) => {
      console.error(error);
    });
  namePlayer = NameNewPlayer; // para colocar o nome do jogo na tela quanado um novo jogador entrar

  PutInformationInScreen();
}

// Esta função é responsável por ouvir TODOS os eventos do jogo e realizar as alterações necessárias
export async function listen_game() {
  // Buscar o ID do Jogo
  const dbRef = ref(getDatabase());
  await get(child(dbRef, 'Games/'))
    .then((snapshot) => {
      if (snapshot.exists()) {
        Global_Game_ID = Object.keys(snapshot.val())[0];
      } else {
        console.log('No data available');
      }
    })
    .catch((error) => {
      console.error(error);
    });

  //Buscar o ID do usuário que esta jogando
  let current_user_id = '';
  let cookies = document.cookie;
  let ca = cookies.split('=');
  current_user_id = ca[1];

  const dbchangeref = ref(
    getDatabase(),
    'Games/' + Global_Game_ID + '/players'
  );
  //Verificar quando um novo jogador entrar
  onChildAdded(dbchangeref, (snapshot) => {
    const playerId = snapshot.key;
    //Object.keys(snapshot.val()).map((playerId) => {
    if (current_user_id != playerId) {
      let teste = document.getElementById(playerId);
      if (!teste) {
        const nome = snapshot.val().name;
        if (nome) {
          let markup = `
            <div class="cardplayer">
            <div class="cardplayerplay">
                <button class="cardnew hidden" id="newcard"></button>
                <img id="${playerId}" class="imgbackcard hidden" src="img/backcard.png">
            </div>
            </div>
            <div class="nameplayeraftercard">
                <p class="nameaftercard">
                    ${nome}
                </p>
            </div>
          `;
          let pselector = document.getElementById('players');
          pselector.innerHTML += markup;
        }
      }
    }
    //});
  });

  //Verificar se os jogadores selecionaram as cartas e colocar a imagem de trás da carta
  const dbrefcardchange = ref(getDatabase(),'Games/' + Global_Game_ID + '/players')
  onChildChanged(dbrefcardchange, (data)=>{
    if (data.val().card != ''){
      let imageretire = document.getElementById(data.key);
      imageretire.classList.remove('hidden');
      console.log(data.key)
    } else {
      let imageretire = document.getElementById(data.key);
      imageretire.classList.add('hidden');
    }
  })

}

export async function Change_Name() {
  var nameChange = document.getElementById('ChangeNamePlayer').value;

  let playerChange = {
    name: nameChange,
    card: '',
  };

  let current_user_id = '';
  let cookies = document.cookie;
  var teste = cookies.split(';');
  teste.forEach((element) => {
    if (element.length > 0) {
      let ca = element.split('=');
      current_user_id = ca[1];
    }
  });

  deleteAllCookies();
  setCookie(nameChange, current_user_id, 1);

  // Buscar o ID do Jogo
  const dbRef = ref(getDatabase());
  await get(child(dbRef, 'Games/'))
    .then((snapshot) => {
      if (snapshot.exists()) {
        Global_Game_ID = Object.keys(snapshot.val())[0];
      } else {
        console.log('No data available');
      }
    })
    .catch((error) => {
      console.error(error);
    });

  const dbref = ref(
    getDatabase(app),
    'Games/' + Global_Game_ID + '/players' + '/' + current_user_id
  );

  if (nameChange.lenght == 0) {
    window.alert('For Change a name first, you neded to put a any name');
  } else {
    update(dbref, playerChange);
  }

  var pnameplayer = document.querySelector('p.nameaftercard');
  pnameplayer.textContent = nameChange;
  // Nome no botão para trocar o mesmo
  var bnameplayer = document.querySelector('button.profile');
  var tag = document.createElement('i');
  tag.classList.add('fas');
  tag.classList.add('fa-angle-down');
  bnameplayer.textContent = nameChange;
  bnameplayer.appendChild(tag);

  var closesection = document.querySelector('div.diag');
  closesection.classList.add('hidden');
}

export async function getDataUserAuth(Idsala) {
  let user_ID = '';
  let cookies = document.cookie;
  var teste = cookies.split(';');
  teste.forEach((element) => {
    if (element.length > 0) {
      let ca = element.split('=');
      user_ID = ca[1];
    }
  });

  let gameName = '';
  // Buscar no Banco o nome do Jogo
  const dbRef = ref(getDatabase());
  await get(child(dbRef, 'Games/' + Idsala)).then((snapshot) => {
    if (snapshot.exists()) {
      gameName = snapshot.val().name; // para colocar o noem do jogo na tela quanado um novo jogador entrar
    } else {
      console.log('No data available');
    }
  });

  let namePlayer = '';
  // Buscar no Banco o nome do player
  await get(child(dbRef, 'Games/' + Idsala + '/players/' + user_ID)).then(
    (snapshot) => {
      if (snapshot.exists()) {
        namePlayer = snapshot.val().name; // para colocar o noem do jogo na tela quanado um novo jogador entrar
      } else {
        console.log('No data available');
      }
    }
  );

  //Nome do lado da imagem
  var labelgame = document.querySelector('label.namegame');
  labelgame.textContent = gameName;
  //Nome em baixo da carta com a animação
  var pnameplayer = document.querySelector('p.nameaftercard');
  pnameplayer.textContent = namePlayer;
  // Nome no botão para trocar o mesmo
  var bnameplayer = document.querySelector('button.profile');
  var tag = document.createElement('i');
  tag.classList.add('fas');
  tag.classList.add('fa-angle-down');
  bnameplayer.textContent = namePlayer;
  bnameplayer.appendChild(tag);

  var titlename = document.querySelector('title');
  titlename.textContent = 'Planning Poker || ' + gameName;
}

async function PutInformationInScreen() {
  //Nome do lado da imagem
  var labelgame = document.querySelector('label.namegame');
  labelgame.textContent = gameName;
  //Nome em baixo da carta com a animação
  var pnameplayer = document.querySelector('p.nameaftercard');
  pnameplayer.textContent = namePlayer;
  // Nome no botão para trocar o mesmo
  var bnameplayer = document.querySelector('button.profile');
  var tag = document.createElement('i');
  tag.classList.add('fas');
  tag.classList.add('fa-angle-down');
  bnameplayer.textContent = namePlayer;
  bnameplayer.appendChild(tag);

  var titlename = document.querySelector('title');
  titlename.textContent = 'Planning Poker || ' + gameName;

  listen_game();
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function deleteAllCookies() {
  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf('=');
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}