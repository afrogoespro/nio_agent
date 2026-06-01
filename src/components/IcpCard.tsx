import type { IcpExample } from '../types/plan'

interface IcpCardProps {
  icp: IcpExample
}

export function IcpCard({ icp }: IcpCardProps) {
  const isReal = icp.source === 'apollo'

  return (
    <article className={`icp-card ${isReal ? 'icp-card--real' : ''}`}>
      <p className="icp-card__badge">
        {isReal ? 'Lead we found for you' : 'Example lead (no Apollo match)'}
      </p>
      <h3 className="icp-card__name">{icp.name}</h3>
      <p className="icp-card__meta">
        {icp.title} at {icp.companyName}
      </p>
      <p className="icp-card__found">{icp.foundVia}</p>
      {!isReal && (
        <p className="icp-card__disclaimer">
          We could not pull a live contact this time. This shows the kind of person
          to look for. Try again from Launch with Apollo connected.
        </p>
      )}
      <ul className="icp-card__why">
        {icp.whyFit.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </article>
  )
}
