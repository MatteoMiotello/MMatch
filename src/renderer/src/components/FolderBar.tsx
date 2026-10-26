type Props = {
  folders: string[]
  hidden: string[]
  missing: string[]
  onAdd(): void
  onToggle(folder: string): void
  onRelink(folder: string): void
}

export function FolderBar({
  folders,
  hidden,
  missing,
  onAdd,
  onToggle,
  onRelink
}: Props): React.JSX.Element {
  const available = folders.filter((f) => !hidden.includes(f) && !missing.includes(f))

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {folders.map((folder) =>
        missing.includes(folder) ? (
          <MissingChip key={folder} folder={folder} onRelink={() => onRelink(folder)} />
        ) : (
          <FolderChip
            key={folder}
            folder={folder}
            isHidden={hidden.includes(folder)}
            locked={available.length === 1 && available[0] === folder}
            onToggle={() => onToggle(folder)}
          />
        )
      )}
      <button
        onClick={onAdd}
        className="rounded-full border border-dashed border-neutral-700 px-3 py-2 text-neutral-400 hover:border-neutral-500 hover:text-white"
      >
        + Cartella
      </button>
    </div>
  )
}

type ChipProps = { folder: string; isHidden: boolean; locked: boolean; onToggle(): void }

function FolderChip({ folder, isHidden, locked, onToggle }: ChipProps): React.JSX.Element {
  const label = isHidden ? 'Mostra' : 'Oscura'

  return (
    <button
      onClick={onToggle}
      disabled={locked}
      aria-pressed={isHidden}
      title={locked ? folder : `${label}: ${folder}`}
      className={`rounded-full bg-neutral-800 px-3 py-2 enabled:hover:bg-neutral-700 ${isHidden ? 'text-neutral-500 line-through' : ''}`}
    >
      {folder.split('/').at(-1)}
    </button>
  )
}

function MissingChip({
  folder,
  onRelink
}: {
  folder: string
  onRelink(): void
}): React.JSX.Element {
  return (
    <button
      onClick={onRelink}
      title={`Non trovata: ${folder}. Clicca per scegliere dove si trova ora`}
      className="rounded-full bg-red-950 px-3 py-2 text-red-300 hover:bg-red-900"
    >
      ⚠ {folder.split('/').at(-1)}
    </button>
  )
}
