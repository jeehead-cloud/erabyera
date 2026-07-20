import type { PropsWithChildren } from 'react'

export function ExternalSourceLink({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <a href={href} rel="noopener noreferrer" target="_blank">
      {children} <span className="visually-hidden">(opens in a new tab)</span>
    </a>
  )
}
