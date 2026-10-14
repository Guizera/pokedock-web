import { useEffect, useState, type CSSProperties } from 'react'
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Folder,
  Gamepad2,
  Menu,
  Music2,
  NotebookTabs,
  Settings2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import {
  analyticsConfigured,
  initializeAnalyticsIfConsented,
  readAnalyticsConsent,
  setAnalyticsConsent,
  trackSiteEvent,
  type AnalyticsConsent,
} from './analytics'
import { initialLanguage, translate, type SiteLanguage } from './i18n'

type Translator = (source: string) => string

const themes = [
  { name: 'Pradaria', label: 'Folhas ao vento', sprite: 1, from: '#123e37', to: '#71bd63', effect: 'leaf' },
  { name: 'Elétrico', label: 'Raios e faíscas', sprite: 25, from: '#76501c', to: '#e8ac25', effect: 'bolt' },
  { name: 'Noturno', label: 'Névoa e estrelas', sprite: 94, from: '#211d3e', to: '#7453a1', effect: 'star' },
  { name: 'Oceano', label: 'Ondas suaves', sprite: 7, from: '#0d4361', to: '#45a9c0', effect: 'wave' },
  { name: 'Vulcânico', label: 'Brasas flutuantes', sprite: 4, from: '#632b31', to: '#cf5a2d', effect: 'ember' },
  { name: 'Psíquico', label: 'Orbes luminosas', sprite: 151, from: '#62366d', to: '#ba72c4', effect: 'orb' },
] as const

const questions = [
  {
    question: 'O PokeDock substitui a Dock original do macOS?',
    answer: 'O PokeDock cria uma barra própria, com temas, apps e widgets. Ao ativá-la, o app pode ligar a ocultação automática da Dock original. A Dock do macOS continua disponível ao levar o cursor até a borda da tela.',
  },
  {
    question: 'Preciso ficar com o app aberto?',
    answer: 'Sim. Os encontros são sorteados enquanto o PokeDock está em execução. Você pode pausar as aparições e escolher entre três frequências nas preferências.',
  },
  {
    question: 'O que acontece quando minhas Pokébolas acabam?',
    answer: 'Você começa com 10 Pokébolas. Duas horas após usar a primeira, o estoque volta a 10. Pokémon mais raros são mais difíceis de capturar, e a primeira tentativa falha nunca faz o Pokémon fugir.',
  },
  {
    question: 'Quais permissões o app pode pedir?',
    answer: 'Ao personalizar a barra ou conectar players de música, o macOS pode solicitar acesso de Automação. Esses acessos são pedidos quando você usa as funções correspondentes.',
  },
]

const downloadUrl = import.meta.env.VITE_DOWNLOAD_URL?.trim()
const hasDownload = Boolean(downloadUrl?.startsWith('https://'))

function PokedexMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`pokedex-mark${compact ? ' pokedex-mark--compact' : ''}`} aria-hidden="true">
      <span className="pokedex-mark__lens" />
      <span className="pokedex-mark__light pokedex-mark__light--one" />
      <span className="pokedex-mark__light pokedex-mark__light--two" />
      <span className="pokedex-mark__screen"><span className="pokeball-dot" /></span>
      <span className="pokedex-mark__button" />
    </span>
  )
}

function DownloadLink({ className = '', source, t }: { className?: string; source: string; t: Translator }) {
  if (!hasDownload) {
    return (
      <span className={`download-link download-link--disabled ${className}`} aria-disabled="true" title={t('O link do DMG ainda não foi configurado')}>
        <ArrowDownToLine size={19} aria-hidden="true" /> {t('Link de download em breve')}
      </span>
    )
  }
  return (
    <a
      className={`download-link ${className}`}
      href={downloadUrl}
      onClick={() => { void trackSiteEvent('download_click', { source }) }}
    >
      <ArrowDownToLine size={19} aria-hidden="true" /> {t('Baixar para macOS')} <ArrowRight size={18} aria-hidden="true" />
    </a>
  )
}

