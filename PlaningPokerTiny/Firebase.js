import { initializeApp } from 'firebase/app';
import {  getDatabase,  ref,  child,  get, push,  onValue,  update,  onChildChanged,  onChildAdded, set} from 'firebase/database';
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
    //console.log(game_id)
  const db = getDatabase();
  set(ref(db, 'Games/' + game_id + "/players"+ "/cards_turned"), {
    turned: false,
  });

  //Colcoar o id do primeiro jogador na id da tag img no html fixo

  let first_id_player = playersRef.key
  let imgselect  = document.querySelector("img.imgbackcard")
  imgselect.id = first_id_player

  // Colocar o Id do player na tag p do nome em baixo da carta

  let pselect = document.querySelector('.nameaftercard')
  pselect.classList.add(first_id_player)

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

  //console.log(Idsala);

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
        //console.log('No data available');
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
        //console.log('No data available');
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
          //console.log(playerId)
          let markup = `
            <div class="cardplayer">
              <div class="cardplayerplay">
                  <button class="cardnew hidden" id="newcard"></button>
                  <img id="${playerId}" class="imgbackcard hidden" src="img/backcard.png">
              </div>
              <div class="nameplayeraftercard">
                <p class="nameaftercard ${playerId}">
                    ${nome}
                </p>
            </div>
            </div>
          `;
          //console.log(markup)
          let pselector = document.getElementById('players');
          pselector.innerHTML += markup;
        }
      }
    }
    //});
  });

  //Verificar se os jogadores selecionaram as cartas e colocar a imagem de trás da carta
  const dbrefcardchange = ref(getDatabase(),'Games/' + Global_Game_ID + "/players")
   onChildChanged(dbrefcardchange, (data)=>{
     
      if (data.val().card != ''){
        let imageretire = document.getElementById(data.key);
        if(imageretire){
          imageretire.classList.remove('hidden');
        }
      } else {
        let imageretire = document.getElementById(data.key);
        if(imageretire){
          imageretire.classList.add('hidden');
        }
      }
  })

  //Setar  timer e revelar as cartas
  const dbreftimer = ref(getDatabase(),'Games/' + Global_Game_ID + "/players" + "/cards_turned")
  onChildChanged(dbreftimer, (change)=>{

      if(change.val()== true){
          //console.log('entrou')
      //Timer
      var duracao = 2;
    
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

          let gbrefturncards = ref(getDatabase(),"Games/" + Global_Game_ID + "/players/")
          get(gbrefturncards).then((snapshot) => {
            Object.keys(snapshot.val()).map((user)=>{
              let aa = document.getElementById(user)
              if(aa){
                let tt = aa.previousElementSibling
                tt.classList.remove('hidden')

                var oldcard = document.getElementById(user);
                oldcard.classList.add('hidden');

              }
            })
          }).catch((error) => {
            console.error(error);
          });

          // calcular a média
          var soma = 0;
          var count = ''
          var vetor = []
          get(gbrefturncards).then((data) => {
            data.forEach(dataItem =>{
              if (dataItem.val().name){
                if(dataItem.val().card == "?"){
                soma += 0;
                vetor.push(dataItem.val().card)
                }else
                soma += Number(dataItem.val().card)
                count ++;
                vetor.push(Number(dataItem.val().card))
              }
            })

            let presultofvoting = document.getElementById('result')
            presultofvoting.textContent = (soma/count).toFixed(1)

            // Adiconar as cartas selecionadas com as respectivas qunatidades de votos

              var vetorformatado = ''
              vetorformatado = vetor.filter(function(el, i) {
                  return vetor.indexOf(el) === i;
              });
              //console.log(vetorformatado);

            vetorformatado.forEach(n=>{
              var count_num = 0
              vetor.forEach(num=>{
                if (num == n){
                  count_num ++;
                }
              })

              let htmlfix = `
              <div class="alignvotecards">
                <button class="cardresults">${n}</button>
                <div>
                    <p class="voteaftercard">Votes: ${count_num}</p>
                </div>
              </div>
              `
              let select = document.getElementById('cheapresult')
              select.innerHTML += htmlfix
            })
          }).catch((error) => {
            console.error(error);
          });

          var timer = document.querySelector('p#timer');
          timer.classList.add('hidden');
        
          // var oldcard = document.querySelector('img.imgbackcard');
          // oldcard.classList.add('hidden');
        
          // var newcard = document.querySelector('button#newcard');
          // newcard.classList.remove('hidden');
        
          var buttonnewvoting = document.querySelector('button.StartNewVoting');
          buttonnewvoting.classList.remove('hidden');
        
          var cheapnew = document.querySelector('div.cheap');
          cheapnew.style.opacity = '';
        
          var popac = document.querySelector('p.choosecard');
          popac.style.opacity = '';
        
          var result = document.querySelector('div.resultofvoting');
          result.classList.remove('hidden');


    
          timer.textContent = '';
        }
    
        duracao--;
      }, 1000);
    
      // Valor Carta (Buscar no banco, pois senão lança uma exeption)

      let gbrefgetcardvalue = ref(getDatabase(),"Games/" + Global_Game_ID + "/players/")
      get(gbrefgetcardvalue).then((snapshot) => {
        Object.keys(snapshot.val()).map((el)=>{
          const card = document.getElementById(el);
          if(card){
            const sb = card.previousElementSibling;
            sb.textContent = snapshot.val()[el].card;
          }
        })
      }).catch((error) => {
        console.error(error);
      });

    
      //var cardvalue = document.querySelector('button.card.ativo').textContent;
      // if (cardvalue == ''){
      //   cardvalue = "?"
      // }
    
      // var cardselect = document.querySelector('button#newcard');
      // cardselect.textContent = cardvalue;
    
      var cheapnew = document.querySelector('div.cheap');
      cheapnew.style.opacity = '0.2';
    
      var popac = document.querySelector('p.choosecard');
      popac.style.opacity = '0.2';
    
    }else if(change.val() == false){

          let gbrefstartnewround = ref(getDatabase(),"Games/" + Global_Game_ID + "/players/")
          get(gbrefstartnewround).then((snapshot) => {
            Object.keys(snapshot.val()).map((user)=>{
              let hh = document.getElementById(user)
              if(hh){
                let jj = hh.previousElementSibling
                jj.classList.add('hidden')

              let olddcard = document.getElementById(user);
                olddcard.classList.add('hidden');

                var buttonnewvoting = document.querySelector('button.StartNewVoting');
                buttonnewvoting.classList.add('hidden');

              }
            })
          }).catch((error) => {
            console.error(error);
          });


      //Quando o cara clica em começar uma nova votação
      var timer = document.querySelector('p#timer');
      timer.classList.remove('hidden');

      // var oldcard = document.querySelector('img.imgbackcard');
      // oldcard.classList.add('hidden');

      // var newcard = document.querySelector('button#newcard');
      // newcard.classList.add('hidden');

      // var buttonnewvoting = document.querySelector('button.StartNewVoting');
      // buttonnewvoting.classList.add('hidden');

      var result = document.querySelector('div.resultofvoting');
      result.classList.add('hidden');

      var cardativo = document.querySelector('button.card.ativo');
      if(cardativo){
        cardativo.classList.remove('ativo');
      }

      var temp = document.querySelector('p#temp');
      temp.classList.remove('hidden');

      let teste = document.getElementById('cheapresult')
      teste.innerHTML = ""
        
    }
  })
  //Verificar o noem do jogador alterado e mudar para os outros

  let dbchangename = ref(getDatabase(),"Games/" + Global_Game_ID + "/players/")
  onChildChanged(dbchangename, (data)=>{
    if(data.val().name){
  get(dbchangename).then((snapshot) => {
      let yy = document.querySelector(`p.${data.key}`)
      if(yy){ 
        yy.textContent = data.val().name;        
      }
  }).catch((error) => {
    console.error(error);
  });
    }

  })


  // let gbrefgetcardvalue = ref(getDatabase(),"Games/" + Global_Game_ID + "/players/")
  // get(gbrefgetcardvalue).then((snapshot) => {
  //   Object.keys(snapshot.val()).map((el)=>{
  //     const card = document.getElementById(el);
  //     if(card){
  //       const sb = card.previousElementSibling;
  //       sb.textContent = snapshot.val()[el].card;
  //     }
  //   })
  // }).catch((error) => {
  //   console.error(error);
  // });






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
        //console.log('No data available');
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

  // let dbchangename = ref(getDatabase(),"Games/" + Global_Game_ID + "/players/")
  // get(dbchangename).then((snapshot) => {
  //   Object.keys(snapshot.val()).map((user)=>{
  //     let aa = document.querySelector(`p.${user}`)
  //     aa.textContent = nameChange;        
  //   })
  // }).catch((error) => {
  //   console.error(error);
  // });

  var pnameplayer = document.querySelector("p.nameaftercard");
  if(pnameplayer){
    pnameplayer.textContent = nameChange;
  }
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
      //console.log('No data available');
    }
  });

  let namePlayer = '';
  // Buscar no Banco o nome do player
  await get(child(dbRef, 'Games/' + Idsala + '/players/' + user_ID)).then(
    (snapshot) => {
      if (snapshot.exists()) {
        namePlayer = snapshot.val().name; // para colocar o noem do jogo na tela quanado um novo jogador entrar
      } else {
        //console.log('No data available');
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

  let current_user_id = '';
  let cookiess = document.cookie;
  let ca = cookiess.split('=');
  current_user_id = ca[1];

  let imgselect  = document.querySelector("img.imgbackcard")
  imgselect.id = current_user_id

  let pselect = document.querySelector('.nameaftercard')
  pselect.classList.add(current_user_id)
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

  let current_user_id = '';
  let cookies = document.cookie;
  let ca = cookies.split('=');
  current_user_id = ca[1];

  let imgselect  = document.querySelector("img.imgbackcard")
  imgselect.id = current_user_id

  let pselect = document.querySelector('.nameaftercard')
  pselect.classList.add(current_user_id)

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