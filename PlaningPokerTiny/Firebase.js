import {initializeApp} from "firebase/app";
import {getDatabase, ref, child, get, push} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBcXWuDslHfFbtENzKZaiNoYdEwXDyrEq8",
  authDomain: "planingpokertiny-42303.firebaseapp.com",
  projectId: "planingpokertiny-42303",
  storageBucket: "planingpokertiny-42303.appspot.com",
  messagingSenderId: "140539119102",
  appId: "1:140539119102:web:3e40df81defb6295c0ecaf"
};

const app = initializeApp(firebaseConfig);

  var game_id = "";
  var gameName = ""
  var nameFirtsPlayer = ""
  var Global_Game_ID = ""
  var Global_FirtsUser_ID = ""

export async function New_Game() {

  gameName = document.getElementById('namegame').value;
  nameFirtsPlayer = document.getElementById('displayname').value;

  if (!game_id){
    const response = await push(ref(getDatabase(app), "Games"), {
      name: gameName
    })

    game_id = response.key;
  }
  const teste = firebase.database().ref().child('Games/' + game_id)
  const namegamedb ={name: gameName}

  teste.set(namegamedb)

  const playersRef = firebase.database().ref().child('Games/' + game_id + '/' + '/players');
  const player = {
    name: nameFirtsPlayer,
    card: '',
  };

  const p = await playersRef.push(player);

  //console.log(p.key); // id player
  // AJAX -> TelaJogo {id, nome, jogo}
  // TelaJogo obtemInformacoes
  // Editar NomePlayer => Pega o id do usuario e da um set/update

  PutInformationInScreen();

  Global_Game_ID = game_id;
  Global_FirtsUser_ID = p.key;

  routie('id=' + Global_Game_ID);
  
}

// async function GetInformations(){   
//   var infor = firebase.database().ref('Games/');
//   infor.on('value', (snapshot) => {
//     const data = snapshot.val();
//     console.log(data)
//   });

// }


export async function New_Player(NameNewPlayer){
    var NewPlayer = {
      name: NameNewPlayer,
      card: '',
    };
    let ref = firebase.database().ref().child('Games/' + Global_Game_ID +'/players') 

    let p = ref.push(NewPlayer)

      // Buscar no Banco o nome do Jogo
      var Global_nameGame = '';
      var dbrefgamename = firebase.database().ref().child('Games/'+ Global_Game_ID)
        
      dbrefgamename.once('value', (snapshot)=>{
         Global_nameGame = snapshot.val().name;
         console.log(Global_nameGame)
      })

      console.log(Global_nameGame)

      //Buscar no Banco o Jogadores que já estão na sessão

        var dbrefnameplayer = firebase.database().ref().child('Games/' + Global_Game_ID +'/players')    
      
        dbrefnameplayer.on('value', (snapshot)=>{
          snapshot.forEach(snapshotItem => {

            let chave = snapshotItem.key
            let dado = snapshotItem.val().name;

            console.log(chave,dado)
        })
      })

    PutInformationInScreen();
}


//const staylisten = setInterval(listen_game,500)

async function listen_game(){

  let game_ref = firebase.database().ref('Games/' + Global_Game_ID);

  game_ref.on('child_changed', (snapshot) =>{
    Object.keys(snapshot.val().players).map((playerId)=>{
      console.log(playerId)
      if (Global_FirtsUser_ID != playerId){
        const nome = snapshot.val().players[playerId].name;
        if(nome){
          //Colocar o nome na Tela Jogo
        }
      }
    })
  })

}

async function Change_Name(){
  var nameChange = document.getElementById("ChangeNamePlayer").value;

  let dbref = firebase.database().ref('Games/' + Global_Game_ID + '/players' + '/' + Global_FirtsUser_ID)

  let playerChange = {
    name: nameChange,
    card: '',
  };

  if (nameChange.lenght == 0){
    window.alert("For Change a name first, you neded to put a any name")
  }else{
    dbref.update(playerChange)
  }

  var pnameplayer = document.querySelector("p.nameaftercard");
  pnameplayer.textContent = nameChange;
  // Nome no botão para trocar o mesmo
  var bnameplayer = document.querySelector("button.profile");
  var tag = document.createElement("i");
  tag.classList.add("fas");
  tag.classList.add("fa-angle-down");
  bnameplayer.textContent = nameChange;
  bnameplayer.appendChild(tag);

  var closesection = document.querySelector("div.diag")
  closesection.classList.add("hidden")
}

async function PutInformationInScreen(){
  //Nome do lado da imagem
  var labelgame = document.querySelector("label.namegame");
  labelgame.textContent = gameName;
  //Nome em baixo da carta com a animação
  var pnameplayer = document.querySelector("p.nameaftercard");
  pnameplayer.textContent = nameFirtsPlayer;
  // Nome no botão para trocar o mesmo
  var bnameplayer = document.querySelector("button.profile");
  var tag = document.createElement("i");
  tag.classList.add("fas");
  tag.classList.add("fa-angle-down");
  bnameplayer.textContent = nameFirtsPlayer;
  bnameplayer.appendChild(tag);

  var titlename = document.querySelector("title");
  titlename.textContent = "Planning Poker || " + gameName;

  listen_game();
}
