'use strict';
// ============================================================
// 📊 DADOS DOS JOGOS - Copa do Mundo 2026
// ============================================================

const groupMatches = [
    { id:1, group:"A", home:"🇲🇽 México", away:"🇿🇦 África do Sul", date:"11/06", time:"16:00" },
    { id:2, group:"A", home:"🇰🇷 Coreia do Sul", away:"🇨🇿 Rep. Tcheca", date:"11/06", time:"22:00" },
    { id:3, group:"A", home:"🇨🇿 Rep. Tcheca", away:"🇿🇦 África do Sul", date:"18/06", time:"13:00" },
    { id:4, group:"A", home:"🇲🇽 México", away:"🇰🇷 Coreia do Sul", date:"18/06", time:"22:00" },
    { id:5, group:"A", home:"🇨🇿 Rep. Tcheca", away:"🇲🇽 México", date:"24/06", time:"22:00" },
    { id:6, group:"A", home:"🇿🇦 África do Sul", away:"🇰🇷 Coreia do Sul", date:"24/06", time:"22:00" },
    { id:7, group:"B", home:"🇨🇦 Canadá", away:"🇧🇦 Bósnia", date:"12/06", time:"16:00" },
    { id:8, group:"B", home:"🇶🇦 Catar", away:"🇨🇭 Suíça", date:"13/06", time:"16:00" },
    { id:9, group:"B", home:"🇨🇭 Suíça", away:"🇧🇦 Bósnia", date:"18/06", time:"16:00" },
    { id:10, group:"B", home:"🇨🇦 Canadá", away:"🇶🇦 Catar", date:"18/06", time:"19:00" },
    { id:11, group:"B", home:"🇨🇭 Suíça", away:"🇨🇦 Canadá", date:"24/06", time:"16:00" },
    { id:12, group:"B", home:"🇧🇦 Bósnia", away:"🇶🇦 Catar", date:"24/06", time:"16:00" },
    { id:13, group:"C", home:"🇧🇷 Brasil", away:"🇲🇦 Marrocos", date:"13/06", time:"19:00" },
    { id:14, group:"C", home:"🇭🇹 Haiti", away:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia", date:"13/06", time:"22:00" },
    { id:15, group:"C", home:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia", away:"🇲🇦 Marrocos", date:"19/06", time:"19:00" },
    { id:16, group:"C", home:"🇧🇷 Brasil", away:"🇭🇹 Haiti", date:"19/06", time:"21:30" },
    { id:17, group:"C", home:"🏴󠁧󠁢󠁳󠁣󠁴󠁿 Escócia", away:"🇧🇷 Brasil", date:"24/06", time:"19:00" },
    { id:18, group:"C", home:"🇲🇦 Marrocos", away:"🇭🇹 Haiti", date:"24/06", time:"19:00" },
    { id:19, group:"D", home:"🇺🇸 EUA", away:"🇵🇾 Paraguai", date:"12/06", time:"22:00" },
    { id:20, group:"D", home:"🇦🇺 Austrália", away:"🇹🇷 Turquia", date:"14/06", time:"01:00" },
    { id:21, group:"D", home:"🇺🇸 EUA", away:"🇦🇺 Austrália", date:"19/06", time:"16:00" },
    { id:22, group:"D", home:"🇹🇷 Turquia", away:"🇵🇾 Paraguai", date:"19/06", time:"00:00" },
    { id:23, group:"D", home:"🇹🇷 Turquia", away:"🇺🇸 EUA", date:"25/06", time:"23:00" },
    { id:24, group:"D", home:"🇵🇾 Paraguai", away:"🇦🇺 Austrália", date:"25/06", time:"23:00" },
    { id:25, group:"E", home:"🇩🇪 Alemanha", away:"🇨🇼 Curaçao", date:"14/06", time:"14:00" },
    { id:26, group:"E", home:"🇨🇮 C. Marfim", away:"🇪🇨 Equador", date:"14/06", time:"20:00" },
    { id:27, group:"E", home:"🇩🇪 Alemanha", away:"🇨🇮 C. Marfim", date:"20/06", time:"17:00" },
    { id:28, group:"E", home:"🇪🇨 Equador", away:"🇨🇼 Curaçao", date:"20/06", time:"21:00" },
    { id:29, group:"E", home:"🇨🇼 Curaçao", away:"🇨🇮 C. Marfim", date:"25/06", time:"17:00" },
    { id:30, group:"E", home:"🇪🇨 Equador", away:"🇩🇪 Alemanha", date:"25/06", time:"17:00" },
    { id:31, group:"F", home:"🇳🇱 Holanda", away:"🇯🇵 Japão", date:"14/06", time:"17:00" },
    { id:32, group:"F", home:"🇸🇪 Suécia", away:"🇹🇳 Tunísia", date:"14/06", time:"23:00" },
    { id:33, group:"F", home:"🇳🇱 Holanda", away:"🇸🇪 Suécia", date:"20/06", time:"14:00" },
    { id:34, group:"F", home:"🇹🇳 Tunísia", away:"🇯🇵 Japão", date:"20/06", time:"01:00" },
    { id:35, group:"F", home:"🇯🇵 Japão", away:"🇸🇪 Suécia", date:"25/06", time:"20:00" },
    { id:36, group:"F", home:"🇹🇳 Tunísia", away:"🇳🇱 Holanda", date:"25/06", time:"20:00" },
    { id:37, group:"G", home:"🇧🇪 Bélgica", away:"🇪🇬 Egito", date:"15/06", time:"16:00" },
    { id:38, group:"G", home:"🇮🇷 Irã", away:"🇳🇿 N. Zelândia", date:"15/06", time:"22:00" },
    { id:39, group:"G", home:"🇧🇪 Bélgica", away:"🇮🇷 Irã", date:"21/06", time:"16:00" },
    { id:40, group:"G", home:"🇳🇿 N. Zelândia", away:"🇪🇬 Egito", date:"21/06", time:"22:00" },
    { id:41, group:"G", home:"🇪🇬 Egito", away:"🇮🇷 Irã", date:"26/06", time:"00:00" },
    { id:42, group:"G", home:"🇳🇿 N. Zelândia", away:"🇧🇪 Bélgica", date:"26/06", time:"00:00" },
    { id:43, group:"H", home:"🇪🇸 Espanha", away:"🇨🇻 Cabo Verde", date:"15/06", time:"13:00" },
    { id:44, group:"H", home:"🇸🇦 A. Saudita", away:"🇺🇾 Uruguai", date:"15/06", time:"19:00" },
    { id:45, group:"H", home:"🇪🇸 Espanha", away:"🇸🇦 A. Saudita", date:"21/06", time:"13:00" },
    { id:46, group:"H", home:"🇺🇾 Uruguai", away:"🇨🇻 Cabo Verde", date:"21/06", time:"19:00" },
    { id:47, group:"H", home:"🇨🇻 Cabo Verde", away:"🇸🇦 A. Saudita", date:"26/06", time:"21:00" },
    { id:48, group:"H", home:"🇺🇾 Uruguai", away:"🇪🇸 Espanha", date:"26/06", time:"21:00" },
    { id:49, group:"I", home:"🇫🇷 França", away:"🇸🇳 Senegal", date:"16/06", time:"16:00" },
    { id:50, group:"I", home:"🇮🇶 Iraque", away:"🇳🇴 Noruega", date:"16/06", time:"19:00" },
    { id:51, group:"I", home:"🇫🇷 França", away:"🇮🇶 Iraque", date:"22/06", time:"18:00" },
    { id:52, group:"I", home:"🇳🇴 Noruega", away:"🇸🇳 Senegal", date:"22/06", time:"21:00" },
    { id:53, group:"I", home:"🇳🇴 Noruega", away:"🇫🇷 França", date:"26/06", time:"16:00" },
    { id:54, group:"I", home:"🇸🇳 Senegal", away:"🇮🇶 Iraque", date:"26/06", time:"16:00" },
    { id:55, group:"J", home:"🇦🇷 Argentina", away:"🇩🇿 Argélia", date:"16/06", time:"22:00" },
    { id:56, group:"J", home:"🇦🇹 Áustria", away:"🇯🇴 Jordânia", date:"16/06", time:"01:00" },
    { id:57, group:"J", home:"🇦🇷 Argentina", away:"🇦🇹 Áustria", date:"22/06", time:"14:00" },
    { id:58, group:"J", home:"🇯🇴 Jordânia", away:"🇩🇿 Argélia", date:"22/06", time:"00:00" },
    { id:59, group:"J", home:"🇩🇿 Argélia", away:"🇦🇹 Áustria", date:"27/06", time:"23:00" },
    { id:60, group:"J", home:"🇯🇴 Jordânia", away:"🇦🇷 Argentina", date:"27/06", time:"23:00" },
    { id:61, group:"K", home:"🇵🇹 Portugal", away:"🇨🇩 RD Congo", date:"17/06", time:"14:00" },
    { id:62, group:"K", home:"🇺🇿 Uzbequistão", away:"🇨🇴 Colômbia", date:"17/06", time:"23:00" },
    { id:63, group:"K", home:"🇵🇹 Portugal", away:"🇺🇿 Uzbequistão", date:"23/06", time:"14:00" },
    { id:64, group:"K", home:"🇨🇴 Colômbia", away:"🇨🇩 RD Congo", date:"23/06", time:"23:00" },
    { id:65, group:"K", home:"🇨🇴 Colômbia", away:"🇵🇹 Portugal", date:"27/06", time:"20:30" },
    { id:66, group:"K", home:"🇨🇩 RD Congo", away:"🇺🇿 Uzbequistão", date:"27/06", time:"20:30" },
    { id:67, group:"L", home:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", away:"🇭🇷 Croácia", date:"17/06", time:"17:00" },
    { id:68, group:"L", home:"🇬🇭 Gana", away:"🇵🇦 Panamá", date:"17/06", time:"20:00" },
    { id:69, group:"L", home:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", away:"🇬🇭 Gana", date:"23/06", time:"17:00" },
    { id:70, group:"L", home:"🇵🇦 Panamá", away:"🇭🇷 Croácia", date:"23/06", time:"20:00" },
    { id:71, group:"L", home:"🇵🇦 Panamá", away:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", date:"27/06", time:"18:00" },
    { id:72, group:"L", home:"🇭🇷 Croácia", away:"🇬🇭 Gana", date:"27/06", time:"18:00" },
];

// Jogos do mata-mata
const knockoutMatches = [
    // Rodada de 32
    { id:73, phase:"32avos", home:"🇿🇦 África do Sul", away:"🇨🇦 Canadá", date:"28/06", time:"16:00", num:1 },
    { id:74, phase:"32avos", home:"🇩🇪 Alemanha", away:"🇵🇾 Paraguai", date:"29/06", time:"17:30", num:2 },
    { id:75, phase:"32avos", home:"🇳🇱 Holanda", away:"🇲🇦 Marrocos", date:"29/06", time:"22:00", num:3 },
    { id:76, phase:"32avos", home:"🇧🇷 Brasil", away:"🇯🇵 Japão", date:"29/06", time:"14:00", num:4 },
    { id:77, phase:"32avos", home:"🇫🇷 França", away:"🇸🇪 Suécia", date:"30/06", time:"18:00", num:5 },
    { id:78, phase:"32avos", home:"🇨🇮 C. Marfim", away:"🇳🇴 Noruega", date:"30/06", time:"14:00", num:6 },
    { id:79, phase:"32avos", home:"🇲🇽 México", away:"🇪🇨 Equador", date:"30/06", time:"22:00", num:7 },
    { id:80, phase:"32avos", home:"🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra", away:"🇨🇩 RD Congo", date:"01/07", time:"13:00", num:8 },
    { id:81, phase:"32avos", home:"🇺🇸 EUA", away:"🇧🇦 Bósnia", date:"01/07", time:"21:00", num:9 },
    { id:82, phase:"32avos", home:"🇧🇪 Bélgica", away:"🇸🇳 Senegal", date:"01/07", time:"17:00", num:10 },
    { id:83, phase:"32avos", home:"🇵🇹 Portugal", away:"🇭🇷 Croácia", date:"02/07", time:"20:00", num:11 },
    { id:84, phase:"32avos", home:"🇪🇸 Espanha", away:"🇦🇹 Áustria", date:"02/07", time:"16:00", num:12 },
    { id:85, phase:"32avos", home:"🇨🇭 Suíça", away:"🇩🇿 Argélia", date:"02/07", time:"22:00", num:13 },
    { id:86, phase:"32avos", home:"🇦🇷 Argentina", away:"🇨🇻 Cabo Verde", date:"03/07", time:"19:00", num:14 },
    { id:87, phase:"32avos", home:"🇨🇴 Colômbia", away:"🇬🇭 Gana", date:"03/07", time:"22:30", num:15 },
    { id:88, phase:"32avos", home:"🇦🇺 Austrália", away:"🇪🇬 Egito", date:"03/07", time:"15:00", num:16 },
    // Oitavas de final
    { id:89, phase:"oitavas", home:"Venc. J74", away:"Venc. J77", date:"04/07", time:"18:00", num:1 },
    { id:90, phase:"oitavas", home:"Venc. J73", away:"Venc. J75", date:"04/07", time:"14:00", num:2 },
    { id:91, phase:"oitavas", home:"Venc. J76", away:"Venc. J78", date:"05/07", time:"17:00", num:3 },
    { id:92, phase:"oitavas", home:"Venc. J79", away:"Venc. J80", date:"05/07", time:"21:00", num:4 },
    { id:93, phase:"oitavas", home:"Venc. J83", away:"Venc. J84", date:"06/07", time:"16:00", num:5 },
    { id:94, phase:"oitavas", home:"Venc. J81", away:"Venc. J82", date:"06/07", time:"21:00", num:6 },
    { id:95, phase:"oitavas", home:"Venc. J86", away:"Venc. J88", date:"07/07", time:"13:00", num:7 },
    { id:96, phase:"oitavas", home:"Venc. J85", away:"Venc. J87", date:"07/07", time:"17:00", num:8 },
    // Quartas
    { id:97, phase:"quartas", home:"Venc. J89", away:"Venc. J90", date:"09/07", time:"17:00", num:1 },
    { id:98, phase:"quartas", home:"Venc. J93", away:"Venc. J94", date:"10/07", time:"16:00", num:2 },
    { id:99, phase:"quartas", home:"Venc. J91", away:"Venc. J92", date:"11/07", time:"18:00", num:3 },
    { id:100, phase:"quartas", home:"Venc. J95", away:"Venc. J96", date:"11/07", time:"22:00", num:4 },
    // Semifinais
    { id:101, phase:"semi", home:"Venc. J97", away:"Venc. J98", date:"14/07", time:"16:00", num:1 },
    { id:102, phase:"semi", home:"Venc. J99", away:"Venc. J100", date:"15/07", time:"16:00", num:2 },
    // Terceiro lugar
    { id:103, phase:"terceiro", home:"Perd. J101", away:"Perd. J102", date:"18/07", time:"18:00", num:1 },
    // Final
    { id:104, phase:"final", home:"Venc. J101", away:"Venc. J102", date:"19/07", time:"16:00", num:1 },
];

const allMatches = [...groupMatches, ...knockoutMatches];

const phaseNames = {
    "32avos": "🏟️ Rodada de 32",
    "oitavas": "⚔️ Oitavas de Final",
    "quartas": "🔥 Quartas de Final",
    "semi": "💥 Semifinais",
    "terceiro": "🥉 Disputa de 3º Lugar",
    "final": "🏆 FINAL"
};

const MESES = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

// Mapa de dependências: qual jogo alimenta qual próximo jogo
const advanceMap = {
    // 32avos → oitavas
    74: { next: 89, slot: 'home' }, 77: { next: 89, slot: 'away' },
    73: { next: 90, slot: 'home' }, 75: { next: 90, slot: 'away' },
    76: { next: 91, slot: 'home' }, 78: { next: 91, slot: 'away' },
    79: { next: 92, slot: 'home' }, 80: { next: 92, slot: 'away' },
    83: { next: 93, slot: 'home' }, 84: { next: 93, slot: 'away' },
    81: { next: 94, slot: 'home' }, 82: { next: 94, slot: 'away' },
    86: { next: 95, slot: 'home' }, 88: { next: 95, slot: 'away' },
    85: { next: 96, slot: 'home' }, 87: { next: 96, slot: 'away' },
    // oitavas → quartas
    89: { next: 97, slot: 'home' }, 90: { next: 97, slot: 'away' },
    93: { next: 98, slot: 'home' }, 94: { next: 98, slot: 'away' },
    91: { next: 99, slot: 'home' }, 92: { next: 99, slot: 'away' },
    95: { next: 100, slot: 'home' }, 96: { next: 100, slot: 'away' },
    // quartas → semi
    97: { next: 101, slot: 'home' }, 98: { next: 101, slot: 'away' },
    99: { next: 102, slot: 'home' }, 100: { next: 102, slot: 'away' },
    // semi → final + 3º lugar
    101: { nextWin: 104, slotWin: 'home', nextLose: 103, slotLose: 'home' },
    102: { nextWin: 104, slotWin: 'away', nextLose: 103, slotLose: 'away' },
};
