// Configuração 
const WHATSAPP_NUMBER = "5541988759342";
const WEB3FORMS_KEY = "64f49236-2e85-4c0d-acab-4f7ec4b5adda";

// Se o e-mail e o banco estiverem vazios, o formulário abre o WhatsApp com a mensagem pronta.

// Banco de dados (Supabase). Veja o passo a passo no arquivo supabase.sql.
// Cole aqui o "Project URL" e a chave "anon public" do seu projeto Supabase.
// A chave anon é pública por natureza; a segurança vem das regras do banco (RLS) criadas no supabase.sql,
// que permitem apenas INSERIR pedidos, nunca ler os dados de outras pessoas.
const SUPABASE_URL = "https://xbhjpmitdkzuxtfewhsk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_m4iGTYym53XyhUSOu9GLKg_PSZHiN2V";
// ===== Menu mobile =====
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});
menu.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  })
);

// ===== Ano no rodapé =====
document.getElementById("ano").textContent = new Date().getFullYear();

// ===== Animação de entrada ao rolar =====
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("visible"));
}

// ===== Conversa animada do hero =====
const heroMsgs = document.querySelectorAll("#heroChat .msg");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
heroMsgs.forEach((msg, i) => {
  if (reduceMotion) return;
  setTimeout(() => {
    msg.style.opacity = "1";
    msg.style.animation = "pop .35s ease both";
  }, 600 + i * 900);
});

// ===== Demonstração interativa do chatbot =====
const demoChat = document.getElementById("demoChat");
const demoOptions = document.getElementById("demoOptions");

const flow = {
  start: {
    bot: "Olá! 👋 Sou o assistente da Atenflux. O que você gostaria de fazer?",
    options: [
      { label: "Agendar horário", next: "dia" },
      { label: "Ver serviços", next: "servicos" },
    ],
  },
  servicos: {
    bot: "Aqui você apresenta seus serviços, valores e duração. Quer agendar um deles?",
    options: [{ label: "Sim, agendar", next: "dia" }],
  },
  dia: {
    bot: "Perfeito! Para qual dia?",
    options: [
      { label: "Amanhã", next: "hora" },
      { label: "Quinta-feira", next: "hora" },
      { label: "Sexta-feira", next: "hora" },
    ],
  },
  hora: {
    bot: "Tenho estes horários livres:",
    options: [
      { label: "10h", next: "fim" },
      { label: "14h30", next: "fim" },
      { label: "16h", next: "fim" },
    ],
  },
  fim: {
    bot: "✅ Agendamento confirmado! Vou te enviar um lembrete antes do horário. Até lá!",
    ok: true,
    options: [{ label: "Recomeçar", next: "start", reset: true }],
  },
};

function addMsg(text, type, extra = "") {
  const div = document.createElement("div");
  div.className = `msg ${type} ${extra}`.trim();
  div.textContent = text;
  demoChat.appendChild(div);
  demoChat.scrollTop = demoChat.scrollHeight;
}

function showStep(key) {
  const step = flow[key];
  demoOptions.innerHTML = "";
  setTimeout(() => {
    addMsg(step.bot, "in", step.ok ? "ok" : "");
    step.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "opt";
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        if (opt.reset) demoChat.innerHTML = "";
        else addMsg(opt.label, "out");
        showStep(opt.next);
      });
      demoOptions.appendChild(btn);
    });
  }, 450);
}

showStep("start");

// ===== Planos -> pré-seleciona no formulário =====
const form = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

document.querySelectorAll("[data-plan]").forEach((el) =>
  el.addEventListener("click", () => {
    form.elements.plano.value = el.dataset.plan;
  })
);

// ===== Agendamento =====
// Data mínima: hoje (no fuso do visitante)
function hojeISO() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
form.elements.data.min = hojeISO();

function setStatus(msg, type) {
  formStatus.className = `form-status ${type || ""}`.trim();
  formStatus.innerHTML = "";
  if (typeof msg === "string") formStatus.textContent = msg;
  else formStatus.appendChild(msg);
}

