import {initializeApp} from "firebase/app";
import {getDatabase, ref, child, get, push, onValue, update} from "firebase/database";
import "./routie"

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

  const playersRef = await push(ref(getDatabase(app), "Games/" + game_id + '/players'), {
    name: nameFirtsPlayer,
    card: '',
  })

  let stringcon = playersRef.key + ";" + nameFirtsPlayer + ";" + gameName
  setCookie(nameFirtsPlayer,stringcon,1)
  PutInformationInScreen();

  Global_Game_ID = game_id;
  Global_FirtsUser_ID = playersRef.key;

  routie('id=' + Global_Game_ID);
  listen_game();
}


export async function New_Player(NameNewPlayer,Idsala){
    var NewPlayer = {
      name: NameNewPlayer,
      card: '',
    };

    const refdb = push(ref(getDatabase(app),'Games/' + Idsala + '/players'),NewPlayer)

    console.log(refdb.key) // Salvr isso em um cookie

    setCookie(NameNewPlayer,refdb.key,1)

      // Buscar no Banco o nome do Jogo
      const dbRef = ref(getDatabase());
      await get(child(dbRef, "Games/" + Idsala)).then((snapshot) => {
        if (snapshot.exists()) {
          gameName = snapshot.val().name // para colocar o noem do jogo na tela quanado um novo jogador entrar
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
      nameFirtsPlayer = NameNewPlayer; // para colocar o nome do jogo na tela quanado um novo jogador entrar

      //Buscar no Banco o Jogadores que já estão na sessão

      let teste = '';
      await get(child(dbRef, "Games/" + Idsala + "/players")).then((snapshot) => {
        if (snapshot.exists()) {
          teste = snapshot.val()
          console.log(teste)
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });

    PutInformationInScreen();
}


//const staylisten = setInterval(listen_game,500)

async function listen_game(){

  // Buscar o ID do Jogo
  const dbRef = ref(getDatabase());
  await get(child(dbRef, "Games/")).then((snapshot) => {
    if (snapshot.exists()) {
      Global_Game_ID = Object.keys(snapshot.val())[0]
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
  
  const db = getDatabase();
  const starCountRef = ref(db, 'Games/' + Global_Game_ID + '/players');
  onValue(starCountRef, (snapshot) => {
    console.log(snapshot.val())
  });

  // game_ref.on('child_changed', (snapshot) =>{
  //   Object.keys(snapshot.val().players).map((playerId)=>{
  //     console.log(playerId)
  //     if (Global_FirtsUser_ID != playerId){
  //       const nome = snapshot.val().players[playerId].name;
  //       if(nome){
  //         //Colocar o nome na Tela Jogo
  //       }
  //     }
  //   })
  // })

}

export async function Change_Name(){
  var nameChange = document.getElementById("ChangeNamePlayer").value;

  let playerChange ={
    name: nameChange,
    card: '',
  }

    const dbref = ref(getDatabase(app),'Games/' + Global_Game_ID + '/players' + '/' + Global_FirtsUser_ID)

  if (nameChange.lenght == 0){
    window.alert("For Change a name first, you neded to put a any name")
  }else{
    update(dbref,playerChange)
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

}

function setCookie(cname, cvalue ,exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires="+ d.toUTCString();
  console.log(gameName,nameFirtsPlayer)
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
} 

// export function getDataUserAuth() {
//   let cookies = document.cookie;
//   var options = cookies.split(';');
//   options.forEach((element) => {
//     if (element.length > 0) {
//       var regExp = /\(([^)]+)\)/;
//       var value = regExp.exec(element);
//       $('.lastoption').before(
//         "<option name='mcustom' value='" +
//           value[1] +
//           "'>" +
//           element +
//           '</option>'
//       );
//     }
//   });
// }