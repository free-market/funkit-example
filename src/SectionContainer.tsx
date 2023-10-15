import React from 'react'

interface SectionContainerProps {
  title: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function SectionContainer(props: SectionContainerProps) {
  return (
    <div style={{ border: '1px solid #333', ...props.style }}>
      <div style={{ backgroundColor: '#333', padding: 6 }}>{props.title}</div>
      <div style={{ padding: 6 }}>{props.children}</div>
    </div>
  )
}
