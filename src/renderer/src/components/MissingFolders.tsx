type Props = {
  folders: string[]
  onRelink(folder: string): void
  onRetry(): void
}

export function MissingFolders({ folders, onRelink, onRetry }: Props): React.JSX.Element {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-3xl bg-neutral-900 p-5 sm:p-8">
      <h2 className="text-xl font-semibold">Cartella non trovata</h2>
      <p className="text-sm text-neutral-400">
        Per continuare scegli dove si trova ora. Le track già viste e le keep restano valide.
      </p>
      <ul className="flex flex-col gap-2">
        {folders.map((folder) => (
          <li key={folder} className="flex items-center gap-3 rounded-xl bg-neutral-800 p-3">
            <span className="min-w-0 flex-1 truncate text-sm text-red-400" title={folder}>
              {folder}
            </span>
            <button
              onClick={() => onRelink(folder)}
              className="shrink-0 rounded-full bg-fuchsia-600 px-4 py-1.5 text-sm font-medium hover:bg-fuchsia-500"
            >
              Scegli cartella
            </button>
          </li>
        ))}
      </ul>
      <button onClick={onRetry} className="self-start text-sm text-neutral-400 hover:text-white">
        Hai ricollegato il disco? Riprova
      </button>
    </div>
  )
}
