import {
  getDatabase,
  ref,
  child,
  get,
  push,
  onValue,
  update,
  set,
} from 'firebase/database';

export function RetirarHide() {
  var elemento = document.getElementById('escondido2');
  elemento.classList.remove('hidden');
}

//Copiar para a area de transferencia do usuario com o botão Copy Invitation link

export function CopyUrlTransfer() {
  var inputc = document.body.appendChild(document.createElement('input'));
  inputc.value = window.location.href;
  inputc.focus();
  inputc.select();
  document.execCommand('copy');
  inputc.parentNode.removeChild(inputc);
  alert('URL Copied.');
  fecharJanela();
}

function fecharJanela() {
  var elemento = document.getElementById('escondido2');
  elemento.classList.add('hidden');
}

let buttonsettimer = document.querySelector('button#RevelCards');
buttonsettimer.addEventListener('click', SetTimer);

function SetTimer() {
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

      resumoVotacao();
      timer.textContent = '';
    }

    duracao--;
  }, 700);

  // Valor Carta

  // var cardvalue = document.querySelector('button.card.ativo').textContent;

  // var cardselect = document.querySelector('button#newcard');
  // cardselect.textContent = cardvalue;

  var cheapnew = document.querySelector('div.cheap');
  cheapnew.style.opacity = '0.2';

  var popac = document.querySelector('p.choosecard');
  popac.style.opacity = '0.2';
}

function resumoVotacao() {
  var timer = document.querySelector('p#timer');
  timer.classList.add('hidden');

  var oldcard = document.querySelector('div.cardplayerplay');
  oldcard.classList.remove('background_card');

  var newcard = document.querySelector('button#newcard');
  newcard.classList.remove('hidden');

  var buttonnewvoting = document.querySelector('button.StartNewVoting');
  buttonnewvoting.classList.remove('hidden');

  var cheapnew = document.querySelector('div.cheap');
  cheapnew.style.opacity = '';

  var popac = document.querySelector('p.choosecard');
  popac.style.opacity = '';

  var result = document.querySelector('div.resultofvoting');
  result.classList.remove('hidden');
}

let butt = document.querySelector('button.StartNewVoting'); // <- Start New Voting
butt.addEventListener('click', function (e) {

  var timer = document.querySelector('p#timer');
  timer.classList.remove('hidden');

  var newcard = document.querySelector('button#newcard');
  newcard.classList.add('hidden');

  var buttonnewvoting = document.querySelector('button.StartNewVoting');
  buttonnewvoting.classList.add('hidden');

  var result = document.querySelector('div.resultofvoting');
  result.classList.add('hidden');

  var cardativo = document.querySelector('button.card.ativo');
  if(cardativo){
    cardativo.classList.remove('ativo');
  }

  var temp = document.querySelector('p#temp');
  temp.classList.remove('hidden');

});
