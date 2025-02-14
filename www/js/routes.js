// INICIALIZAÇÃO DO FRAMEWORK7
var app = new Framework7({
  el: '#app',
  name: 'My App',
  id: 'com.myapp.test',
  panel: {
    swipe: true,
  },
  dialog: {
    buttonOk: 'Sim',
    buttonCancel: 'Cancelar',
  },
  routes: [
    {
      path: '/',
      url: './index.html',  // Página inicial
      animate: false
    },
    {
      path: '/camera/',
      url: './link2.html',  // Página de Captura de Imagem
      animate: false,
      on: {
        pageInit: function () {
          console.log("Página de Captura de Imagem carregada.");
          setTimeout(() => {
            let fileInput = document.getElementById("fileInput");
            if (fileInput) {
              fileInput.addEventListener("change", processarImagem);
            }
          }, 500);
        }
      }
    },
    {
      path: '/results/',
      url: './link3.html',  // Página de Resultados
      animate: false,
      on: {
        pageInit: function () {
          console.log("Página de Resultados carregada.");
          setTimeout(mostrarResultados, 500);
        }
      }
    }
  ]
});

// CRIAÇÃO DA VIEW PRINCIPAL
var mainView = app.views.create('.view-main', { url: '/' });

// EVENTO PARA ALTERAÇÃO DE MENU ATUAL
app.on('routeChange', function (route) {
  var currentRoute = route.url;
  console.log("Navegando para: " + currentRoute);
  document.querySelectorAll('.tab-link').forEach(function (el) {
    el.classList.remove('active');
  });
  var targetEl = document.querySelector('.tab-link[href="' + currentRoute + '"]');
  if (targetEl) {
    targetEl.classList.add('active');
  }
});

// FUNÇÃO PARA CAPTURAR, ENVIAR E PROCESSAR A IMAGEM NO SERVIDOR FLASK
function processarImagem() {
  let input = document.getElementById('fileInput');
  if (!input || input.files.length === 0) {
    alert("Por favor, selecione uma imagem.");
    return;
  }

  let file = input.files[0];
  let formData = new FormData();
  formData.append("imagem", file);

  // Exibir carregamento antes do processamento
  app.dialog.preloader("Processando imagem...");

  // ALTERE O IP AQUI 🔽 🔽 🔽 
  fetch("http://192.168.X.X:5000/processar", {  // Substitua pelo IP correto do PC
    method: "POST",
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    app.dialog.close(); // Fecha a tela de carregamento

    if (data.imagem_processada) {
      localStorage.setItem("imagemBase64", URL.createObjectURL(file));
      localStorage.setItem("imagemProcessada", "data:image/png;base64," + data.imagem_processada);
      
      if (data.area_foliar) {
        localStorage.setItem("areaFoliar", data.area_foliar);
      }

      console.log("Imagem processada recebida do servidor!");
      app.views.main.router.navigate('/results/');
    } else {
      alert("Erro no processamento da imagem!");
    }
  })
  .catch(error => {
    app.dialog.close();
    console.error("Erro ao enviar imagem:", error);
    alert("Erro ao conectar ao servidor!");
  });
}

// FUNÇÃO PARA EXIBIR OS RESULTADOS NA PÁGINA DE RESULTADOS
function mostrarResultados() {
  let imgOriginal = document.getElementById("imagemOriginal");
  let imgProcessada = document.getElementById("imagemProcessada");
  let textEl = document.getElementById("areaFolha");

  let imagemBase64 = localStorage.getItem("imagemBase64");
  let imagemProcessada = localStorage.getItem("imagemProcessada");
  let areaFoliar = localStorage.getItem("areaFoliar");

  if (imagemBase64) {
    imgOriginal.src = imagemBase64;
    imgOriginal.style.display = "block"; 
  } else {
    imgOriginal.style.display = "none";
  }

  if (imagemProcessada) {
    imgProcessada.src = imagemProcessada;
    imgProcessada.style.display = "block"; 
  } else {
    imgProcessada.style.display = "none";
  }

  if (imagemBase64 && imagemProcessada) {
    if (areaFoliar) {
      textEl.innerText = "Processamento concluído!\nÁrea Foliar: " + parseFloat(areaFoliar).toFixed(2) + " cm²";
    } else {
      textEl.innerText = "Processamento concluído!";
    }
  } else {
    textEl.innerText = "Erro ao carregar as imagens!";
  }
}