function EncounterPreview({ t }: { t: Translator }) {
  return (
    <div className="encounter-shell" aria-label={t('Prévia ilustrativa da tela de encontro do aplicativo')}>
      <div className="encounter-shell__header">
        <span className="tiny-led" />
        <span>POKEDOCK</span>
        <span className="encounter-shell__caption">{t('ENCONTRO SELVAGEM')}</span>
      </div>
      <div className="encounter-bezel">
        <div className="encounter-screen scanlines">
          <div className="encounter-screen__top">
            <div><strong>PIKACHU</strong><small>{t('Nº 025 · INCOMUM')}</small></div>
            <div className="encounter-screen__rate"><small>{t('CAPTURA')}</small><strong>50%</strong></div>
          </div>
          <div className="encounter-screen__sprite"><img src="/pokemon/25.png" alt={t('Sprite de Pikachu')} /></div>
          <div className="encounter-screen__bottom"><span>{t('★ 1ª FALHA: SEM FUGA')}</span><span>05:00</span></div>
        </div>
      </div>
      <div className="encounter-dialogue"><span className="dialogue-caret">▸</span> {t('Um Pokémon selvagem apareceu!')}</div>
      <div className="encounter-actions"><span><span className="pokeball-dot" /> {t('CAPTURAR')}</span><span>{t('FUGIR')}</span></div>
      <div className="encounter-shell__foot"><span>{t('◉ 10/10 POKÉBOLAS')}</span><span>{t('ESTOQUE CHEIO')}</span></div>
    </div>
  )
}

function DockPreview({ theme, t }: { theme: typeof themes[number]; t: Translator }) {
  const dockStyle = { '--dock-a': theme.from, '--dock-b': theme.to } as CSSProperties
  return (
    <div className={`dock-preview dock-preview--${theme.effect}`} style={dockStyle} aria-label={`${t('Prévia da barra no tema')} ${t(theme.name)}`}>
      <span className="dock-preview__orb" aria-hidden="true" />
      <div className="dock-preview__inner">
        <div className="dock-preview__pokedex"><PokedexMark compact /></div>
        <span className="dock-preview__divider" />
        <div className="dock-preview__app dock-preview__app--finder"><Folder size={25} aria-hidden="true" /><small>Finder</small></div>
        <div className="dock-preview__widget"><Clock3 size={19} aria-hidden="true" /><span><small>{t('RELÓGIO')}</small><strong>10:24</strong></span></div>
        <div className="dock-preview__widget dock-preview__widget--dex"><span className="mini-grid">▦</span><span><small>POKÉDEX</small><strong>27/151</strong></span></div>
        <div className="dock-preview__app"><Music2 size={25} aria-hidden="true" /><small>{t('Música')}</small></div>
        <div className="dock-preview__app"><NotebookTabs size={24} aria-hidden="true" /><small>{t('Notas')}</small></div>
        <div className="dock-preview__pokemon"><img src={`/pokemon/${theme.sprite}.png`} alt="" /></div>
      </div>
    </div>
  )
}

function ConsentBanner({ onChoice, t }: { onChoice: (choice: Exclude<AnalyticsConsent, null>) => void; t: Translator }) {
  return (
    <aside className="consent-banner" aria-label={t('Preferência de analytics')}>
      <div className="consent-banner__icon"><ShieldCheck size={22} aria-hidden="true" /></div>
      <div className="consent-banner__copy"><strong>{t('Podemos medir as visitas?')}</strong><p>{t('Usamos Firebase Analytics para entender o uso do site. Ele só começa após sua escolha. Você pode mudar isso no rodapé.')}</p></div>
      <div className="consent-banner__actions">
        <button type="button" className="button button--quiet" onClick={() => onChoice('declined')}>{t('Recusar')}</button>
        <button type="button" className="button button--red" onClick={() => onChoice('accepted')}>{t('Aceitar analytics')}</button>
      </div>
    </aside>
  )
}

