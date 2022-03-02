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
import $ from 'jquery';

$(document).ready(function () {
  //getVotingSystem();

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
      $('.section, .superhide').removeClass('hidden');
      $('.nmplayer').removeClass('hidden');
    } else {
      $('.register').addClass('hidden');
      $('.section, .superhide').removeClass('hidden');
      getDataUserAuth(Global_Game_ID);

      listen_game();
    }
  }
  $('.cg').on('click', function () {
    let NewName = $('.displaynamenew').val();
    New_Player(NewName, Global_Game_ID);
    $('.nmplayer').addClass('hidden');
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
      RetireHideImageCard();
      RetireHideRevelCards();
    } else {
      AddHideImageCard();
      AddHideRevelCards();
    }
  });

  $('#RevelCards').on('click', function () {});

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

    //Para Fechar fora do Change name Player
    var containerNews = $('#escon');
    var iconeNews = $('.profile');

    if (
      !containerNews.is(e.target) &&
      containerNews.has(e.target).length === 0 &&
      !iconeNews.is(e.target)
    ) {
      $('#escon').addClass('hidden');
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
  $('.profile, .fa-address-card, .fa-angle-down').on('click', function (e) {
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

  $('#closeqrcode').on('click', function (e) {
    $('.qcode').addClass('hidden');
  });

  //Esta função abaixo é para validar se o player colocou o nome ou não

  $('.creategame').on('click', async function (e) {
    if ($('#displayname').val().length == 0) {
      alert('Favor inserir nome antes de enviar');
      return;
    }

    $('.register').addClass('hidden');
    $('.section, .footer, .superhide').removeClass('hidden');

    New_Game();
  });

  //Copiar a URL do site para o input de invite players

  $('.invite, .titleinviteplayers').on('click', function () {
    var inputc = document.getElementById('inputurlfix');
    inputc.value = window.location.href;
  });

  $('#qrcode').on('click', function () {
    var inputcqrcode = document.getElementById('qrcodecontent');
    inputcqrcode.value = window.location.href;
    GeraQRCode();
  });
});

// function getVotingSystem() {
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

function setCookie(cValue, expDays) {
  let date = new Date();
  date.setTime(date.getTime() + expDays * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = cValue + '; ';
}

function RetireHideImageCard() {
  var imageretire = document.getElementById('imgbackcard');
  imageretire.classList.remove('hidden');
}

function RetireHideRevelCards() {
  var revealcards = document.getElementById('RevelCards');
  revealcards.classList.remove('hidden');
}

function AddHideImageCard() {
  var imageretire = document.getElementById('imgbackcard');
  imageretire.classList.add('hidden');
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