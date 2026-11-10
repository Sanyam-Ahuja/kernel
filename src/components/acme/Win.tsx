import React from 'react';

export type Cmd = { label: string; onClick: () => void; pressed?: boolean; disabled?: boolean; title?: string };

/** An acme-style window: a tag line of clickable command words over a pale-yellow body. */
export const Win: React.FC<{
  name: string;
  cmds?: Cmd[];
  aside?: React.ReactNode;
  dirty?: boolean;
  thumb?: number;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}> = ({ name, cmds = [], aside, dirty, thumb = 35, className = '', bodyClassName = '', children }) => (
  <section className={`win ${className}`} aria-label={name}>
    <div className="tagline">
      <span className={`layoutbox ${dirty ? 'dirty' : ''}`} aria-hidden />
      <span className="font-semibold pr-2 font-mono text-[13.5px]">{name}</span>
      {cmds.map((c) => (
        <button
          key={c.label}
          type="button"
          className="cmd disabled:opacity-40"
          onClick={c.onClick}
          disabled={c.disabled}
          aria-pressed={c.pressed}
          title={c.title}
        >
          {c.label}
        </button>
      ))}
      {aside && <span className="ml-auto pl-3 text-[13px] text-faded font-mono">{aside}</span>}
    </div>
    <div className="winbody">
      <div className="gutter" style={{ ['--thumb' as string]: `${thumb}%` }} aria-hidden />
      <div className={`bodytext ${bodyClassName}`}>{children}</div>
    </div>
  </section>
);

/** Key/value lines, the way `free` or `vmstat` would print them. */
export const Stat: React.FC<{ rows: [string, React.ReactNode, string?][] }> = ({ rows }) => (
  <dl className="font-mono text-[14px] grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5">
    {rows.map(([k, v, note]) => (
      <React.Fragment key={k}>
        <dt className="k">{k}</dt>
        <dd>
          <b className="text-[17px]">{v}</b>
          {note && <span className="k ml-2 text-[12.5px]">{note}</span>}
        </dd>
      </React.Fragment>
    ))}
  </dl>
);
