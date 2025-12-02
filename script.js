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
   CADASTRO DE FUNCIONÁRIO
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
   CARREGAR MEUS DADOS
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
   ATUALIZAR DADOS
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
/* ------------------------------------------------
   HOLERITE – CÁLCULOS CORRETOS
--------------------------------------------------*/
document.getElementById("formHolerite")?.addEventListener("submit", function(e) {
    e.preventDefault();

    let codigo = holerite_codigo.value;
    let funcionarios = JSON.parse(localStorage.getItem("funcionarios"));
    let func = funcionarios.find(f => f.codigo === codigo);

    if (!func) { alert("Funcionário não encontrado!"); return; }

    let salario = Number(holerite_salario.value);
    let vt = Number(holerite_vt.value) / 100;

    /* --- INSS tabela progressiva atualizada --- */
    function calcINSS(sal) {
        if (sal <= 1412) return sal * 0.075;
        else if (sal <= 2666.68) return 1412 * 0.075 + (sal - 1412) * 0.09;
        else if (sal <= 4000.03) return 1412 * 0.075 + (2666.68 - 1412) * 0.09 + (sal - 2666.68) * 0.12;
        else return 1412 * 0.075 + (2666.68 - 1412) * 0.09 + (4000.03 - 2666.68) * 0.12 + (sal - 4000.03) * 0.14;
    }

    /* --- IRRF progressivo --- */
    function calcIRRF(bruto, inss) {
        let base = bruto - inss;
        if (base <= 2112) return 0;
        else if (base <= 2826.65) return base * 0.075 - 158.40;
        else if (base <= 3751.05) return base * 0.15 - 370.40;
        else if (base <= 4664.68) return base * 0.225 - 651.73;
        else return base * 0.275 - 884.96;
    }

    let inss = calcINSS(salario);
    let irrf = calcIRRF(salario, inss);
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

/* ------------------------------------------------
   RESCISÃO – CÁLCULO CORRIGIDO (REGRAS OFICIAIS)
--------------------------------------------------*/
document.getElementById("formRescisao")?.addEventListener("submit", function(e) {
    e.preventDefault();

    let codigo = res_codigo.value;
    let funcionarios = JSON.parse(localStorage.getItem("funcionarios"));
    let func = funcionarios.find(f => f.codigo === codigo);

    if (!func) { alert("Funcionário não encontrado!"); return; }

    let salario = Number(res_salario.value);
    let adm = new Date(res_adm.value);
    let dem = new Date(res_dem.value);

    /* --- Saldo de salário (dias trabalhados no mês) --- */
    let diasTrabalhados = dem.getDate();
    let saldoSalario = (salario / 30) * diasTrabalhados;

    /* --- Aviso prévio proporcional real --- */
    let anosCompletos = dem.getFullYear() - adm.getFullYear();
    let avisoDias = 30 + anosCompletos * 3;
    if (avisoDias > 90) avisoDias = 90;

    let avisoValor = (salario / 30) * avisoDias;

    /* --- 13º proporcional --- */
    let mesesAno = dem.getMonth() + 1;
    if (dem.getDate() < 15) mesesAno -= 1;
    let decimo = (salario / 12) * mesesAno;

    /* --- Férias vencidas reais (um período por ano completo trabalhado) --- */
    let feriasVencidas = 0;
    let periodosCompletos = anosCompletos; 

    for (let i = 0; i < periodosCompletos; i++) {
        feriasVencidas += salario + salario / 3;
    }

    /* --- Férias proporcionais --- */
    let mesesFerias = mesesAno;
    let feriasProp = (salario / 12) * mesesFerias;
    let feriasTerco = feriasProp / 3;

    /* --- FGTS acumulado + multa 40% --- */
    let mesesTotais =
        (dem.getFullYear() - adm.getFullYear()) * 12 +
        (dem.getMonth() - adm.getMonth());

    let fgtsAcumulado = mesesTotais * (salario * 0.08);
    let multaFGTS = (fgtsAcumulado * 0.40);

    /* --- TOTAL CORRETO --- */
    let total =
        saldoSalario +
        avisoValor +
        decimo +
        
        feriasProp +
        
        multaFGTS;

    document.getElementById("resultado_rescisao").innerHTML = `
        <h3>Rescisão - ${func.nome}</h3>
        <p><b>Saldo de Salário:</b> R$ ${saldoSalario.toFixed(2)}</p>
        <p><b>Aviso Prévio (${avisoDias} dias):</b> R$ ${avisoValor.toFixed(2)}</p>
        <p><b>13º Proporcional:</b> R$ ${decimo}</p>
        
        <p><b>Férias Proporcionais:</b> R$ ${feriasProp.toFixed(2)}</p>
        
        <p><b>Multa FGTS (40%):</b> R$ ${multaFGTS.toFixed(2)}</p>
        <hr>
        <p><b>Total a Receber:</b> R$ ${total}</p>
    `;
});
