import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  child,
  get,
  push,
  onValue,
  update,
  onChildChanged,
  onChildAdded,
  set,
  remove,
  onChildRemoved,
} from 'firebase/database';
import { data, isEmptyObject } from 'jquery';
import $ from 'jquery';
import { routie } from './routie';

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
  //Limpar todos os jogos anteriores quando o proximo é criado
  var dbrefcleargames = ref(getDatabase(app), 'Games');
  set(dbrefcleargames, null);

  //Limpar os cookies do primeiro usuário
  deleteAllCookies();

  gameName = document.getElementById('namegame').value;
  namePlayer = document.getElementById('displayname').value;

    if (!game_id) {
      const response = await push(ref(getDatabase(app), 'Games'), {
        name: gameName,
      });

      game_id = response.key;
    }

    const db = getDatabase();
    set(ref(db, 'Games/' + game_id + '/players' + '/cards_turned'), {
      turned: false,
    });

    Global_Game_ID = game_id;

    New_Player(namePlayer, game_id, 0);
    PutInformationInScreen();
    routie('id=' + Global_Game_ID);
}

export async function New_Player(NameNewPlayer, Idsala, flag = null) {
  if (NameNewPlayer.length > 10) {
	NameNewPlayer = NameNewPlayer.substring(0, 10) + '...';
  }
  var NewPlayer = {
    name: NameNewPlayer,
    card: '',
  };

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

  if (flag != 0) {
    PutInformationInScreen();
  }
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
  let idx = 0;

  const dbchangeref = ref(
    getDatabase(),
    'Games/' + Global_Game_ID + '/players/'
  );
  //Verificar quando um novo jogador entrar
  onChildAdded(dbchangeref, (snapshot) => {
    const playerId = snapshot.key;
    let playerIdSelector = document.getElementById(playerId);
    if (!playerIdSelector) {
      const nome = snapshot.val().name;
      if (nome) {
        let markup = `
            <div class="cardplayer">
            <div id="${playerId}" class="cardplayerplay other_background_card"> 
                <button class="cardnew hidden" id="newcard"></button>
            </div>
              <div class="nameplayeraftercard">
                <p class="nameaftercard ${playerId}">
                    ${nome}
                </p>
            </div>
            </div>
          `;

        let pdown = document.getElementById('down-players');
        let pup = document.getElementById('up-players');
        let pright = document.getElementById('right-players');
        let pleft = document.getElementById('left-players');

        switch (idx) {
          case 0:
            pdown.innerHTML = markup;
            break;
          case 1:
            let changemargin = document.querySelector('div.midle');
            let width = window.screen.width;
            if (width <= 550) {
              changemargin.style.cssText =
                'margin-top: 25%; align-items: center;';
            } else if (width > 550 && width <= 1278) {
              changemargin.style.cssText =
                'margin-top: 20%; align-items: center;';
            } else {
              changemargin.style.cssText =
                'margin-top: 6%; align-items: center;';
            }
            pup.innerHTML = markup;
            break;
          case 2:
            pdown.innerHTML += markup;
            break;
          case 3:
            pup.innerHTML += markup;
            break;
          case 4:
            pdown.innerHTML += markup;
            break;
          case 5:
            pup.innerHTML += markup;
            break;
          case 6:
            pdown.innerHTML += markup;
            break;
          case 7:
            pup.innerHTML += markup;
            break;
          case 8:
            pleft.innerHTML += markup;
            break;
          case 9:
            pright.innerHTML += markup;
            break;
          case 10:
            pdown.innerHTML += markup;
            break;
          case 11:
            pup.innerHTML += markup;
            break;
          case 12:
            pdown.innerHTML += markup;
            break;
          case 13:
            pup.innerHTML += markup;
            break;
        }
        idx++;
      }
    }
  });

  //Verificar se os jogadores selecionaram as cartas e colocar a imagem de trás da carta
  const dbrefcardchange = ref(
    getDatabase(),
    'Games/' + Global_Game_ID + '/players'
  );
  onChildChanged(dbrefcardchange, (data) => {
    if (data.val().card != '') {
      let imageretire = document.getElementById(data.key);
      if (imageretire) {
        imageretire.classList.remove('other_background_card');
        imageretire.classList.add('background_card');
      }
    } else {
      let imageretire = document.getElementById(data.key);
      if (imageretire) {
        imageretire.classList.remove('background_card');
        imageretire.classList.add('other_background_card');
      }
    }
  });

  //Setar  timer e revelar as cartas
  const dbreftimer = ref(
    getDatabase(),
    'Games/' + Global_Game_ID + '/players' + '/cards_turned'
  );
  onChildChanged(dbreftimer, (change) => {
    if (change.val() == true) {
      //Timer
      var duracao = 2;

	  var HideCards = document.getElementById('hideCards');
	  HideCards.classList.remove('hidden');

      var revealcards = document.getElementById('RevelCards');
      revealcards.classList.add('hidden');

      var temp = document.querySelector('p#temp');
      temp.classList.add('hidden');

      var funcao = setInterval(function () {
        var timer = document.querySelector('p#timer');
        timer.textContent = duracao;

        if (duracao == 0) {
          clearInterval(funcao);

          //Resumo votação

          let hide_cheap = document.getElementById('footer');
          hide_cheap.classList.add('hidden');

          let gbrefturncards = ref(
            getDatabase(),
            'Games/' + Global_Game_ID + '/players/'
          );
          get(gbrefturncards)
            .then((snapshot) => {
              Object.keys(snapshot.val()).map((user) => {
                let cardplayerplay = document.getElementById(user);
                if (cardplayerplay) {
                  let cardnew = cardplayerplay.children;
				  if (cardnew[0].textContent.length != 0) {
					cardnew[0].classList.remove('hidden');
				  }else{
					cardnew[0].classList.add('hidden');
				  }
                }
              });
            })
            .catch((error) => {
              console.error(error);
            });

          // calcular a média
          var soma = 0;
          var count = 0;
          var vetor = [];
          get(gbrefturncards)
            .then((data) => {
              data.forEach((dataItem) => {
                if (dataItem.val().name) {
                  if (dataItem.val().card == '?') {
                    soma += 0;
                    vetor.push(dataItem.val().card);
                  } else if (dataItem.val().card == '1/2') {
                    soma += 0.5;
                    vetor.push(dataItem.val().card);
					count++;
                  } else if (dataItem.val().card == '') {
                    soma = soma;
                    vetor.push(dataItem.val().card);
                  } else if (dataItem.val().card == '0') {
                    soma += 0;
                    vetor.push(0);
					count++;
                  } else{
					soma += Number(dataItem.val().card);
					count++;
					vetor.push(Number(dataItem.val().card));
				  } 
                }
              });

              if (soma == 0 && count == 0) {
                soma = 0;
              } else {
                soma = soma / count;
              }

              let presultofvoting = document.getElementById('result');
              presultofvoting.textContent = soma.toFixed(1);

              // Adiconar as cartas selecionadas com as respectivas qunatidades de votos

              var vetorformatado;
              vetorformatado = vetor.filter(function (el, i) {
                return vetor.indexOf(el) === i;
              });

                vetorformatado.forEach((n) => {
                  var count_num = 0;
                  vetor.forEach((num) => {
                    if (num === n) {
                      count_num++;
                    }
                  });

				if (n != "" || n === 0){
						let htmlfix = `
					<div class="alignvotecards">
						<button class="cardresults">${n}</button>
						<div>
							<p class="voteaftercard">Votes: ${count_num}</p>
						</div>
					</div>
					`;
						let select = document.getElementById('cheapresult');
						select.innerHTML += htmlfix;
					}
                });
            })
            .catch((error) => {
              console.error(error);
            });

          var timer = document.querySelector('p#timer');
          timer.classList.add('hidden');

          var buttonnewvoting = document.querySelector('button.StartNewVoting');
          buttonnewvoting.classList.remove('hidden');

          var result = document.querySelector('div.resultofvoting');
          result.classList.remove('hidden');

          timer.textContent = '';
        }

        duracao--;
      }, 700);

      // Valor Carta (Buscar no banco, pois senão lança uma exeption)

      let gbrefgetcardvalue = ref(
        getDatabase(),
        'Games/' + Global_Game_ID + '/players/'
      );
      get(gbrefgetcardvalue)
        .then((snapshot) => {
          Object.keys(snapshot.val()).map((id) => {
            const card = document.getElementById(id);
            if (card) {
              const selectCardNew = card.children;
              selectCardNew[0].textContent = snapshot.val()[id].card;
            }
          });
        })
        .catch((error) => {
          console.error(error);
        });

    } else if (change.val() == false) {
      let gbrefstartnewround = ref(
        getDatabase(),
        'Games/' + Global_Game_ID + '/players/'
      );
      get(gbrefstartnewround)
        .then((snapshot) => {
          Object.keys(snapshot.val()).map((user) => {
            let cardplayerplay = document.getElementById(user);
            if (cardplayerplay) {
              let cardnew = cardplayerplay.children;
              cardnew[0].classList.add('hidden');

              var buttonnewvoting = document.querySelector(
                'button.StartNewVoting'
              );
              buttonnewvoting.classList.add('hidden');

              cardplayerplay.classList.add('other_background_card');
            }
          });
        })
        .catch((error) => {
          console.error(error);
        });

      //Quando o cara clica em começar uma nova votação
	  var HideCards = document.getElementById('hideCards');
	  HideCards.classList.add('hidden');

      var timer = document.querySelector('p#timer');
      timer.classList.remove('hidden');

      let hide_cheap = document.getElementById('footer');
      hide_cheap.classList.remove('hidden');

      let backcard = document.querySelector('div.cardplayerplay');
      if (backcard) {
        backcard.classList.add('other_background_card');
      }

      var result = document.querySelector('div.resultofvoting');
      result.classList.add('hidden');

      var cardativo = document.querySelector('button.card.ativo');
      if (cardativo) {
        cardativo.classList.remove('ativo');
      }

      var temp = document.querySelector('p#temp');
      temp.classList.remove('hidden');

      let resultCheap = document.getElementById('cheapresult');
      resultCheap.innerHTML = '';

    }
  });
  
  //Verificar o nome do jogador alterado e mudar para os outros

  let dbchangename = ref(
    getDatabase(),
    'Games/' + Global_Game_ID + '/players/'
  );
  onChildChanged(dbchangename, (data) => {
    if (data.val().name) {
      get(dbchangename)
        .then((snapshot) => {
          let nameaftercard = document.querySelector(`p.${data.key}`);
          if (nameaftercard) {
            nameaftercard.textContent = data.val().name;
          }
        })
        .catch((error) => {
          console.error(error);
        });
    }
  });

  //Verificar se  um jogo foi excluido
  const dbrefgmaeclear = ref(getDatabase(), 'Games/');
  onChildRemoved(dbrefgmaeclear, (snapshot) => {
    let url = window.location.href;
    let res = url.split('#');
    var idnotf = res[1].substr(3);
    let Game_ID = idnotf;

    window.alert(
      'You are in a session that no longer exists in the DataBase. Please enter in another ;)'
    );
    window.location.href = 'https://planingpokertiny-42303.web.app/';
  });
}

