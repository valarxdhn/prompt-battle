const boardUrl = "https://miro.com/app/board/uXjVEOHilkM=/";
const embedUrl = "https://miro.com/app/live-embed/uXjVEOHilkM=/";

export default function Home() {
  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href={boardUrl} target="_blank" rel="noreferrer">
          <span className="brand-mark" aria-hidden="true">
            m
          </span>
          <span>Workspace</span>
        </a>
        <a className="open-board" href={boardUrl} target="_blank" rel="noreferrer">
          Open in Miro
        </a>
      </header>

      <section className="board-section" aria-labelledby="board-title">
        <div className="board-heading">
          <div>
            <p className="eyebrow">MIRO BOARD</p>
            <h1 id="board-title">Wireframe</h1>
          </div>
          <p className="board-hint">Changes and access are managed in Miro.</p>
        </div>
        <div className="board-frame">
          <iframe
            src={embedUrl}
            title="Miro wireframe board"
            allow="fullscreen"
            allowFullScreen
            loading="eager"
          />
        </div>
        <p className="access-note">
          If the board does not load, make sure your Miro account has access and
          open it directly in Miro.
        </p>
      </section>
    </main>
  );
}