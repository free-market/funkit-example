export interface SelectBarItem {
  label: string
  value: string
}

interface Props {
  items: SelectBarItem[]
  selected: string
  onSelect: (value: string) => void
}

export default function SelectBar(props: Props) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {props.items.map((item, i) => {
        const prefix = props.selected === item.value ? '✔️' : ' '
        return (
          <div
            key={i}
            onClick={() => {
              props.onSelect(item.value)
            }}
          >
            <div style={{ display: 'inline-block', width: 24 }}>{prefix}</div>
            <div style={{ display: 'inline-block', cursor: 'pointer' }}>{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}