function abrirWhatsApp(texto) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
  window.open(url, "_blank", "noopener");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(form).entries());
  Object.keys(v).forEach((k) => (v[k] = String(v[k]).trim()));

  // Validação
  if (!v.nome) return erro("Por favor, informe seu nome.", "nome");
  if (v.whatsapp.replace(/\D/g, "").length < 10) return erro("Informe um WhatsApp válido, com DDD.", "whatsapp");
  if (v.email && !/^\S+@\S+\.\S+$/.test(v.email)) return erro("Esse e-mail parece inválido.", "email");
  if (!v.data) return erro("Escolha o dia preferido.", "data");

  const dia = new Date(`${v.data}T00:00:00`);
  const diaSemana = dia.getDay();
  if (v.data < hojeISO()) return erro("Escolha uma data a partir de hoje.", "data");
  if (diaSemana === 0 || diaSemana === 6) return erro("Atendemos de segunda a sexta. Escolha um dia útil.", "data");
  if (!v.horario) return erro("Escolha um horário.", "horario");

  function erro(msg, campo) {
    setStatus(msg, "error");
    if (campo) form.elements[campo].focus();
  }

  const dataBR = dia.toLocaleDateString("pt-BR");
  let texto = `Olá! Me chamo ${v.nome} e gostaria de agendar uma conversa sobre a Atenflux.`;
  texto += `\n\nDia: ${dataBR}\nHorário: ${v.horario}\nPlano de interesse: ${v.plano}`;
  if (v.negocio) texto += `\nNegócio: ${v.negocio}`;
  if (v.mensagem) texto += `\n\n${v.mensagem}`;

  // Nada configurado: abre o WhatsApp com a mensagem pronta
  const temBanco = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
  const temEmail = Boolean(WEB3FORMS_KEY);
  if (!temBanco && !temEmail) {
    abrirWhatsApp(texto);
    setStatus("Abrindo o WhatsApp com seu pedido pronto. É só enviar!", "ok");
    return;
  }

  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true;
  setStatus("Enviando...", "");

  // 1) Salva no banco de dados
  const salvarNoBanco = () =>
    fetch(`${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/agendamentos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        nome: v.nome,
        whatsapp: v.whatsapp,
        email: v.email || null,
        negocio: v.negocio || null,
        plano: v.plano,
        data_preferida: v.data,
        horario: v.horario,
        mensagem: v.mensagem || null,
      }),
    }).then((r) => {
      if (!r.ok) throw new Error("banco");
    });

  // 2) Avisa por e-mail (Web3Forms)
  const avisarPorEmail = () =>
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: `Novo pedido de agendamento: ${v.nome} (${v.plano})`,
        from_name: "Site Atenflux",
        nome: v.nome,
        whatsapp: v.whatsapp,
        email: v.email || undefined, // se preenchido, vira o "responder para" do e-mail
        negocio: v.negocio,
        plano: v.plano,
        dia: dataBR,
        horario: v.horario,
        mensagem: v.mensagem,
      }),
    }).then(async (r) => {
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j.success === false) throw new Error("email");
    });

  const tarefas = [];
  if (temBanco) tarefas.push(salvarNoBanco());
  if (temEmail) tarefas.push(avisarPorEmail());
  const resultados = await Promise.allSettled(tarefas);
  btn.disabled = false;

  // Basta um dos dois ter funcionado para o pedido não se perder
  if (resultados.some((r) => r.status === "fulfilled")) {
    const aviso = document.createElement("span");
    aviso.append("Pedido enviado! Entraremos em contato para confirmar. ");
    const link = document.createElement("a");
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(texto)}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "Quer adiantar pelo WhatsApp?";
    aviso.appendChild(link);
    setStatus(aviso, "ok");
    form.reset();
    form.elements.data.min = hojeISO();
  } else {
    setStatus("Não conseguimos enviar agora. Abrindo o WhatsApp para você.", "error");
    abrirWhatsApp(texto);
  }
});
