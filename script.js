/* ---------------------------
   CRIAR USUÁRIO PADRÃO GERENTE
----------------------------*/
if (!localStorage.getItem("funcionarios")) {
    localStorage.setItem("funcionarios", JSON.stringify([
        {
            codigo: "1",
            nome: "Gerente Admin",
            nascimento: "1990-01-01",
            telefone: "000000000",
            endereco: "Empresa",
            cargo: "Gerente de RH",
            tipo: "gerente",
            login: "admin",
            senha: "123"
        }
    ]));
}

/* ---------------------------
   LOGIN
----------------------------*/
document.getElementById("formLogin")?.addEventListener("submit", function(e) {
    e.preventDefault();
    let user = login_user.value;
    let senha = login_senha.value;
    let funcionarios = JSON.parse(localStorage.getItem("funcionarios") || "[]");
    let encontrado = funcionarios.find(f => f.login === user && f.senha === senha);

    if (!encontrado) { alert("Usuário ou senha incorretos!"); return; }

    localStorage.setItem("usuarioLogado", JSON.stringify(encontrado));
    window.location.href = "dashboard.html";
});

/* ---------------------------
   PAINEL
----------------------------*/
if (window.location.pathname.includes("dashboard.html")) {
    let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) window.location.href = "index.html";

    if (usuario.tipo === "gerente") {
        document.getElementById("menuGerente").style.display = "flex";
    } else {
        document.getElementById("menuFuncionario").style.display = "flex";
        mostrar("meusDados");
        carregarMeusDados();
    }
}

/* ---------------------------
   LOGOUT
----------------------------*/
function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
}

/* ---------------------------
   MOSTRAR SEÇÕES
----------------------------*/
function mostrar(secao) {
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    document.getElementById(secao).classList.add("active");
}

/* ---------------------------
   CADASTRO DE FUNCIONÁRIO (GERENTE)
----------------------------*/
document.getElementById("formCadastro")?.addEventListener("submit", function(e) {
    e.preventDefault();

    let funcionario = {
        codigo: codigo.value,
        nome: nome.value,
        nascimento: nascimento.value,
        telefone: telefone.value,
        endereco: endereco.value,
        cargo: cargo.value,
        tipo: tipo.value,
        login: login.value,
        senha: senha.value
    };

    let funcionarios = JSON.parse(localStorage.getItem("funcionarios") || "[]");
    funcionarios.push(funcionario);
    localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
    alert("Funcionário cadastrado com sucesso!");
    this.reset();
});

/* ---------------------------
   CARREGAR MEUS DADOS (FUNCIONÁRIO)
----------------------------*/
function carregarMeusDados() {
    let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    document.getElementById("dadosFuncionario").innerHTML = `
        <p><b>Código:</b> ${usuario.codigo}</p>
        <p><b>Nome:</b> ${usuario.nome}</p>
        <p><b>Nascimento:</b> ${usuario.nascimento}</p>
        <p><b>Telefone:</b> ${usuario.telefone}</p>
        <p><b>Endereço:</b> ${usuario.endereco}</p>
        <p><b>Cargo:</b> ${usuario.cargo}</p>
    `;
    document.getElementById("edit_telefone").value = usuario.telefone;
    document.getElementById("edit_endereco").value = usuario.endereco;
}

/* ---------------------------
   ATUALIZAR DADOS (FUNCIONÁRIO)
----------------------------*/
document.getElementById("formAtualizar")?.addEventListener("submit", function(e) {
    e.preventDefault();
    let usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    let funcionarios = JSON.parse(localStorage.getItem("funcionarios"));
    let index = funcionarios.findIndex(f => f.codigo == usuario.codigo);

    funcionarios[index].telefone = edit_telefone.value;
    funcionarios[index].endereco = edit_endereco.value;

    localStorage.setItem("funcionarios", JSON.stringify(funcionarios));
    localStorage.setItem("usuarioLogado", JSON.stringify(funcionarios[index]));

    alert("Dados atualizados!");
    carregarMeusDados();
});

/* ---------------------------
   HOLERITE (GERENTE)
----------------------------*/
document.getElementById("formHolerite")?.addEventListener("submit", function(e) {
    e.preventDefault();

    let codigo = holerite_codigo.value;
    let funcionarios = JSON.parse(localStorage.getItem("funcionarios"));
    let func = funcionarios.find(f => f.codigo === codigo);
    if (!func) { alert("Funcionário não encontrado!"); return; }

    let salario = Number(holerite_salario.value);
    let vt = Number(holerite_vt.value)/100;
    let inss = salario * 0.08;
    let irrf = salario * 0.075;
    let desconto_vt = salario * vt;
    let liquido = salario - inss - irrf - desconto_vt;

    document.getElementById("resultado_holerite").innerHTML = `
        <h3>Holerite - ${func.nome}</h3>
        <p><b>Salário Bruto:</b> R$ ${salario.toFixed(2)}</p>
        <p><b>INSS:</b> R$ ${inss.toFixed(2)}</p>
        <p><b>IRRF:</b> R$ ${irrf.toFixed(2)}</p>
        <p><b>Vale-Transporte:</b> R$ ${desconto_vt.toFixed(2)}</p>
        <hr>
        <p><b>Salário Líquido:</b> R$ ${liquido.toFixed(2)}</p>
    `;
});

/* ---------------------------
   RESCISÃO (GERENTE)
----------------------------*/
document.getElementById("formRescisao")?.addEventListener("submit", function(e) {
    e.preventDefault();

    let codigo = res_codigo.value;
    let funcionarios = JSON.parse(localStorage.getItem("funcionarios"));
    let func = funcionarios.find(f => f.codigo === codigo);
    if (!func) { alert("Funcionário não encontrado!"); return; }

    let salario = Number(res_salario.value);
    let adm = new Date(res_adm.value);
    let dem = new Date(res_dem.value);

    let meses = (dem.getFullYear() - adm.getFullYear()) * 12 + (dem.getMonth() - adm.getMonth()) + 1;

    let decimo = (salario / 12) * meses;
    let ferias = (salario / 12) * meses;
    let terco = ferias / 3;
    let multaFGTS = salario * 0.4;

    let total = decimo + ferias + terco + multaFGTS;

    document.getElementById("resultado_rescisao").innerHTML = `
        <h3>Rescisão - ${func.nome}</h3>
        <p><b>13º proporcional:</b> R$ ${decimo.toFixed(2)}</p>
        <p><b>Férias proporcionais:</b> R$ ${ferias.toFixed(2)}</p>
        <p><b>1/3 de Férias:</b> R$ ${terco.toFixed(2)}</p>
        <p><b>Multa FGTS (40%):</b> R$ ${multaFGTS.toFixed(2)}</p>
        <hr>
        <p><b>Total a receber:</b> R$ ${total.toFixed(2)}</p>
    `;
});