export async function Change_Name() {
  let flag = 0;
  var nameChange = document.getElementById('ChangeNamePlayerInput').value;

  const verifyName = nameChange.split(' ').map((i) => {
    if (i.length != 0) {
      flag = 1;
    }
  });

  if (flag == 0) {
    window.alert('Please enter a name to change.');
  } else {

	if (nameChange.length > 10) {
		nameChange = nameChange.substring(0, 10) + '...';
	}

    let playerChange = {
      name: nameChange,
    };

    let current_user_id = '';
    let cookies = document.cookie;
    var vetCookies = cookies.split(';');
    vetCookies.forEach((element) => {
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
    update(dbref, playerChange);

    var pnameplayer = document.querySelector(current_user_id);
    if (pnameplayer) {
		let nomeformater = nameChange.substring(0,20);
      pnameplayer.textContent = nameChange;
    }
    // Nome no botão para trocar o mesmo
    var bnameplayer = document.querySelector('button.profile');
    var tag = document.createElement('i');
    tag.classList.add('fas');
    tag.classList.add('fa-angle-down');
	if(nameChange.length > 10) {
		nameChange = nameChange.substring(0, 10);
		nameChange = nameChange + '...';
	  }
    bnameplayer.textContent = nameChange;
    bnameplayer.appendChild(tag);

    var closesection = document.querySelector('div.diag');
    closesection.classList.add('hidden');
  }
}

export async function getDataUserAuth(Idsala) {
  let namePlayer = '';
  let user_ID = '';
  let cookies = document.cookie;
  var vetCookies = cookies.split(';');
  vetCookies.forEach((element) => {
    if (element.length > 0) {
      let ca = element.split('=');
      user_ID = ca[1];
	  namePlayer = ca[0];
    }
  });

  let gameName = '';
  // Buscar no Banco o nome do Jogo
  const dbRef = ref(getDatabase());
  await get(child(dbRef, 'Games/' + Idsala)).then((snapshot) => {
    if (snapshot.exists()) {
      gameName = snapshot.val().name; // para colocar o nome do jogo na tela quanado um novo jogador entrar
    } else {
      console.log('No data available');
    }
  });
  

  //Nome do lado da imagem
  var labelgame = document.querySelector('label.namegame');
  labelgame.textContent = gameName;

  // Nome no botão para trocar o mesmo
  var bnameplayer = document.querySelector('button.profile');
  var tag = document.createElement('i');
  tag.classList.add('fas');
  tag.classList.add('fa-angle-down');
  tag.id = 'down_';
  if (namePlayer.length > 10) {
	namePlayer = namePlayer.substring(0, 10);
	namePlayer = namePlayer + '...';
  }
  bnameplayer.textContent = namePlayer;
  bnameplayer.appendChild(tag);

  var titlename = document.querySelector('title');
  titlename.textContent = 'Planning Poker || ' + gameName;

  let current_user_id = '';
  let cookiess = document.cookie;
  let ca = cookiess.split('=');
  current_user_id = ca[1];

  //Verificar apenas para o seu usuário se tem uma carta selecionada e add a carta ativa
  const verifyativo = ref(
    getDatabase(),
    'Games/' + Idsala + '/players/' + current_user_id
  );

  get(verifyativo).then((data) => {
    if (data.val().card != '') {
      let card_val = data.val().card;
      let selectcheap = document.querySelector('div.cheap');
      selectcheap.childNodes.forEach((ss) => {
        if (card_val == ss.textContent) {
          ss.classList.add('ativo');
          let button_select = document.querySelector('button.RevelCards');
          button_select.classList.remove('hidden');
        }
      });
    }
  });

  const verifycards = ref(
    getDatabase(),
    'Games/' + Idsala + '/players/'
  );

  get(verifycards).then((players) => {
    Object.keys(players.val()).forEach((id) => {
      if (id != 'cards_turned') {
        let select_id = ref(
          getDatabase(),
          'Games/' + Idsala + '/players/' + id
        );
        get(select_id).then((idespecify) => {
          if (idespecify.val().card != '') {
            let backcard = document.getElementById(id);
            backcard.classList.remove('other_background_card');
            backcard.classList.add('background_card');
          }
        });
      }
    });
  });
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
  if (namePlayer.length > 10) {
	namePlayer = namePlayer.substring(0, 10);
	namePlayer = namePlayer + '...';
  }
  bnameplayer.textContent = namePlayer;
  bnameplayer.appendChild(tag);

  var titlename = document.querySelector('title');
  titlename.textContent = 'Planning Poker || ' + gameName;

  let current_user_id = '';
  let cookies = document.cookie;
  let ca = cookies.split('=');
  current_user_id = ca[1];

  let imgselect = document.querySelector('div.cardplayerplay');
  imgselect.id = current_user_id;

  let pselect = document.querySelector('div.nameaftercard');
  if (pselect) {
    pselect.classList.add(current_user_id);
  }

  listen_game();
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

export function deleteAllCookies() {
  var cookies = document.cookie.split(';');

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf('=');
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}
