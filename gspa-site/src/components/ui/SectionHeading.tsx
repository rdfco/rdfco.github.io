type Props={eyebrow:string;children:React.ReactNode}
export function SectionHeading({eyebrow,children}:Props){return <><div className="eyebrow">{eyebrow}</div><h2>{children}</h2></>}
