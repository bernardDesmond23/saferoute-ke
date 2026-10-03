import React from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onLaunch: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  return (
    <div className="landing">
      <header className="landing-hero">
        <div className="landing-badge">KRCS · Humanitarian Aid Routing</div>
        <h1>
          When the road disappears,
          <br />
          the mission doesn't have to.
        </h1>
        <p className="landing-tagline">
          SafeRoute Kenya is a flood-aware routing engine for Red Cross relief convoys.
          It finds the <strong>safest</strong> path, not just the shortest — so aid actually arrives.
        </p>
        <button className="landing-cta" onClick={onLaunch}>
          Launch Dashboard →
        </button>
      </header>

      <section className="landing-section">
        <h2>The Problem</h2>
        <p>
          Standard navigation apps assume roads are permanent. During Kenya's rainy season,
          bridges vanish overnight and murram roads dissolve into mud. Between 2022 and 2026,
          floods killed over 500 people, displaced millions, and severed critical arteries like the
          Garissa–Modogashe road, the Mai Mahiu highway, and the Mwena Bridge in Kwale County.
          Aid trucks are routinely routed into flooded crossings because no system tracks road
          safety in real time.
        </p>
      </section>

      <section className="landing-section landing-grid">
        <div className="landing-card">
          <h3>Three Layers of Risk</h3>
          <ul>
            <li><strong>Static:</strong> Historical flood plains and washout records</li>
            <li><strong>Dynamic:</strong> Live weather from Open-Meteo</li>
            <li><strong>Trigger:</strong> Volunteer reports from Red Cross scouts</li>
          </ul>
        </div>
        <div className="landing-card">
          <h3>Modified Dijkstra</h3>
          <p>
            We don't minimize distance — we minimize <code>distance × risk_factor</code>.
            Submerged bridges get infinite cost, so the algorithm routes around them.
          </p>
        </div>
        <div className="landing-card">
          <h3>Built for the Field</h3>
          <p>
            Two routes side-by-side: the standard shortest path (red) and the flood-safe corridor (green).
            Coordinators see the trade-off in seconds.
          </p>
        </div>
      </section>

      <section className="landing-section">
        <h2>Built With</h2>
        <p className="landing-stack">
          AWS Lambda · Amazon API Gateway · Amazon DynamoDB · Amazon Bedrock · AWS Amplify ·
          Python · NetworkX · React · MapLibre GL · OpenStreetMap · Open-Meteo
        </p>
      </section>

      <footer className="landing-footer">
        <p>
          Built for the AWS Zero to Shipped Hackathon ·{' '}
          <a href="https://github.com/bernardDesmond23/saferoute-ke" target="_blank" rel="noreferrer">
            View source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};