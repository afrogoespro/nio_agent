import type { IcpExample } from '../types/plan'

interface IcpCardProps {
  icp: IcpExample
}

export function IcpCard({ icp }: IcpCardProps) {
  return (
    <article className="icp-card">
      <p className="icp-card__badge">Lead your rep found (example)</p>
      <h3 className="icp-card__name">{icp.name}</h3>
      <p className="icp-card__meta">
        {icp.title} · {icp.companyType}
      </p>
      <p className="icp-card__disclaimer">
        Sample lead your rep made up to show you who to look for. Not pulled from
        the web.
      </p>
      <ul className="icp-card__why">
        {icp.whyFit.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </article>
  )
}
