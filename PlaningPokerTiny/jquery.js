import {
	getDatabase,
	ref,
	child,
	get,
	push,
	onValue,
	update,
  } from 'firebase/database';
  import { New_Game } from './Firebase.js';
  import { New_Player } from './Firebase.js';
  import { Change_Name } from './Firebase.js';
  import { getDataUserAuth } from './Firebase.js';
  import { listen_game } from './Firebase.js';
  import { RetirarHide } from './JavaScript.js';
  import { CopyUrlTransfer } from './JavaScript.js';
  import { deleteAllCookies } from './Firebase.js';
  import $ from 'jquery';
  
  $(document).ready(function () {
	$('#namegame').val('Tiny'); // Pré carregar o nome padrão do jogo como "Tiny"

	var url = window.location.href;
	var res = url.split('#');
	let Global_Game_ID = '';
	if (res.length > 1) {
	  // Se já existir um game criado e  o jogador entarr pela url com o ID
	  var idnotf = res[1].substr(3);
	  Global_Game_ID = idnotf;
	  var cookies = document.cookie;
	  //Verificar se tem um cokkie salvo, então não pedir um nome para o jogador entrar
	  if (cookies.length == 0) {
		$('.register').addClass('hidden');
		$('.section, .superhide, .footer').removeClass('hidden');
		$('.nmplayer').removeClass('hidden');
	  } else {
		let current_user_id = '';
		let cookies = document.cookie;
		let ca = cookies.split('=');
		current_user_id = ca[1];
  
		//Verificar se o jogador que entou esta com o ID na sala anterior ou não
		let verify = ref(getDatabase(), 'Games/' + Global_Game_ID + '/players/');
		get(verify)
		  .then((snapshot) => {
			if (Object.keys(snapshot.val()).includes(current_user_id)) {
			} else {
			  deleteAllCookies();
			  window.location.reload();
			}
		  })
		  .catch((error) => {
			console.error(error);
		  });
  
		$('.register').addClass('hidden');
		$('.section, .superhide, .footer').removeClass('hidden');
		getDataUserAuth(Global_Game_ID);
  
		listen_game();
	  }
	}
  
	$('.cg').on('click', function () {
	  let NewName = $('.displaynamenew').val();
	  let flag = 0;
	  var nameChange = document.getElementById('ChangeNamePlayerInput').value;
	
	  const verifyName = NewName.split(' ').map((i) => {
		if (i.length != 0) {
		  flag = 1;
		}
	  });
	
	  if (flag == 0) {
		window.alert('Please enter a name to enter in the Game');
	  } else {
		New_Player(NewName, Global_Game_ID);
		$('.nmplayer').addClass('hidden');
	  }
	});
  
	$('.pencil').on('click', () => {
	  Change_Name();
	});
  
	$('.invite').on('click', () => {
	  RetirarHide();
	});
  
	$('.lastoption').on('click', () => {
	  var element = document.getElementById('escondido');
	  element.classList.remove('hidden');
	});
  
	$('.copyurllink').on('click', () => {
	  CopyUrlTransfer();
	});
  
	$('.cheap .card').click(function (e) {
	  if (!$(this).hasClass('ativo')) {
		$('.card.ativo').removeClass('ativo');
	  }
	  $(this).toggleClass('ativo');
	  if ($(this).hasClass('ativo')) {
		RetireHideRevelCards();
		// Jogar o valor da carta para o banco no respectivo usuário
  
		//Buscar o ID do usuário que esta jogando
		let current_user_id = '';
		let cookies = document.cookie;
		let ca = cookies.split('=');
		current_user_id = ca[1];
  
		// Buscar o Id do jogo pela URL
  
		let url = window.location.href;
		let res = url.split('#');
		let idnotf = res[1].substr(3);
		Global_Game_ID = idnotf;
  
		let card_value = $('.card.ativo').text();
		let card = {
		  card: card_value,
		};
		let dbref = update(
		  ref(
			getDatabase(),
			'Games/' + Global_Game_ID + '/players/' + current_user_id
		  ),
		  card
		);
  
	  } else {
		AddHideRevelCards();
		//Retirar o valor da carta no banco caso o player desclicar da mesma
		let current_user_id = '';
		let cookies = document.cookie;
		let ca = cookies.split('=');
		current_user_id = ca[1];
  
		let card = {
		  card: '',
		};
		let dbref = update(
		  ref(
			getDatabase(),
			'Games/' + Global_Game_ID + '/players/' + current_user_id
		  ),
		  card
		);
	  }
	});
  
	// Alterar para cartas viradas : true
	$('#RevelCards').on('click', function (e) {
	  let Global_Game_ID = '';
	  // Buscar o Id do jogo pela URL
  
	  let url = window.location.href;
	  let res = url.split('#');
	  let idnotf = res[1].substr(3);
	  Global_Game_ID = idnotf;
  
	  let udpaterevealcards = {
		turned: true,
	  };
	  const dbref = update(
		ref(
		  getDatabase(),
		  'Games/' + Global_Game_ID + '/players' + '/cards_turned'
		),
		udpaterevealcards
	  );
	  $('.hideCards').removeClass('hidden');
	});
  
	// Alterar para cartas viradas : false
	$('#StartNewVoting').on('click', function (e) {
	  let Global_Game_ID = '';
	  // Buscar o Id do jogo pela URL
  
	  let url = window.location.href;
	  let res = url.split('#');
	  let idnotf = res[1].substr(3);
	  Global_Game_ID = idnotf;
  
	  let udpaterevealcards = {
		turned: false,
	  };
	  const dbref = update(
		ref(
		  getDatabase(),
		  'Games/' + Global_Game_ID + '/players' + '/cards_turned'
		),
		udpaterevealcards
	  );
  
	  $('.hideCards').addClass('hidden');
  
	  //Limapr  a carta selecionada de cada jogador
  
	  let dbrefclean = ref(getDatabase(), "Games/"+Global_Game_ID+"/players/");
  
	  get(dbrefclean).then((snapshot) => {
  
	  Object.keys(snapshot.val()).forEach((id)=>{
	  if (id != "cards_turned"){
		let reff = ref(getDatabase(),"Games/"+Global_Game_ID+"/players/"+id)
	   update(reff, {card: ""});
	  }
	  })
		
	  })
  
	});
  
	$(document).click(function (e) {
	  //Para fechar fora timer
	  var container = $('#time');
	  var icone = $('.fa-clock');
  
	  if (
		!container.is(e.target) &&
		container.has(e.target).length === 0 &&
		!icone.is(e.target)
	  ) {
		$('#time').addClass('hidden');
	  }
	  //Para fechar fora news
	  var containerNews = $('#newsus');
	  var iconeNews = $('.fa-newspaper');
  
	  if (
		!containerNews.is(e.target) &&
		containerNews.has(e.target).length === 0 &&
		!iconeNews.is(e.target)
	  ) {
		$('#newsus').addClass('hidden');
	  }
	});
  
	//Para fechar close do Invite players
  
	$('.closexinvite').on('click', function (e) {
	  $('.dialog2').toggleClass('hidden');
	});
  
	//Para fechar close e no botão news
	$('.news, #closenews').on('click', function (e) {
	  $('.newsus').toggleClass('hidden');
	});
	//Para fechar o change player name
	$('.profile').on('click', function (e) {
	  $('#escon').toggleClass('hidden');
	});
  
	$('.dialog,#close,.canceldeck').on('click', function (e) {
	  if (e.target !== this) return;
  
	  $('.dialog').addClass('hidden');
	  $('.slectall').val($('.slectall option:first').val());
	});
  
	//Clicar para abrir e fechar o Invite Players
  
	$('.dialog2').on('click', function (e) {
	  if (e.target !== this) return;
  
	  $('.dialog2').addClass('hidden');
	  $('.slectall').val($('.slectall option:first').val());
	});
  
	// Animação do usuário criar os cards
  
	$('#valuecustomdeck').on('input', function (e) {
	  const valores = e.target.value.split(','); // Array de valores
  
	  $('.previewcards').html('');
  
	  valores.map((str) => {
		const strFormatada = str.trim();
		if (strFormatada.length <= 3 && strFormatada) {
		  $('.previewcards').append(
			"<button class ='card'>" + strFormatada + '</button>'
		  );
		}
	  });
	});
  
	//Salvar o Deck
  
	$('.savedeck').on('click', function () {
	  var CustomDeckValue = $('#namecustomdeck').val();
	  var cards = $('#valuecustomdeck').val();
	  CustomDeckValue += ' (' + cards + ')';
	  setCookie(CustomDeckValue, 1);
	  $('.lastoption').before(
		"<option name='mcustom' value='" +
		  $('#valuecustomdeck').val() +
		  "'>" +
		  CustomDeckValue +
		  '</option>'
	  );
	  $('.dialog').addClass('hidden');
	  $('#namecustomdeck').val('My Custom Deck');
	});
  
	//retirar o hidden do clock
	$('.clock').on('click', function (e) {
	  $('#time').toggleClass('hidden');
	});
  
	// Retirar o Hidden do QR CODE
  
	$('#qrcode').on('click', function () {
	  $('#qrcodehide').removeClass('hidden');
	});
  
	$('.qcode').on('click', function (e) {
	  if (e.target !== this) return;
  
	  $('.qcode').addClass('hidden');
	});
  
	$('.closeqrcode').on('click', function (e) {
	  $('.qcode').addClass('hidden');
	});
  
	//Esta função abaixo é para validar se o player colocou o nome do jogo e do player ou não
  
	$('.creategame').on('click', async function (e) {
		let flag = 0;
		let nameChange = $('#displayname').val();
		let nameGame = $('#namegame').val();
	  
		const verifyName = nameChange.split(' ').map((i) => {
		  if (i.length != 0) {
			flag = 1;
		  }
		});

		if(nameGame.length == 0){
			window.alert("Please, insert a name for the game");
		}else{
	  
		if (flag == 0) {
		  window.alert('You need put any name to start a game');
		} else {
  
			$('.register').addClass('hidden');
			$('.section, .footer, .superhide').removeClass('hidden');
		
			New_Game();
		}
	}
	});
  
	//Copiar a URL do site para o input de invite players
  
	$('.invite, .titleinviteplayers').on('click', function () {
	  var inputc = document.getElementById('inputurlfix');
	  inputc.value = window.location.href;
	});
  
	$('#qrcode').on('click', function () {
	  var inputcqrcode = document.getElementById('qrcodecontent');
	  inputcqrcode.value = escape(window.location.href);
	  GeraQRCode();
	});
  });
  
  function setCookie(cValue, expDays) {
	let date = new Date();
	date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
	const expires = 'expires=' + date.toUTCString();
	document.cookie = cValue + '; ';
  }
  
  
  //Função para adiconar o botão de revelar as cartas, mas se as cartas estiverem sendo viradas, ele não irá mostrar
  function RetireHideRevelCards() {
	  var revealcards = document.getElementById('RevelCards');
	  revealcards.classList.remove('hidden');
  }
  
  function AddHideRevelCards() {
	var revealcards = document.getElementById('RevelCards');
	revealcards.classList.add('hidden');
  }
  
  //Gerar o QR Code
  function GeraQRCode() {
	var conteudo = document.getElementById('qrcodecontent').value;
	var GoogleCharts =
	  'https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=';
	var imagemQRCode = GoogleCharts + conteudo;
	document.getElementById('imageQRCode').src = imagemQRCode;
  }
  