function App() {
  const [language, setLanguage] = useState<SiteLanguage>(initialLanguage)
  const t: Translator = (source) => translate(language, source)
  const [activeTheme, setActiveTheme] = useState<(typeof themes)[number]>(themes[0])
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [consent, setConsent] = useState<AnalyticsConsent>(() => readAnalyticsConsent())

  useEffect(() => { void initializeAnalyticsIfConsented() }, [])

  useEffect(() => {
    document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en'
    document.title = language === 'pt' ? 'PokeDock — uma aventura no seu Mac' : 'PokeDock — an adventure on your Mac'
    const description = language === 'pt'
      ? 'PokeDock traz encontros Pokémon, Pokédex e uma barra personalizada com temas e widgets para o seu Mac.'
      : 'PokeDock brings Pokémon encounters, a Pokédex, and a custom bar with themes and widgets to your Mac.'
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
    try { window.localStorage.setItem('pokedock.language.v1', language) } catch { /* Storage is optional. */ }
  }, [language])

  const chooseConsent = (choice: Exclude<AnalyticsConsent, null>) => {
    setConsent(choice)
    void setAnalyticsConsent(choice)
  }

  const chooseTheme = (theme: (typeof themes)[number]) => {
    setActiveTheme(theme)
    void trackSiteEvent('theme_preview', { theme: theme.name.toLowerCase() })
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner container">
          <a className="brand" href="#inicio" aria-label={t('PokeDock, voltar ao início')}><PokedexMark compact /><span>POKEDOCK<small>{t('DOCK + AVENTURA')}</small></span></a>
          <nav className={`site-nav${menuOpen ? ' site-nav--open' : ''}`} aria-label={t('Navegação principal')}>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>{t('Como funciona')}</a>
            <a href="#temas" onClick={() => setMenuOpen(false)}>{t('Temas')}</a>
            <a href="#instalacao" onClick={() => setMenuOpen(false)}>{t('Instalação')}</a>
            <a href="#sobre" onClick={() => setMenuOpen(false)}>{t('Sobre')}</a>
          </nav>
          <a className="header-cta" href="#instalacao">{t('Conhecer o app')} <ArrowRight size={16} aria-hidden="true" /></a>
          <div className="language-switch" role="group" aria-label={language === 'pt' ? 'Idioma do site' : 'Site language'}>
            <button type="button" lang="pt-BR" aria-pressed={language === 'pt'} onClick={() => setLanguage('pt')}>PT</button>
            <button type="button" lang="en" aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button>
          </div>
          <button className="menu-toggle" type="button" aria-label={t(menuOpen ? 'Fechar menu' : 'Abrir menu')} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero__grain" aria-hidden="true" />
          <div className="hero__layout container">
            <div className="hero__copy">
              <div className="eyebrow"><span className="eyebrow__dot" /> {t('UMA NOVA VIDA PARA O SEU DOCK')}</div>
              <h1>{t('Seu Mac.')}<br /><em>{t('Sua aventura.')}</em></h1>
              <p className="hero__lead">{t('Uma barra personalizada que traz encontros Pokémon para a sua rotina. Escolha um tema, organize seus apps e descubra quem apareceu enquanto você trabalha.')}</p>
              <div className="hero__actions"><DownloadLink source="hero" t={t} /><a className="button button--outline" href="#como-funciona">{t('Como funciona')} <ArrowDown size={18} aria-hidden="true" /></a></div>
              <div className="hero__meta"><span><Check size={15} aria-hidden="true" /> {t('151 Pokémon para encontrar')}</span><span><Check size={15} aria-hidden="true" /> {t('Feito para macOS')}</span></div>
            </div>
            <div className="hero__visual"><div className="hero__floating-note">{t('UM ENCONTRO')}<br /><strong>{t('PODE ACONTECER')}<br />{t('A QUALQUER MOMENTO')}</strong></div><EncounterPreview t={t} /><div className="hero__sticker"><Sparkles size={17} aria-hidden="true" /> {t('PRÉVIA DO APP')}</div></div>
          </div>
          <div className="hero__ticker" aria-hidden="true"><div>{t('PERSONALIZE O DOCK')} <span>✦</span> {t('ENCONTRE POKÉMON')} <span>✦</span> {t('COMPLETE A POKÉDEX')} <span>✦</span> {t('PERSONALIZE O DOCK')} <span>✦</span> {t('ENCONTRE POKÉMON')} <span>✦</span> {t('COMPLETE A POKÉDEX')} <span>✦</span></div></div>
        </section>

        <section className="section how" id="como-funciona">
          <div className="container">
            <div className="section-heading"><span className="kicker">{t('01 / O JOGO COMEÇA NO SEU MAC')}</span><h2>{t('Um encontro muda')}<br /><em>{t('o dia inteiro.')}</em></h2><p>{t('O PokeDock transforma pequenos momentos de uso em uma caça que continua no seu ritmo.')}</p></div>
            <div className="step-grid">
              <article className="step-card"><span className="step-card__number">01</span><div className="step-card__art step-card__art--first"><img src="/pokemon/1.png" alt={t('Sprite de Bulbasaur')} /><span className="step-card__signal">!</span></div><h3>{t('Ele apareceu.')}</h3><p>{t('De tempos em tempos, um Pokémon surge no ícone do app. Você decide quando abrir o encontro.')}</p></article>
              <article className="step-card"><span className="step-card__number">02</span><div className="step-card__art step-card__art--second"><div className="step-card__ball"><span className="pokeball-dot" /></div><img src="/pokemon/25.png" alt={t('Sprite de Pikachu')} /></div><h3>{t('É hora de tentar.')}</h3><p>{t('Lance uma Pokébola ou fuja. Raridade e tentativas mudam suas chances; a primeira falha nunca faz o Pokémon fugir.')}</p></article>
              <article className="step-card"><span className="step-card__number">03</span><div className="step-card__art step-card__art--third"><div className="mini-dex"><span>POKÉDEX</span><strong>027<span>/151</span></strong><i>▦ ▦ ▦ ▦</i></div></div><h3>{t('A coleção cresce.')}</h3><p>{t('Veja espécies capturadas, vistas e ainda desconhecidas. Pokémon repetidos também ficam registrados.')}</p></article>
            </div>
            <div className="game-rule"><div className="game-rule__icon"><Gamepad2 size={29} aria-hidden="true" /></div><p><strong>{t('Um pouco de estratégia faz parte.')}</strong> {t('Você começa com 10 Pokébolas. O estoque volta a 10 duas horas depois de usar a primeira.')}</p><span>10 / 10 <span className="pokeball-dot" /></span></div>
          </div>
        </section>

        <section className="section theme-section" id="temas">
          <div className="container">
            <div className="section-heading section-heading--center"><span className="kicker">{t('02 / SUA BARRA, SEU MUNDO')}</span><h2>{t('Escolha sua')}<br /><em>{t('atmosfera.')}</em></h2><p>{t('Seis temas mudam as cores e os efeitos da barra. Escolha um abaixo para explorar a prévia.')}</p></div>
            <div className="theme-stage"><div className="theme-stage__screen scanlines"><div className="theme-stage__top"><span>{t('VISOR DE TEMAS')}</span><span>{t('06 DISPONÍVEIS')}</span></div><DockPreview theme={activeTheme} t={t} /><p><span className="tiny-led" /> {t('TEMA SELECIONADO:')} <strong>{t(activeTheme.name).toLocaleUpperCase(language === 'pt' ? 'pt-BR' : 'en')}</strong> <span className="theme-stage__detail">· {t(activeTheme.label)}</span></p></div></div>
            <div className="theme-options" role="group" aria-label={t('Selecionar tema da prévia')}>{themes.map(theme => <button key={theme.name} type="button" className={`theme-option${activeTheme.name === theme.name ? ' theme-option--active' : ''}`} aria-pressed={activeTheme.name === theme.name} onClick={() => chooseTheme(theme)}><span className="theme-option__swatch" style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}><img src={`/pokemon/${theme.sprite}.png`} alt="" /></span><span><strong>{t(theme.name)}</strong><small>{t(theme.label)}</small></span>{activeTheme.name === theme.name && <Check size={18} aria-hidden="true" />}</button>)}</div>
            <div className="widget-note"><Settings2 size={21} aria-hidden="true" /><span>{t('Além dos temas, organize apps e widgets de relógio, música, Pokédex, finanças e produtividade.')}</span></div>
          </div>
        </section>

        <section className="section features" id="recursos"><div className="container features__layout"><div className="features__intro"><span className="kicker">{t('03 / MAIS DO QUE UMA BARRA BONITA')}</span><h2>{t('Do seu jeito.')}<br /><em>{t('No seu ritmo.')}</em></h2><p>{t('O PokeDock deixa as ferramentas de todos os dias à mão, com espaço para brincar quando der vontade.')}</p><a href="#instalacao" className="text-link">{t('Ver como instalar')} <ArrowRight size={18} aria-hidden="true" /></a></div><div className="features__grid"><div className="feature-tile"><Clock3 size={25} aria-hidden="true" /><h3>{t('Encontros sob controle')}</h3><p>{t('Escolha a frequência e pause as aparições durante trabalho ou apresentações.')}</p></div><div className="feature-tile"><Music2 size={25} aria-hidden="true" /><h3>{t('Música por perto')}</h3><p>{t('Widgets para Spotify e Música mostram a faixa e oferecem controles quando conectados.')}</p></div><div className="feature-tile"><NotebookTabs size={25} aria-hidden="true" /><h3>{t('Pequenas ferramentas')}</h3><p>{t('Relógio, tarefas, notas, foco, orçamento e cotação do dólar na mesma barra.')}</p></div><div className="feature-tile"><Folder size={25} aria-hidden="true" /><h3>{t('Seus apps, sempre à mão')}</h3><p>{t('Adicione e organize aplicativos. Finder e Lixeira já vêm na configuração inicial.')}</p></div></div></div></section>

        <section className="section install" id="instalacao"><div className="container install__layout"><div className="install__copy"><span className="kicker">{t('04 / PRONTO PARA O SEU MAC?')}</span><h2>{t('Instalar é')}<br /><em>{t('simples assim.')}</em></h2><p>{t('O PokeDock é distribuído em um DMG assinado e notarizado.')}</p><DownloadLink source="installation" t={t} /><p className="install__requirement"><ShieldCheck size={17} aria-hidden="true" /> {t('Requer macOS 14 ou posterior. Compatível com Macs Intel e Apple Silicon.')}</p></div><div className="install__steps"><div><span>01</span><p><strong>{t('Baixe o DMG.')}</strong><br />{t('Salve o instalador pelo botão desta página.')}</p></div><div><span>02</span><p><strong>{t('Arraste para Aplicativos.')}</strong><br />{t('Abra o DMG e mova o aplicativo para a pasta Aplicativos.')}</p></div><div><span>03</span><p><strong>{t('Escolha o seu tema.')}</strong><br />{t('Abra a Pokédex, personalize a barra e comece a explorar.')}</p></div></div></div></section>

        <section className="section faq" id="faq"><div className="container faq__layout"><div className="section-heading"><span className="kicker">{t('AINDA TEM DÚVIDAS?')}</span><h2>{t('Manual de')}<br /><em>{t('treinador.')}</em></h2><p>{t('Algumas respostas antes de começar sua coleção.')}</p></div><div className="faq__list">{questions.map((item, index) => <div className={`faq-item${openQuestion === index ? ' faq-item--open' : ''}`} key={item.question}><button type="button" aria-expanded={openQuestion === index} onClick={() => setOpenQuestion(openQuestion === index ? null : index)}><CircleHelp size={19} aria-hidden="true" />{t(item.question)}<ChevronDown size={20} aria-hidden="true" /></button>{openQuestion === index && <p>{t(item.answer)}</p>}</div>)}</div></div></section>

        <section className="about" id="sobre"><div className="container about__layout"><div className="about__mark"><PokedexMark /></div><div><span className="kicker">{t('UM PROJETO FEITO COM CARINHO')}</span><h2>{t('Do Mac para a')}<br /><em>{t('aventura.')}</em></h2><p>{t('O PokeDock foi desenvolvido por')} <strong>Guilherme Cunha</strong>{t(', unindo a personalização do macOS ao prazer de descobrir e colecionar. É um projeto independente, criado para deixar a rotina mais divertida.')}</p></div></div></section>
      </main>

      <footer className="site-footer"><div className="container site-footer__main"><div><a className="brand" href="#inicio"><PokedexMark compact /><span>POKEDOCK<small>{t('DOCK + AVENTURA')}</small></span></a><p>{t('Um pouco mais de aventura em cada dia no Mac.')}</p></div><div className="site-footer__links"><a href="#como-funciona">{t('Como funciona')}</a><a href="#temas">{t('Temas')}</a><a href="#instalacao">{t('Instalação')}</a><a href="#faq">{t('Dúvidas')}</a></div></div><div className="container site-footer__bottom"><p>© {new Date().getFullYear()} PokeDock {t('· Desenvolvido por Guilherme Cunha.')}</p><p>{t('Projeto independente, sem afiliação com Nintendo, Game Freak ou The Pokémon Company. Sprites: PokeAPI.')}</p>{analyticsConfigured && <button type="button" onClick={() => setConsent(null)}>{t('Preferências de analytics')}</button>}</div></footer>
      {analyticsConfigured && consent === null && <ConsentBanner onChoice={chooseConsent} t={t} />}
    </>
  )
}

export default App
